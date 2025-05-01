'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PatientSignInForm() {
	const [contactNumber, setContactNumber] = useState('');
	const router = useRouter();

	const handleSignIn = async () => {
		try {
			const response = await axios.post(
				'http://localhost:8000/patients/signin',
				{ contactNumber }
			);

			if (response.data.status === 'error') {
				console.log(response.data.message);
				return;
			}

			router.push(`/patient/otp?contactNumber=${contactNumber}`);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className='min-h-screen bg-muted flex items-center justify-center px-4 py-12'>
			<Card className='w-full max-w-md shadow-xl'>
				<CardHeader>
					<CardTitle className='text-darkblue text-2xl font-bold'>
						Sign In
					</CardTitle>
					<p className='text-sm text-muted-foreground'>
						Enter your phone number to continue
					</p>
				</CardHeader>
				<CardContent className='space-y-4'>
					<Input
						placeholder='Phone Number'
						type='tel'
						value={contactNumber}
						onChange={(e) => setContactNumber(e.target.value)}
					/>

					<Button
						onClick={handleSignIn}
						className='w-full mt-2 text-base font-semibold'
					>
						Sign In
					</Button>

					<div className='text-sm text-muted-foreground text-center'>
						Don’t have an account?{' '}
						<Link href='/patient/signup' className='text-primary font-medium'>
							Sign Up
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
