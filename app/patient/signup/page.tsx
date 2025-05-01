'use client';
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PatientSignUpForm() {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [age, setAge] = useState('');
	const [gender, setGender] = useState('');
	const [email, setEmail] = useState('');
	const [contactNumber, setContactNumber] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const Router = useRouter();
	const validateForm = () => {
		if (!firstName || !lastName || !age || !gender || !email || !contactNumber)
			return 'All fields are required.';
		if (isNaN(Number(age)) || Number(age) < 0)
			return 'Please enter a valid age.';
		if (!email.includes('@')) return 'Please enter a valid email address.';
		if (contactNumber.length < 10)
			return 'Contact number must be at least 10 digits.';
		return null;
	};

	const handleSignUp = async () => {
		const validationError = validateForm();
		if (validationError) {
			setErrorMessage(validationError);
			return;
		}
		try {
			const response = await axios.post(
				'http://localhost:8000/patients/signup',
				{
					firstName,
					lastName,
					age,
					gender,
					email,
					contactNumber,
				}
			);
			toast.success(
				'Signup successful! Please check your email for verification.'
			);
			setSuccessMessage('Signup successful! Please check your email.');
			Router.push('/patient/signin');

			setErrorMessage('');
		} catch (error: any) {
			setErrorMessage(
				error?.response?.data?.message || 'Signup failed. Please try again.'
			);
			toast.error(
				error?.response?.data?.message || 'Signup failed. Please try again.'
			);
		}
	};

	return (
		<div className='min-h-screen bg-muted flex items-center justify-center px-4 py-12'>
			<Card className='w-full max-w-xl shadow-xl'>
				<CardHeader>
					<CardTitle className='text-2xl font-bold'>
						Welcome to UHS Patient Portal!
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<Input
							placeholder='First Name'
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
						/>
						<Input
							placeholder='Last Name'
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
						/>
						<Input
							placeholder='Age'
							type='number'
							value={age}
							onChange={(e) => setAge(e.target.value)}
						/>
						<Select value={gender} onValueChange={setGender}>
							<SelectTrigger>
								<SelectValue placeholder='Select Gender' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='male'>Male</SelectItem>
								<SelectItem value='female'>Female</SelectItem>
								<SelectItem value='other'>Other</SelectItem>
								<SelectItem value='prefer not to say'>
									Prefer not to say
								</SelectItem>
							</SelectContent>
						</Select>
						<Input
							placeholder='Contact Number'
							type='tel'
							value={contactNumber}
							onChange={(e) => setContactNumber(e.target.value)}
						/>
						<Input
							placeholder='Email'
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>

					<Button
						onClick={handleSignUp}
						className='w-full mt-4 text-base font-semibold'
					>
						Sign Up
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
