'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LocationDisplay from '@/components/locationdisplay';
import Image from 'next/image';
import axios from 'axios';

interface Doctor {
	_id: string;
	firstName: string;
	lastName: string;
	specialization: string;
	email: string;
	profilePicture?: string;
}

export default function DoctorDashBoard() {
	const router = useRouter();
	const [doctor, setDoctor] = useState<Doctor | null>(null);
	const [loading, setLoading] = useState(true);
	const [upcomingAppointments, setUpcomingAppointments] = useState([]);

	const currentDate = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	});

	useEffect(() => {
		const fetchDoctorInfo = async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem('doctorToken');

				if (!token) {
					router.push('/doctor/signin');
					return;
				}

				const response = await axios.get(
					'http://localhost:8000/auth/doctor/me',
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.data) {
					setDoctor(response.data.data);
					// Fetch upcoming appointments
					const appointmentsResponse = await axios.get(
						`http://localhost:8000/appointments/doctor/${response.data.data._id}`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);

					if (appointmentsResponse.data) {
						setUpcomingAppointments(
							appointmentsResponse.data.data.appointments || []
						);
					}
				}
			} catch (error) {
				console.error('Failed to load doctor info:', error);
				if (axios.isAxiosError(error) && error.response?.status === 401) {
					localStorage.removeItem('doctorToken');
					router.push('/doctor/signin');
				}
			} finally {
				setLoading(false);
			}
		};

		fetchDoctorInfo();
	}, [router]);

	if (loading) {
		return (
			<div className='min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100'>
				<div className='text-center'>
					<div className='w-16 h-16 border-4 border-t-blue-600 border-blue-100 rounded-full animate-spin mx-auto'></div>
					<p className='mt-4 text-blue-900 font-medium'>Loading dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-8'>
			<div className='container mx-auto'>
				{/* Top Bar with Profile */}
				<div className='flex items-center justify-between mb-6'>
					<div>
						<p className='text-lg text-gray-600'>Hello,</p>
						<h1 className='text-3xl font-bold text-blue-900'>
							{doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Doctor'}{' '}
							👋
						</h1>
						<p className='text-sm text-gray-500'>{currentDate}</p>
						{doctor && (
							<p className='text-sm text-blue-700 font-medium mt-1'>
								{doctor.specialization}
							</p>
						)}
					</div>
					<div className='relative'>
						<Image
							src={
								doctor?.profilePicture ||
								'https://cdn-icons-png.flaticon.com/512/2922/2922561.png'
							}
							alt='Profile'
							width={60}
							height={60}
							className='rounded-full border-2 border-blue-500 object-cover'
						/>
						<span className='absolute top-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white'></span>
					</div>
				</div>

				{/* Location Display */}
				<div className='flex items-center mb-8 text-lg text-gray-700'>
					<span className='mr-2'>📍</span>
					<LocationDisplay />
				</div>

				{/* Quick Actions */}
				<div className='grid grid-cols-2 gap-4 mb-8'>
					<Card className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow'>
						<CardContent className='p-4 flex flex-col items-center'>
							<span className='text-4xl mb-2'>🩺</span>
							<Button
								className='bg-blue-600 text-white text-sm font-semibold'
								onClick={() => router.push('/doctor/appointments')}
							>
								View Appointments
							</Button>
						</CardContent>
					</Card>
					<Card className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow'>
						<CardContent className='p-4 flex flex-col items-center'>
							<span className='text-4xl mb-2'>👥</span>
							<Button
								className='bg-blue-600 text-white text-sm font-semibold'
								onClick={() => router.push('/doctor/patients')}
							>
								My Patients
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Appointments Section */}
				<Card className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow'>
					<CardHeader className='p-4 border-b'>
						<CardTitle className='text-lg font-semibold text-blue-900'>
							Upcoming Appointments
						</CardTitle>
					</CardHeader>
					<CardContent className=''>
						{upcomingAppointments.length > 0 ? (
							<div className='space-y-4'>
								{upcomingAppointments.map((appointment: any) => (
									<div
										key={appointment._id}
										className='p-4 border rounded-lg hover:bg-blue-50 transition'
									>
										<div className='flex justify-between items-start'>
											<div>
												<p className='font-medium'>
													{appointment.patientId.firstName}{' '}
													{appointment.patientId.lastName}
												</p>
												<p className='text-sm text-gray-600'>
													{new Date(
														appointment.appointmentDate
													).toLocaleDateString()}{' '}
													at {appointment.appointmentTime}
												</p>
											</div>
											<div className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium'>
												{appointment.status}
											</div>
										</div>
									</div>
								))}
								<Button
									className='mt-2 w-full bg-blue-600 text-white text-lg font-semibold'
									onClick={() => router.push('/doctor/appointments')}
								>
									View All Appointments
								</Button>
							</div>
						) : (
							<>
								<p className='text-gray-600'>
									You have no upcoming appointments.
								</p>
								<Button
									className='mt-4 w-full bg-blue-600 text-white text-lg font-semibold'
									onClick={() => router.push('/doctor/availability')}
								>
									📅 Set Availability
								</Button>
							</>
						)}
					</CardContent>
				</Card>

				{/* Quick Stats */}
				<div className='grid grid-cols-2 gap-4 mt-8'>
					<Card className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow'>
						<CardContent className='p-4'>
							<p className='text-sm text-gray-500'>Today's Appointments</p>
							<p className='text-2xl font-bold text-blue-900'>
								{
									upcomingAppointments.filter((apt: any) => {
										const aptDate = new Date(apt.appointmentDate);
										const today = new Date();
										return aptDate.toDateString() === today.toDateString();
									}).length
								}
							</p>
						</CardContent>
					</Card>
					<Card className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow'>
						<CardContent className='p-4'>
							<p className='text-sm text-gray-500'>Total Patients</p>
							<p className='text-2xl font-bold text-blue-900'>--</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
