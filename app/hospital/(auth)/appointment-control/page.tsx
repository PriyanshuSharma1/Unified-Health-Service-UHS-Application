'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

interface Appointment {
	_id: string;
	appointmentDate: string;
	appointmentTime: string;
	status: string;
	doctorId: {
		firstName: string;
		lastName: string;
		specialization: string;
	};
	hospitalId: {
		name: string;
		address: string;
	};
	patientId: {
		firstName: string;
		lastName: string;
	};
}

export default function HospitalAppointments() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const router = useRouter();

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				const token = localStorage.getItem('hospitalToken');
				const res = await fetch('http://localhost:8000/appointments/hospital', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const data = await res.json();
				setAppointments(data.data.appointments);
			} catch (err) {
				setError('Failed to load appointments');
			} finally {
				setLoading(false);
			}
		};
		fetchAppointments();
	}, []);

	const updateStatus = async (id: string, status: string) => {
		try {
			const token = localStorage.getItem('hospitalToken');
			await fetch(`http://localhost:8000/appointments/status/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ status }),
			});
			setAppointments((prev) =>
				prev.map((appt) => (appt._id === id ? { ...appt, status } : appt))
			);
		} catch (error) {
			console.error('Error updating status', error);
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-primary text-lg font-medium'>
					Loading appointments...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-red-600 text-lg font-medium'>{error}</p>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-muted px-6 py-8'>
			<div className='container mx-auto'>
				<Button
					variant='outline'
					className='mb-4'
					onClick={() => router.push('/hospital/dashboard')}
				>
					← Back to Dashboard
				</Button>
				<h1 className='text-3xl font-extrabold text-accent mb-6'>
					Appointments to Review
				</h1>

				<div className='space-y-6'>
					{appointments.length > 0 ? (
						appointments.map((item) => (
							<Card key={item._id} className='border shadow-sm'>
								<CardHeader>
									<CardTitle className='text-xl text-blue-900'>
										Dr. {item.doctorId.firstName} {item.doctorId.lastName} (
										{item.doctorId.specialization})
									</CardTitle>
									<p className='text-sm text-gray-500'>
										Patient Name: {item.patientId.firstName}{' '}
										{item.patientId.lastName}
									</p>
									<p className='text-sm text-gray-500'>
										📅 {new Date(item.appointmentDate).toDateString()} — 🕒{' '}
										{item.appointmentTime}
									</p>
									<p className='text-sm text-gray-500'>
										🏥 {item.hospitalId.name}, {item.hospitalId.address}
									</p>
									<p
										className={`font-medium ${
											item.status === 'pending'
												? 'text-yellow-600'
												: item.status === 'confirmed'
												? 'text-green-600'
												: 'text-red-600'
										}`}
									>
										Status: {item.status}
									</p>
								</CardHeader>
								<CardContent className='space-y-3'>
									<Select
										onValueChange={(value) => updateStatus(item._id, value)}
										defaultValue={item.status}
									>
										<SelectTrigger className='w-full'>
											<SelectValue placeholder='Update status' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='pending'>Pending</SelectItem>
											<SelectItem value='confirmed'>Confirmed</SelectItem>
											<SelectItem value='changed'>Changed</SelectItem>
											<SelectItem value='cancelled'>Cancelled</SelectItem>
										</SelectContent>
									</Select>
								</CardContent>
							</Card>
						))
					) : (
						<p className='text-gray-500 text-lg'>
							No appointments available at the moment.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
