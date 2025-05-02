'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
	CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

interface Appointment {
	_id: string;
	patientId: {
		_id: string;
		firstName: string;
		lastName: string;
		gender: string;
		age: number;
	};
	appointmentDate: string;
	appointmentTime: string;
	status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'pending';
	reason?: string;
	createdAt: string;
	hospitalId: {
		name: string;
		address: string;
	};
}

export default function DoctorAppointments() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const router = useRouter();

	// Helper function to safely parse dates
	const parseAppointmentDate = (dateString: string): Date => {
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) {
				console.error('Invalid date format:', dateString);
				return new Date();
			}
			return date;
		} catch (error) {
			console.error('Error parsing date:', error);
			return new Date();
		}
	};

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				const token = localStorage.getItem('doctorToken');
				if (!token) {
					router.push('/doctor/signin');
					return;
				}

				const res = await axios.get(
					'http://localhost:8000/appointments/doctor',
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (res.data && res.data.data && res.data.data.appointments) {
					setAppointments(res.data.data.appointments);
					console.log('Fetched appointments:', res.data.data.appointments);
				} else {
					setAppointments([]);
				}
			} catch (err: any) {
				console.error('Error fetching appointments:', err);
				setError('Failed to load appointments');
			} finally {
				setLoading(false);
			}
		};

		fetchAppointments();
	}, [router]);

	const updateAppointmentStatus = async (
		appointmentId: string,
		newStatus: string
	) => {
		try {
			const token = localStorage.getItem('doctorToken');
			await axios.patch(
				`http://localhost:8000/appointment/${appointmentId}/status`,
				{ status: newStatus },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			// Update local state
			setAppointments(
				appointments.map((appointment) =>
					appointment._id === appointmentId
						? { ...appointment, status: newStatus as any }
						: appointment
				)
			);

			alert(`Appointment marked as ${newStatus}`);
		} catch (err) {
			console.error('Error updating appointment status:', err);
			alert('Failed to update appointment status');
		}
	};

	// Filter appointments based on date and status
	const todayAppointments = appointments.filter((appointment) => {
		const appointmentDate = parseAppointmentDate(appointment.appointmentDate);
		const today = new Date();

		return (
			appointmentDate.getDate() === today.getDate() &&
			appointmentDate.getMonth() === today.getMonth() &&
			appointmentDate.getFullYear() === today.getFullYear() &&
			['scheduled', 'pending'].includes(appointment.status)
		);
	});

	const upcomingAppointments = appointments.filter((appointment) => {
		const appointmentDate = parseAppointmentDate(appointment.appointmentDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Set time components of appointment date to 0 for date comparison
		const appointmentDateOnly = new Date(appointmentDate);
		appointmentDateOnly.setHours(0, 0, 0, 0);

		return (
			appointmentDateOnly > today &&
			['scheduled', 'pending'].includes(appointment.status)
		);
	});

	const pastAppointments = appointments.filter((appointment) => {
		const appointmentDate = parseAppointmentDate(appointment.appointmentDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Set time components of appointment date to 0 for date comparison
		const appointmentDateOnly = new Date(appointmentDate);
		appointmentDateOnly.setHours(0, 0, 0, 0);

		return (
			appointmentDateOnly < today ||
			['completed', 'cancelled', 'no-show'].includes(appointment.status)
		);
	});

	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case 'scheduled':
				return <Badge className='bg-primary text-white'>Scheduled</Badge>;
			case 'pending':
				return <Badge className='bg-yellow-500 text-yellow-900'>Pending</Badge>;
			case 'completed':
				return <Badge className='bg-green-600 text-white'>Completed</Badge>;
			case 'cancelled':
				return <Badge className='bg-red-600 text-white'>Cancelled</Badge>;
			case 'no-show':
				return <Badge className='bg-gray-600 text-white'>No Show</Badge>;
			default:
				return <Badge className='bg-gray-400'>Unknown</Badge>;
		}
	};

	const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
		const appointmentDate = parseAppointmentDate(appointment.appointmentDate);
		const isPast =
			appointmentDate < new Date() ||
			['completed', 'cancelled', 'no-show'].includes(appointment.status);

		// Format the time from appointmentTime field if available
		const displayTime =
			appointment.appointmentTime || format(appointmentDate, 'h:mm a');

		return (
			<Card className='mb-4 overflow-hidden border-l-4 border-l-primary'>
				<CardHeader className='pb-2'>
					<div className='flex justify-between items-start'>
						<div>
							<CardTitle className='text-primary text-lg'>
								{appointment.patientId.firstName}{' '}
								{appointment.patientId.lastName}
							</CardTitle>
							<CardDescription className='text-sm'>
								{appointment.patientId.gender}, {appointment.patientId.age}{' '}
								years
							</CardDescription>
						</div>
						{getStatusBadge(appointment.status)}
					</div>
				</CardHeader>
				<CardContent className='pb-2'>
					<div className='grid gap-1'>
						<div className='flex items-center text-sm'>
							<Calendar className='h-4 w-4 mr-2 text-primary' />
							<span>{format(appointmentDate, 'EEEE, MMMM d, yyyy')}</span>
						</div>
						<div className='flex items-center text-sm'>
							<Clock className='h-4 w-4 mr-2 text-primary' />
							<span>{displayTime}</span>
						</div>
						{appointment.hospitalId && (
							<div className='flex items-center text-sm'>
								<MapPin className='h-4 w-4 mr-2 text-primary' />
								<span>{appointment.hospitalId.name}</span>
							</div>
						)}
						{appointment.reason && (
							<div className='mt-2 text-sm'>
								<span className='font-medium'>Reason: </span>
								<span>{appointment.reason}</span>
							</div>
						)}
					</div>
				</CardContent>
				<CardFooter className='pt-2 flex justify-between'>
					<Button
						variant='outline'
						size='sm'
						onClick={() =>
							router.push(`/doctor/appointments/${appointment._id}`)
						}
					>
						View Details
					</Button>

					{!isPast && (
						<div className='flex gap-2'>
							<Button
								variant='default'
								size='sm'
								className='bg-green-600 hover:bg-green-700'
								onClick={() =>
									updateAppointmentStatus(appointment._id, 'completed')
								}
							>
								Complete
							</Button>
							<Button
								variant='outline'
								size='sm'
								className='border-red-600 text-red-600 hover:bg-red-50'
								onClick={() =>
									updateAppointmentStatus(appointment._id, 'no-show')
								}
							>
								No Show
							</Button>
						</div>
					)}
				</CardFooter>
			</Card>
		);
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6'>
				<h1 className='text-3xl font-bold text-primary mb-8'>
					My Appointments
				</h1>
				<div className='space-y-4'>
					{[1, 2, 3].map((i) => (
						<Card key={i} className='overflow-hidden'>
							<CardHeader className='pb-2'>
								<Skeleton className='h-6 w-48' />
								<Skeleton className='h-4 w-24 mt-2' />
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-2/3' />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center'>
				<Card className='max-w-md w-full'>
					<CardHeader>
						<CardTitle className='text-red-600'>Error</CardTitle>
					</CardHeader>
					<CardContent>
						<p>{error}</p>
						<Button
							className='mt-4 bg-primary'
							onClick={() => window.location.reload()}
						>
							Try Again
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6'>
			<h1 className='text-3xl font-bold text-primary mb-6'>My Appointments</h1>

			<Tabs defaultValue='today' className='w-full mb-6'>
				<TabsList className='grid w-full grid-cols-3 mb-8'>
					<TabsTrigger
						value='today'
						className='data-[state=active]:bg-primary data-[state=active]:text-white'
					>
						Today ({todayAppointments.length})
					</TabsTrigger>
					<TabsTrigger
						value='upcoming'
						className='data-[state=active]:bg-primary data-[state=active]:text-white'
					>
						Upcoming ({upcomingAppointments.length})
					</TabsTrigger>
					<TabsTrigger
						value='past'
						className='data-[state=active]:bg-primary data-[state=active]:text-white'
					>
						Past ({pastAppointments.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value='today' className='mt-0'>
					{todayAppointments.length > 0 ? (
						<div className='space-y-4'>
							{todayAppointments.map((appointment) => (
								<AppointmentCard
									key={appointment._id}
									appointment={appointment}
								/>
							))}
						</div>
					) : (
						<Card className='bg-white'>
							<CardContent className='p-8 text-center'>
								<h3 className='font-medium text-lg'>
									No appointments scheduled for today
								</h3>
								<p className='text-gray-500 mt-2'>
									You have no appointments scheduled for today.
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value='upcoming' className='mt-0'>
					{upcomingAppointments.length > 0 ? (
						<div className='space-y-4'>
							{upcomingAppointments.map((appointment) => (
								<AppointmentCard
									key={appointment._id}
									appointment={appointment}
								/>
							))}
						</div>
					) : (
						<Card className='bg-white'>
							<CardContent className='p-8 text-center'>
								<h3 className='font-medium text-lg'>
									No upcoming appointments
								</h3>
								<p className='text-gray-500 mt-2'>
									You have no upcoming appointments scheduled.
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value='past' className='mt-0'>
					{pastAppointments.length > 0 ? (
						<div className='space-y-4'>
							{pastAppointments.map((appointment) => (
								<AppointmentCard
									key={appointment._id}
									appointment={appointment}
								/>
							))}
						</div>
					) : (
						<Card className='bg-white'>
							<CardContent className='p-8 text-center'>
								<h3 className='font-medium text-lg'>No past appointments</h3>
								<p className='text-gray-500 mt-2'>
									Your appointment history will appear here.
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
