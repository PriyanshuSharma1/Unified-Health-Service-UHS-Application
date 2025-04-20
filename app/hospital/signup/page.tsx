'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminSignUpForm() {
	const router = useRouter();

	const [formData, setFormData] = useState({
		name: '',
		state: '',
		city: '',
		country: '',
		postalCode: '',
		address: '',
		email: '',
		password: '',
		contactNumber: '',
	});

	const [registrationDocument, setRegistrationDocument] = useState<File | null>(
		null
	);
	const [error, setError] = useState('');

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setRegistrationDocument(e.target.files[0]);
		}
	};

	const validateForm = () => {
		const {
			name,
			state,
			city,
			country,
			postalCode,
			address,
			email,
			password,
			contactNumber,
		} = formData;

		if (
			!name ||
			!state ||
			!city ||
			!country ||
			!postalCode ||
			!address ||
			!email ||
			!password ||
			!contactNumber
		)
			return 'All fields are required.';
		if (!email.includes('@')) return 'Please enter a valid email.';
		if (!registrationDocument) return 'Please upload a registration document.';
		return null;
	};

	const handleSignUp = async () => {
		const error = validateForm();
		if (error) {
			setError(error);
			return;
		}

		const formDataToSend = new FormData();
		Object.entries(formData).forEach(([key, value]) => {
			formDataToSend.append(key, value as string);
		});
		if (registrationDocument) {
			formDataToSend.append('registrationDocument', registrationDocument);
		}

		try {
			await axios.post(
				'http://localhost:8000/auth/hospital/signup',
				formDataToSend,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				}
			);
			router.push('/hospital/signin');
		} catch (err: any) {
			toast.error(
				err?.response?.data?.message || 'Signup failed. Please try again.'
			);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12'>
			<Card className='w-full max-w-2xl shadow-xl'>
				<CardHeader>
					<CardTitle className='text-blue-900 text-3xl font-extrabold'>
						Hospital Admin Sign Up
					</CardTitle>
					<p className='text-sm text-muted-foreground mt-1'>
						Sign up to manage your hospital and its operations.
					</p>
				</CardHeader>
				<CardContent className='space-y-4'>
					{error && <p className='text-red-600 text-sm font-medium'>{error}</p>}

					<Input
						placeholder='Hospital Name'
						name='name'
						value={formData.name}
						onChange={handleChange}
					/>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<Input
							placeholder='State'
							name='state'
							value={formData.state}
							onChange={handleChange}
						/>
						<Input
							placeholder='City'
							name='city'
							value={formData.city}
							onChange={handleChange}
						/>
					</div>

					<Input
						placeholder='Country'
						name='country'
						value={formData.country}
						onChange={handleChange}
					/>

					<Input
						placeholder='Postal Code'
						name='postalCode'
						type='number'
						value={formData.postalCode}
						onChange={handleChange}
					/>

					<Input
						placeholder='Address'
						name='address'
						value={formData.address}
						onChange={handleChange}
					/>

					<Input
						placeholder='Email'
						name='email'
						type='email'
						value={formData.email}
						onChange={handleChange}
					/>

					<Input
						placeholder='Password'
						name='password'
						type='password'
						value={formData.password}
						onChange={handleChange}
					/>

					<Input
						placeholder='Contact Number'
						name='contactNumber'
						type='tel'
						value={formData.contactNumber}
						onChange={handleChange}
					/>

					<div>
						<Label className='block text-sm font-medium text-gray-700 mb-2'>
							Registration Document
						</Label>
						<input
							type='file'
							accept='.pdf'
							onChange={handleFileChange}
							className='block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						/>
						{registrationDocument && (
							<p className='text-sm text-gray-600 mt-2'>
								Selected File: {registrationDocument.name}
							</p>
						)}
					</div>

					<Button
						onClick={handleSignUp}
						className='w-full text-base font-semibold'
					>
						Create Account
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
