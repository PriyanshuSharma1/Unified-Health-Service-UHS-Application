'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HospitalProfileScreen() {
	const { id } = useParams();
	const router = useRouter();
	const [hospital, setHospital] = useState<any>(null);
	const [doctors, setDoctors] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const hospitalRes = await fetch(
					`http://localhost:8000/auth/hospital/${id}`
				);
				const hospitalData = await hospitalRes.json();
				setHospital(hospitalData.data);

				const doctorRes = await fetch(
					`http://localhost:8000/auth/doctor/${id}`
				);
				const doctorData = await doctorRes.json();
				setDoctors(doctorData.data.slice(0, 10));
			} catch (error) {
				console.error('Failed to load data:', error);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [id]);

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-white'>
				<p className='text-primary text-lg font-medium'>
					Loading hospital info...
				</p>
			</div>
		);
	}

	return (
		<div className=' container mx-auto mt-6'>
			{/* Back Button */}
			<div className='mb-6'>
				<Button
					variant='ghost'
					className='flex items-center space-x-2 text-primary'
					onClick={() => router.push('/patient/dashboard')}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={2}
						stroke='currentColor'
						className='w-5 h-5'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M15.75 19.5L8.25 12l7.5-7.5'
						/>
					</svg>
					<span>Back to Dashboard</span>
				</Button>
			</div>
			{/* Hospital Banner */}
			<Card className='bg-white rounded-2xl shadow-lg mb-10'>
				<CardContent className='px-6 py-8'>
					<h1 className='text-3xl font-extrabold text-blue-900 mb-2'>
						{hospital?.name}
					</h1>
					<p className='text-muted-foreground text-sm'>{hospital?.address}</p>
					<p className='text-sm mt-1'>📞 {hospital?.contactNumber}</p>
				</CardContent>
			</Card>

			{/* Doctors List */}
			<div>
				<h2 className='text-2xl font-semibold text-gray-800 mb-4'>
					Available Doctors
				</h2>

				{doctors.length === 0 ? (
					<p className='text-center text-gray-500'>No doctors available.</p>
				) : (
					<div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
						{doctors.map((item) => (
							<Card
								key={item._id}
								className='hover:shadow-md transition-shadow cursor-pointer'
								onClick={() =>
									router.push(`/patient/appointments/booking/${item._id}`)
								}
							>
								<CardContent className='flex items-center space-x-4 py-6 px-4'>
									<Image
										src={
											item?.profileImage ||
											'https://www.w3schools.com/howto/img_avatar.png'
										}
										width={56}
										height={56}
										alt='Doctor Avatar'
										className='rounded-full'
									/>
									<div className='flex-1'>
										<h3 className='text-lg font-semibold text-gray-800'>
											Dr. {item.firstName} {item.lastName}
										</h3>
										<p className='text-sm text-gray-500'>
											{item.specialization || 'General Physician'}
										</p>
									</div>
									<Button variant='link' className='text-primary text-sm'>
										Book →
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
