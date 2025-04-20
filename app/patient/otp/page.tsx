'use client';
import axios from 'axios';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function OTPScreen() {
	const [otp, setOtp] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const router = useRouter();
	const searchParams = useSearchParams();
	const contactNumber = searchParams.get('contactNumber') || '';
	const [successMessage, setSuccessMessage] = useState('');
	const handleSubmit = async () => {
		if (!otp || otp.length < 6) {
			setErrorMessage('Please enter a valid 6-digit OTP.');
			return;
		}

		try {
			const res = await axios.post('http://localhost:8000/patient/verify-otp', {
				otp,
				contactNumber,
			});

			if (res.data.status === 'error') {
				setErrorMessage(res.data.message || 'OTP verification failed.');
				return;
			}

			localStorage.setItem('patientToken', res.data.patientToken);
			console.log('Token:', res.data);
			router.push('/patient/dashboard');
			setSuccessMessage('OTP verified successfully!');
			setErrorMessage('');
		} catch (err) {
			console.log(err);
			setErrorMessage('Something went wrong. Please try again.');
		}
	};

	return (
		<div className='min-h-screen bg-white flex flex-col items-center justify-center px-4'>
			<Card className='w-full max-w-md shadow-md'>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl font-bold text-black'>
						Enter OTP
					</CardTitle>
					<p className='text-sm text-muted-foreground mt-1'>
						We've sent a code to your number
					</p>
					<p className='text-base font-medium text-blue-600'>{contactNumber}</p>
				</CardHeader>

				<CardContent className='space-y-4'>
					{errorMessage && (
						<p className='text-red-600 text-sm text-center'>{errorMessage}</p>
					)}

					<Input
						placeholder='Enter 6-digit OTP'
						type='text'
						inputMode='numeric'
						maxLength={6}
						value={otp}
						className='text-center tracking-widest bg-gray-100'
						onChange={(e) => setOtp(e.target.value)}
					/>

					<Button
						onClick={handleSubmit}
						className='w-full text-base font-semibold'
					>
						Verify OTP
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
