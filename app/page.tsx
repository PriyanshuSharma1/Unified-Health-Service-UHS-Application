'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function LandingPage() {
	const router = useRouter();

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-between px-6 py-12'>
			{/* Hero Section */}
			<header className='text-center'>
				<div className='flex items-center text-5xl font-extrabold text-primary mb-4'>
					<div className='mr-4'>
						<Image
							src='/mass-logo.png'
							alt='MASS Logo'
							width={40}
							height={40}
							className='mr-2'
						/>
					</div>
					<h1>Welcome to MASS 👋</h1>
				</div>
				<p className='text-lg text-gray-700'>
					Your one-stop solution for healthcare management.
				</p>
			</header>

			{/* Role Selection Section */}
			<section className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-5xl'>
				{/* Patient Card */}
				<Card className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow'>
					<CardHeader className='flex flex-col items-center'>
						<Image
							src='/p.png'
							alt='Patient Icon'
							width={80}
							height={80}
							className='mb-4'
						/>
						<CardTitle className='text-xl font-bold text-primary'>
							I'm a Patient
						</CardTitle>
					</CardHeader>
					<CardContent className='text-center'>
						<p className='text-gray-600 mb-4'>
							Manage your appointments, medications, and health records.
						</p>
						<Button
							className='w-full bg-primary
               text-white'
							onClick={() => router.push('/patient/signin')}
						>
							Get Started
						</Button>
					</CardContent>
				</Card>

				{/* Doctor Card */}
				<Card className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow'>
					<CardHeader className='flex flex-col items-center'>
						<Image
							src='/doctor-icon.png'
							alt='Doctor Icon'
							width={80}
							height={80}
							className='mb-4'
						/>
						<CardTitle className='text-xl font-bold text-primary'>
							I'm a Doctor
						</CardTitle>
					</CardHeader>
					<CardContent className='text-center'>
						<p className='text-gray-600 mb-4'>
							Manage your patients, appointments, and medical records.
						</p>
						<Button
							className='w-full bg-primary text-white'
							onClick={() => router.push('/doctor/signin')}
						>
							Get Started
						</Button>
					</CardContent>
				</Card>

				{/* Hospital Card */}
				<Card className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow'>
					<CardHeader className='flex flex-col items-center'>
						<Image
							src='/hospital-icon.webp'
							alt='Hospital Icon'
							width={80}
							height={80}
							className='mb-4'
						/>
						<CardTitle className='text-xl font-bold text-primary'>
							I'm a Hospital
						</CardTitle>
					</CardHeader>
					<CardContent className='text-center'>
						<p className='text-gray-600 mb-4'>
							Manage your staff, facilities, and patient records.
						</p>
						<Button
							className='w-full bg-primary text-white'
							onClick={() => router.push('/hospital/signin')}
						>
							Get Started
						</Button>
					</CardContent>
				</Card>
			</section>

			{/* Features Section */}
			<section className='mt-16 w-full max-w-5xl text-center'>
				<h2 className='text-3xl font-bold text-primary mb-6'>
					Why Choose MASS?
				</h2>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					<Card className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow'>
						<CardContent className='text-center'>
							<h3 className='text-lg font-bold text-primary mb-2'>
								Easy to Use
							</h3>
							<p className='text-gray-600'>
								A simple and intuitive interface for everyone.
							</p>
						</CardContent>
					</Card>
					<Card className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow'>
						<CardContent className='text-center'>
							<h3 className='text-lg font-bold text-primary mb-2'>
								Secure & Reliable
							</h3>
							<p className='text-gray-600'>
								Your data is safe with our top-notch security.
							</p>
						</CardContent>
					</Card>
					<Card className='bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow'>
						<CardContent className='text-center'>
							<h3 className='text-lg font-bold text-primary mb-2'>
								Comprehensive Tools
							</h3>
							<p className='text-gray-600'>
								Everything you need to manage healthcare efficiently.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Footer */}
			<footer className='mt-16 text-center text-gray-600 text-sm'>
				<p>© 2025 UHS. All rights reserved.</p>
			</footer>
		</div>
	);
}
