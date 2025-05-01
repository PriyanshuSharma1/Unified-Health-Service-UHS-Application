'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format, parseISO, isValid } from 'date-fns';
import {
	Calendar,
	Clock,
	MapPin,
	Plus,
	CheckCircle,
	XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface Appointment {
	_id: string;
	doctorId: {
		_id: string;
		firstName: string;
		lastName: string;
		specialization: string;
	};
	appointmentDate: string;
	appointmentTime: string;
	status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
	reason: string;
	createdAt: string;
	hospitalId?: {
		name: string;
		address: string;
	};
}

export default function PatientAppointments() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [cancelId, setCancelId] = useState<string | null>(null);
	const [cancelLoading, setCancelLoading] = useState(false);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

	// Helper function to safely parse dates
	const parseAppointmentDate = (dateString: string): Date => {
		try {
			const date = new Date(dateString);
			if (!isValid(date)) {
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
				setLoading(true);
				const token = localStorage.getItem('patientToken');

				if (!token) {
					router.push('/patient/signin');
					return;
				}

				const response = await axios.get(
					'http://localhost:8000/appointments/patient',
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.data) {
					const appointmentsData = response.data.data.appointments;
					console.log('Appointments data:', appointmentsData);

					// Map and format data if needed
					const formattedAppointments = appointmentsData.map((app: any) => ({
						...app,
						// Ensure we have consistent property names
						appointmentDate: app.appointmentDate || app.date,
					}));

					setAppointments(formattedAppointments);
				}
			} catch (error) {
				console.error('Error fetching appointments:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchAppointments();
	}, []);

	const handleCancelAppointment = async () => {
		if (!cancelId) return;

		try {
			setCancelLoading(true);
			const token = localStorage.getItem('patientToken');

			await axios.patch(
				`http://localhost:8000/appointment/${cancelId}/status`,
				{ status: 'cancelled' },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			// Update local state
			setAppointments(
				appointments.map((appointment) =>
					appointment._id === cancelId
						? { ...appointment, status: 'cancelled' }
						: appointment
				)
			);

			setCancelDialogOpen(false);
		} catch (error) {
			console.error('Error cancelling appointment:', error);
		} finally {
			setCancelLoading(false);
			setCancelId(null);
		}
	};

	// Update the filtering logic to properly consider both date and time
	const upcomingAppointments = appointments.filter((appointment) => {
		// Create a date object for the appointment date
		const appointmentDate = parseAppointmentDate(appointment.appointmentDate);

		// Extract the time from appointmentTime (format: "HH:MM")
		if (appointment.appointmentTime) {
			const [hours, minutes] = appointment.appointmentTime
				.split(':')
				.map(Number);

			// Set the appointment time on the date object
			appointmentDate.setHours(hours, minutes, 0, 0);
		}

		// Compare with current date and time
		return appointmentDate > new Date() && appointment.status !== 'cancelled';
	});

	const pastAppointments = appointments.filter((appointment) => {
		// Create a date object for the appointment date
		const appointmentDate = parseAppointmentDate(appointment.appointmentDate);

		// Extract the time from appointmentTime (format: "HH:MM")
		if (appointment.appointmentTime) {
			const [hours, minutes] = appointment.appointmentTime
				.split(':')
				.map(Number);

			// Set the appointment time on the date object
			appointmentDate.setHours(hours, minutes, 0, 0);
		}

		// Compare with current date and time
		return appointmentDate < new Date() || appointment.status !== 'scheduled';
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'confirmed':
				return (
					<Badge className='bg-primary text-primary-foreground'>
						Confirmed
					</Badge>
				);
			case 'pending':
				return <Badge className='bg-yellow-500 text-yellow-900'>Pending</Badge>;
			case 'completed':
				return <Badge className='bg-green-600'>Completed</Badge>;
			case 'cancelled':
				return <Badge className='bg-red-600'>Cancelled</Badge>;
			case 'no-show':
				return <Badge className='bg-amber-600'>No Show</Badge>;
			default:
				return <Badge className='bg-gray-500'>Unknown</Badge>;
		}
	};

	const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
		// Parse date safely
		const appointmentDate = parseAppointmentDate(appointment.appointmentDate);
		const isPast =
			appointmentDate < new Date() || appointment.status !== 'scheduled';

		// Format time from appointmentTime field if available
		const displayTime = appointment.appointmentTime
			? format(parseISO(`2000-01-01T${appointment.appointmentTime}`), 'h:mm a')
			: format(appointmentDate, 'h:mm a');

		return (
			<Card className='mb-4 overflow-hidden border-l-4 border-l-primary'>
				<CardHeader className='pb-2'>
					<div className='flex justify-between items-start'>
						<div>
							<CardTitle className='text-primary text-lg'>
								Dr. {appointment.doctorId.firstName}{' '}
								{appointment.doctorId.lastName}
							</CardTitle>
							<CardDescription className='text-sm'>
								{appointment.doctorId.specialization}
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
							router.push(`/patient/appointments/detail/${appointment._id}`)
						}
					>
						View Details
					</Button>

					{!isPast && appointment.status === 'scheduled' && (
						<Button
							variant='destructive'
							size='sm'
							onClick={() => {
								setCancelId(appointment._id);
								setCancelDialogOpen(true);
							}}
						>
							Cancel
						</Button>
					)}
				</CardFooter>
			</Card>
		);
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center min-h-[60vh]'>
				<div className='text-center'>
					<div className='w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4'></div>
					<p className='text-primary font-medium'>Loading appointments...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='container max-w-4xl mx-auto px-4 py-8'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold text-primary'>My Appointments</h1>
				<Button
					className='bg-primary hover:bg-primary/90 text-white'
					onClick={() => router.push('/patient/appointments/booking')}
				>
					<Plus className='h-4 w-4 mr-2' /> Book New Appointment
				</Button>
			</div>

			<Tabs defaultValue='upcoming' className='w-full'>
				<TabsList className='grid w-full grid-cols-2 mb-8'>
					<TabsTrigger
						value='upcoming'
						className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
					>
						Upcoming ({upcomingAppointments.length})
					</TabsTrigger>
					<TabsTrigger
						value='past'
						className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
					>
						Past ({pastAppointments.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value='upcoming' className='mt-0'>
					{upcomingAppointments.length > 0 ? (
						upcomingAppointments.map((appointment) => (
							<AppointmentCard
								key={appointment._id}
								appointment={appointment}
							/>
						))
					) : (
						<div className='p-8 text-center bg-muted rounded-lg'>
							<h3 className='font-medium text-lg mb-2'>
								No upcoming appointments
							</h3>
							<p className='text-muted-foreground mb-4'>
								Book an appointment with a doctor to get started
							</p>
							<Button
								className='bg-primary hover:bg-primary/90'
								onClick={() => router.push('/search/doctors')}
							>
								Find Doctors
							</Button>
						</div>
					)}
				</TabsContent>

				<TabsContent value='past' className='mt-0'>
					{pastAppointments.length > 0 ? (
						pastAppointments.map((appointment) => (
							<AppointmentCard
								key={appointment._id}
								appointment={appointment}
							/>
						))
					) : (
						<div className='p-8 text-center bg-muted rounded-lg'>
							<h3 className='font-medium text-lg'>No past appointments</h3>
							<p className='text-muted-foreground'>
								Your appointment history will appear here
							</p>
						</div>
					)}
				</TabsContent>
			</Tabs>

			<Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className='text-primary'>
							Cancel Appointment
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to cancel this appointment? This action
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setCancelDialogOpen(false)}
							disabled={cancelLoading}
						>
							Keep Appointment
						</Button>
						<Button
							variant='destructive'
							onClick={handleCancelAppointment}
							disabled={cancelLoading}
						>
							{cancelLoading ? 'Cancelling...' : 'Yes, Cancel Appointment'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
