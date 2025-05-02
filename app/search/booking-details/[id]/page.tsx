'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

interface Appointment {
	_id: string;
	date: string;
	time: string;
	status: string;
	doctor: {
		firstName: string;
		lastName: string;
		specialization: string;
	};
	hospital: {
		name: string;
		location: string;
	};
	patient: {
		firstName: string;
		lastName: string;
	};
}

export default function BookingDetailsScreen() {
	const [appointment, setAppointment] = useState<Appointment | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const params = useParams();
	const appointmentId = params.id;
	console.log('appointment id', appointmentId);

	useEffect(() => {
		const fetchBookingDetails = async () => {
			try {
				const token = localStorage.getItem('patientToken');
				const res = await axios.get(
					`http://localhost:8000/appointment/booking/${appointmentId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				setAppointment(res.data.data);
			} catch (err) {
				setError('Failed to load booking details');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchBookingDetails();
	}, [appointmentId]);

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-white'>
				<p className='text-blue-600 font-medium'>Loading booking...</p>
			</div>
		);
	}

	if (error || !appointment) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-white'>
				<p className='text-red-600 font-medium'>
					{error || 'Booking not found.'}
				</p>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-white px-6 py-10'>
			<button
				onClick={() => (window.location.href = '/dashboard')}
				className='mb-6 px-4 py-2 bg-primary text-white font-medium rounded hover:bg-primary/80 transition'
			>
				← Back to Dashboard
			</button>
			<Card className='max-w-2xl mx-auto shadow-xl'>
				<CardHeader className='text-center'>
					<CardTitle className='text-3xl text-blue-900 font-extrabold'>
						Appointment Summary
					</CardTitle>
					<p className='text-sm text-muted-foreground'>
						Here's everything you need to know about your appointment
					</p>
				</CardHeader>
				<Separator className='mb-4' />
				<CardContent className='space-y-6'>
					<div>
						<h4 className='font-medium text-gray-700'>Appointment ID</h4>
						<p className='text-sm text-gray-800'>{appointment._id}</p>
					</div>
					<div>
						<h4 className='font-medium text-gray-700'>Date & Time</h4>
						<p className='text-sm text-gray-800'>
							📅{' '}
							{new Date(appointment.date).toLocaleDateString('en-US', {
								weekday: 'long',
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}{' '}
							at 🕒{' '}
							{new Date(appointment.date).toLocaleTimeString('en-US', {
								hour: '2-digit',
								minute: '2-digit',
								hour12: true,
							})}
						</p>
					</div>
					<div>
						<h4 className='font-medium text-gray-700'>Status</h4>
						<Badge
							variant='outline'
							className={`capitalize ${
								appointment.status === 'confirmed'
									? 'border-green-500 text-green-700'
									: appointment.status === 'pending'
									? 'border-yellow-500 text-yellow-700'
									: 'border-red-500 text-red-700'
							}`}
						>
							{appointment.status}
						</Badge>
					</div>
					<div>
						<h4 className='font-medium text-gray-700'>Doctor</h4>
						<p className='text-sm text-gray-800'>
							Dr. {appointment.doctor.firstName} {appointment.doctor.lastName} —{' '}
							{appointment.doctor.specialization}
						</p>
					</div>
					<div>
						<h4 className='font-medium text-gray-700'>Hospital</h4>
						<p className='text-sm text-gray-800'>
							{appointment.hospital.name}, {appointment.hospital.location}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
