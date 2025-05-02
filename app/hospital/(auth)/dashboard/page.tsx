'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { HospitalIcon, User2Icon, StethoscopeIcon } from 'lucide-react';

export default function HospitalDashboard() {
	const router = useRouter();
	const [hospitalName, setHospitalName] = useState('Hospital');

	useEffect(() => {
		const token = localStorage.getItem('hospitalToken');
		if (!token) {
			router.push('/hospital/signin');
		}
		const fetchHospitalData = async () => {
			try {
				const response = await fetch('http://localhost:8000/hospital', {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const data = await response.json();
				setHospitalName(data.data.name || 'Hospital');
			} catch (error) {
				console.error('Error fetching hospital data:', error);
			}
		};
		fetchHospitalData();
	}, []);

	return (
		<div className='min-h-screen bg-gradient-to-br from-[#ebf4ff] to-[#e6fffa] px-6 py-10 font-sans'>
			<div className='container mx-auto'>
				{/* Header */}
				<header className='flex items-center justify-between mb-10'>
					<div>
						<h1 className='text-4xl font-extrabold text-[#1A365D]'>
							{hospitalName}
						</h1>
						<p className='text-gray-600 text-sm mt-1'>
							Managing excellence in healthcare
						</p>
					</div>
					<Image
						src='/hospital-icon.webp'
						alt='Hospital Logo'
						width={60}
						height={60}
						className='rounded-full shadow-md'
					/>
				</header>

				{/* Welcome Banner */}
				<Card className='bg-white shadow-lg mb-10 border-l-4 border-blue-600'>
					<CardContent className='py-6 px-6'>
						<h2 className='text-2xl font-semibold text-gray-800 mb-2'>
							Welcome to your Dashboard 👋
						</h2>
						<p className='text-gray-600 text-sm'>
							Streamline hospital operations, manage staff, and ensure quality
							care with ease.
						</p>
					</CardContent>
				</Card>

				{/* Quick Access */}
				<section className='mb-12'>
					<h2 className='text-xl font-semibold text-gray-800 mb-6'>
						Quick Access
					</h2>
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
						<Card
							className='bg-primary text-white shadow-md hover:shadow-xl transition duration-200 cursor-pointer'
							onClick={() => router.push('/hospital/appointmentcontrol')}
						>
							<CardContent className='flex flex-col items-center justify-center py-8'>
								<CalendarIcon className='w-10 h-10 mb-3' />
								<h3 className='text-lg font-semibold'>Appointments</h3>
							</CardContent>
						</Card>

						<Card
							className='bg-emerald-500 text-white shadow-md hover:shadow-xl transition duration-200 cursor-pointer'
							onClick={() => router.push('/hospital/managedoctors')}
						>
							<CardContent className='flex flex-col items-center justify-center py-8'>
								<StethoscopeIcon className='w-10 h-10 mb-3' />
								<h3 className='text-lg font-semibold'>Doctors</h3>
							</CardContent>
						</Card>

						<Card
							className='bg-purple-600 text-white shadow-md hover:shadow-xl transition duration-200 cursor-pointer'
							onClick={() => router.push('/admin/managePatients')}
						>
							<CardContent className='flex flex-col items-center justify-center py-8'>
								<User2Icon className='w-10 h-10 mb-3' />
								<h3 className='text-lg font-semibold'>Patients</h3>
							</CardContent>
						</Card>
					</div>
				</section>

				<Separator className='my-10' />

				{/* Manage Hospital */}
				<section>
					<h2 className='text-xl font-semibold text-gray-800 mb-4'>
						Manage Hospital
					</h2>
					<Card className='bg-white shadow-md'>
						<CardContent className='flex flex-col space-y-2 py-6 px-4'>
							<Button
								variant='ghost'
								className='justify-start text-primary'
								onClick={() => router.push('/admin/editProfile')}
							>
								Edit Profile
							</Button>
							<Button
								variant='ghost'
								className='justify-start text-primary'
								onClick={() => router.push('/admin/manageStaff')}
							>
								Manage Staff
							</Button>
							<Button
								variant='ghost'
								className='justify-start text-primary'
								onClick={() => router.push('/admin/manageEquipment')}
							>
								Manage Equipment
							</Button>
						</CardContent>
					</Card>
				</section>

				{/* Footer */}
				<footer className='mt-16 text-center text-gray-500 text-sm'>
					<p>© 2025 CityCare Hospital. All rights reserved.</p>
				</footer>
			</div>
		</div>
	);
}

function CalendarIcon(props: any) {
	return (
		<svg
			{...props}
			xmlns='http://www.w3.org/2000/svg'
			fill='none'
			viewBox='0 0 24 24'
			strokeWidth={1.5}
			stroke='currentColor'
		>
			<path
				strokeLinecap='round'
				strokeLinejoin='round'
				d='M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 21h15a.75.75 0 00.75-.75V6.75A.75.75 0 0019.5 6H4.5a.75.75 0 00-.75.75v13.5c0 .414.336.75.75.75z'
			/>
		</svg>
	);
}
