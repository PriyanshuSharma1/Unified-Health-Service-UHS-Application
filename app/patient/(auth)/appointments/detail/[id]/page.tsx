'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
	CalendarIcon,
	ClockIcon,
	MapPinIcon,
	ArrowLeftIcon,
	UserIcon,
	BuildingIcon,
	PhoneIcon,
	MailIcon,
	CheckCircleIcon,
	XCircleIcon,
	AlertCircleIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface Hospital {
	_id: string;
	name: string;
	state: string;
	city: string;
	country: string;
	address: string;
	postalCode: string;
	contactNumber: string;
	email: string;
}

interface Patient {
	_id: string;
	firstName: string;
	lastName: string;
	age: number;
	gender: string;
	contactNumber: string;
	email: string;
}

interface Doctor {
	_id: string;
	firstName: string;
	lastName: string;
	specialization: string;
	contactNumber: string;
	email: string;
	hospital: string;
	country: string;
	city: string;
	state: string;
	address: string;
	experience: number;
	education: string;
	age: number;
}

interface Appointment {
	_id: string;
	hospitalId: Hospital;
	patientId: Patient;
	doctorId: Doctor;
	appointmentDate: string;
	appointmentTime: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

export default function AppointmentDetailPage() {
	const router = useRouter();
	const params = useParams();
	const appointmentId = params.id as string;

	const [appointment, setAppointment] = useState<Appointment | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cancelling, setCancelling] = useState(false);

	useEffect(() => {
		const fetchAppointmentDetails = async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem('patientToken');

				if (!token) {
					router.push('/patient/signin');
					return;
				}

				const response = await axios.get(
					`http://localhost:8000/appointments/${appointmentId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.data && response.data.status === 'success') {
					setAppointment(response.data.data.appointment);
				}
			} catch (err) {
				console.error('Error fetching appointment details:', err);
				setError('Failed to load appointment details. Please try again.');
			} finally {
				setLoading(false);
			}
		};

		fetchAppointmentDetails();
	}, [appointmentId, router]);

	const handleCancelAppointment = async () => {
		if (!appointment) return;

		try {
			setCancelling(true);
			const token = localStorage.getItem('patientToken');

			await axios.patch(
				`http://localhost:8000/appointments/status/${appointment._id}`,
				{ status: 'cancelled' },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			// Update local state
			setAppointment({
				...appointment,
				status: 'cancelled',
			});
		} catch (err) {
			console.error('Error cancelling appointment:', err);
			setError('Failed to cancel appointment. Please try again.');
		} finally {
			setCancelling(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case 'scheduled':
			case 'pending':
				return <Badge className='bg-blue-600 text-white'>Pending</Badge>;
			case 'confirmed':
				return (
					<Badge className='bg-primary text-primary-foreground'>
						Confirmed
					</Badge>
				);
			case 'completed':
				return <Badge className='bg-green-600 text-white'>Completed</Badge>;
			case 'cancelled':
				return <Badge className='bg-red-600 text-white'>Cancelled</Badge>;
			case 'no-show':
				return <Badge className='bg-amber-600 text-white'>No Show</Badge>;
			default:
				return <Badge className='bg-gray-500 text-white'>{status}</Badge>;
		}
	};

	const isUpcoming =
		appointment &&
		new Date(appointment.appointmentDate) > new Date() &&
		!['cancelled', 'completed', 'no-show'].includes(
			appointment.status.toLowerCase()
		);

	if (loading) {
		return (
			<div className='container max-w-3xl mx-auto px-4 py-8'>
				<div className='flex items-center mb-6'>
					<Button
						variant='ghost'
						size='sm'
						className='mr-2'
						onClick={() => router.back()}
					>
						<ArrowLeftIcon className='h-4 w-4 mr-2' />
						Back
					</Button>
					<Skeleton className='h-8 w-64' />
				</div>

				<Card>
					<CardHeader>
						<Skeleton className='h-8 w-48 mb-2' />
						<Skeleton className='h-5 w-32' />
					</CardHeader>
					<CardContent className='space-y-6'>
						<div className='space-y-4'>
							<Skeleton className='h-5 w-full' />
							<Skeleton className='h-5 w-3/4' />
							<Skeleton className='h-5 w-2/3' />
						</div>
						<Separator />
						<div className='space-y-4'>
							<Skeleton className='h-5 w-full' />
							<Skeleton className='h-5 w-3/4' />
						</div>
						<Separator />
						<div className='space-y-4'>
							<Skeleton className='h-5 w-full' />
							<Skeleton className='h-5 w-3/4' />
							<Skeleton className='h-5 w-2/3' />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error || !appointment) {
		return (
			<div className='container max-w-3xl mx-auto px-4 py-8'>
				<div className='flex items-center mb-6'>
					<Button variant='ghost' size='sm' onClick={() => router.back()}>
						<ArrowLeftIcon className='h-4 w-4 mr-2' />
						Back
					</Button>
				</div>

				<Card>
					<CardContent className='flex flex-col items-center justify-center py-12'>
						<AlertCircleIcon className='h-16 w-16 text-red-500 mb-4' />
						<h2 className='text-xl font-semibold mb-2'>
							Error Loading Appointment
						</h2>
						<p className='text-gray-500 mb-6'>
							{error ||
								'The appointment could not be found or has been removed.'}
						</p>
						<Button onClick={() => router.push('/patient/appointments')}>
							View All Appointments
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const appointmentDate = parseISO(appointment.appointmentDate);
	const formattedDate = format(appointmentDate, 'EEEE, MMMM d, yyyy');
	const formattedTime = appointment.appointmentTime
		? appointment.appointmentTime
		: format(appointmentDate, 'h:mm a');

	return (
		<div className='container max-w-3xl mx-auto px-4 py-8'>
			<div className='flex items-center mb-6'>
				<Button
					variant='ghost'
					size='sm'
					className='mr-4'
					onClick={() => router.back()}
				>
					<ArrowLeftIcon className='h-4 w-4 mr-2' />
					Back
				</Button>
			</div>
			<h1 className='text-2xl font-bold text-primary mb-6'>
				Appointment Details
			</h1>

			<Card className='mb-6 overflow-hidden shadow-md border-t-4 border-t-primary'>
				<CardHeader className='pb-2'>
					<div className='flex justify-between items-start'>
						<div>
							<CardTitle className='text-primary text-xl'>
								Appointment with Dr. {appointment.doctorId.firstName}{' '}
								{appointment.doctorId.lastName}
							</CardTitle>
							<p className='text-sm text-gray-500 mt-1'>
								{appointment.doctorId.specialization} •{' '}
								{appointment.doctorId.experience} years exp
							</p>
						</div>
						{getStatusBadge(appointment.status)}
					</div>
				</CardHeader>

				<CardContent className='pt-4'>
					<div className='grid gap-6'>
						<div className='grid gap-3'>
							<div className='flex items-center'>
								<CalendarIcon className='h-5 w-5 mr-3 text-primary' />
								<div>
									<p className='font-medium'>Date</p>
									<p className='text-gray-600'>{formattedDate}</p>
								</div>
							</div>

							<div className='flex items-center'>
								<ClockIcon className='h-5 w-5 mr-3 text-primary' />
								<div>
									<p className='font-medium'>Time</p>
									<p className='text-gray-600'>{formattedTime}</p>
								</div>
							</div>

							<div className='flex items-center'>
								<MapPinIcon className='h-5 w-5 mr-3 text-primary' />
								<div>
									<p className='font-medium'>Location</p>
									<p className='text-gray-600 font-medium'>
										{appointment.hospitalId.name}
									</p>
									<p className='text-gray-500 text-sm'>
										{appointment.hospitalId.address},{' '}
										{appointment.hospitalId.city},{' '}
										{appointment.hospitalId.state}{' '}
										{appointment.hospitalId.postalCode}
									</p>
								</div>
							</div>
						</div>

						<Separator />

						<div>
							<h3 className='font-semibold text-gray-700 mb-3'>
								Hospital Information
							</h3>
							<div className='grid gap-2'>
								<div className='flex items-center'>
									<BuildingIcon className='h-4 w-4 mr-2 text-gray-500' />
									<span className='text-gray-600'>
										{appointment.hospitalId.name}
									</span>
								</div>
								<div className='flex items-center'>
									<PhoneIcon className='h-4 w-4 mr-2 text-gray-500' />
									<span className='text-gray-600'>
										{appointment.hospitalId.contactNumber}
									</span>
								</div>
								<div className='flex items-center'>
									<MailIcon className='h-4 w-4 mr-2 text-gray-500' />
									<span className='text-gray-600'>
										{appointment.hospitalId.email}
									</span>
								</div>
							</div>
						</div>

						<Separator />

						<div>
							<h3 className='font-semibold text-gray-700 mb-3'>
								Doctor Information
							</h3>
							<div className='grid gap-2'>
								<div className='flex items-center'>
									<UserIcon className='h-4 w-4 mr-2 text-gray-500' />
									<span className='text-gray-600'>
										Dr. {appointment.doctorId.firstName}{' '}
										{appointment.doctorId.lastName}
									</span>
								</div>
								<div className='flex items-center'>
									<PhoneIcon className='h-4 w-4 mr-2 text-gray-500' />
									<span className='text-gray-600'>
										{appointment.doctorId.contactNumber}
									</span>
								</div>
								<div className='flex items-center'>
									<MailIcon className='h-4 w-4 mr-2 text-gray-500' />
									<span className='text-gray-600'>
										{appointment.doctorId.email}
									</span>
								</div>
							</div>
						</div>

						{isUpcoming && (
							<>
								<Separator />
								<div className='flex flex-col sm:flex-row gap-3'>
									<Button
										variant='outline'
										className='flex-1'
										onClick={() =>
											router.push(`/patient/reschedule/${appointment._id}`)
										}
									>
										Reschedule
									</Button>

									<Button
										variant='destructive'
										className='flex-1'
										onClick={handleCancelAppointment}
										disabled={cancelling}
									>
										{cancelling ? 'Cancelling...' : 'Cancel Appointment'}
									</Button>
								</div>
							</>
						)}

						{appointment.status.toLowerCase() === 'completed' && (
							<>
								<Separator />
								<div className='bg-green-50 p-4 rounded-md flex items-start'>
									<CheckCircleIcon className='h-5 w-5 text-green-500 mr-3 mt-0.5' />
									<div>
										<h4 className='font-medium text-green-800'>
											Appointment Completed
										</h4>
										<p className='text-sm text-green-700'>
											This appointment has been completed. You can book a
											follow-up appointment if needed.
										</p>
									</div>
								</div>
							</>
						)}

						{appointment.status.toLowerCase() === 'cancelled' && (
							<>
								<Separator />
								<div className='bg-red-50 p-4 rounded-md flex items-start'>
									<XCircleIcon className='h-5 w-5 text-red-500 mr-3 mt-0.5' />
									<div>
										<h4 className='font-medium text-red-800'>
											Appointment Cancelled
										</h4>
										<p className='text-sm text-red-700'>
											This appointment has been cancelled. You can book a new
											appointment if needed.
										</p>
										<Button
											variant='outline'
											size='sm'
											className='mt-3 bg-white'
											onClick={() => router.push('/search/doctors')}
										>
											Book New Appointment
										</Button>
									</div>
								</div>
							</>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
