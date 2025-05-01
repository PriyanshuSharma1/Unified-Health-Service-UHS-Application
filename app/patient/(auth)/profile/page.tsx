'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
	User,
	Mail,
	Phone,
	Calendar,
	UserCircle,
	Save,
	X,
	Edit,
	ArrowLeft,
	CheckCircle,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Patient {
	firstName: string;
	lastName: string;
	age: number;
	gender: 'male' | 'female' | 'other' | 'prefer not to say';
	contactNumber: string;
	email: string;
	otp: string;
}

export default function PatientProfile() {
	const router = useRouter();
	const [patient, setPatient] = useState<Patient | null>(null);
	const [editMode, setEditMode] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Form state
	const [formData, setFormData] = useState<Patient>({
		firstName: '',
		lastName: '',
		age: 0,
		gender: 'prefer not to say',
		contactNumber: '',
		email: '',
		otp: '',
	});

	// Validation state
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	useEffect(() => {
		const fetchPatientProfile = async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem('patientToken');

				if (!token) {
					router.push('/patient/signin');
					return;
				}

				const response = await axios.get('http://localhost:8000/patients/me', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.data) {
					const patientData = response.data.data;
					setPatient(patientData);
					setFormData(patientData);
				}
			} catch (err: any) {
				console.error('Error fetching patient profile:', err);
				setError(err.response?.data?.message || 'Failed to load profile');

				// Handle unauthorized access
				if (err.response?.status === 401) {
					localStorage.removeItem('patientToken');
					router.push('/patient/signin');
				}
			} finally {
				setLoading(false);
			}
		};

		fetchPatientProfile();
	}, []);

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.firstName.trim())
			newErrors.firstName = 'First name is required';
		if (!formData.age || formData.age <= 0)
			newErrors.age = 'Valid age is required';
		if (!formData.gender) newErrors.gender = 'Gender is required';

		if (!formData.contactNumber.trim()) {
			newErrors.contactNumber = 'Contact number is required';
		} else if (!/^\d{10,12}$/.test(formData.contactNumber)) {
			newErrors.contactNumber = 'Contact number must be 10-12 digits';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Email is invalid';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === 'age' ? parseInt(value) || 0 : value,
		}));
	};

	const handleGenderChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			gender: value as 'male' | 'female' | 'other' | 'prefer not to say',
		}));
	};

	const handleSave = async () => {
		if (!validateForm()) return;

		try {
			setSaving(true);
			setError(null);
			const token = localStorage.getItem('patientToken');

			const response = await axios.patch(
				'http://localhost:8000/patients/update',
				formData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data) {
				console.log('Profile updated:', response.data);
				setPatient(response.data.data);
				setSuccess('Profile updated successfully!');
				setEditMode(false);

				// Clear success message after 3 seconds
				setTimeout(() => {
					setSuccess(null);
				}, 3000);
			}
		} catch (err: any) {
			console.error('Error updating profile:', err);
			setError(err.response?.data?.message || 'Failed to update profile');
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		// Reset form data to original patient data
		if (patient) {
			setFormData(patient);
		}
		setEditMode(false);
		setErrors({});
	};

	// Loading state
	if (loading) {
		return (
			<div className='container max-w-4xl mx-auto px-4 py-8'>
				<div className='flex items-center justify-center h-64'>
					<div className='animate-pulse text-primary font-medium'>
						Loading profile...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='container max-w-4xl mx-auto px-4 py-8'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold text-primary'>My Profile</h1>
				{!editMode && (
					<Button
						onClick={() => setEditMode(true)}
						className='bg-primary hover:bg-primary/90'
					>
						<Edit className='h-4 w-4 mr-2' /> Edit Profile
					</Button>
				)}
			</div>

			{error && (
				<Alert variant='destructive' className='mb-6'>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert className='mb-6 bg-green-50 text-green-800 border border-green-200'>
					<CheckCircle className='h-4 w-4 mr-2' />
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			)}

			<Card className='shadow-md'>
				<CardHeader className='pb-4 border-b'>
					<div className='flex items-center space-x-4'>
						<Avatar className='h-16 w-16'>
							<AvatarImage src='' />
							<AvatarFallback className='bg-primary text-white text-xl'>
								{patient?.firstName?.charAt(0)}
								{patient?.lastName?.charAt(0)}
							</AvatarFallback>
						</Avatar>
						<div>
							<CardTitle className='text-xl text-primary'>
								{patient?.firstName} {patient?.lastName}
							</CardTitle>
							<p className='text-sm text-gray-500'>{patient?.email}</p>
						</div>
					</div>
				</CardHeader>

				<CardContent className='pt-6'>
					<Tabs defaultValue='profile' className='w-full'>
						<TabsList className='grid w-full grid-cols-2 mb-8'>
							<TabsTrigger
								value='profile'
								className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
							>
								Personal Info
							</TabsTrigger>
							<TabsTrigger
								value='appointments'
								className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
							>
								Medical History
							</TabsTrigger>
						</TabsList>

						<TabsContent value='profile' className='space-y-6'>
							{editMode ? (
								/* Edit Mode Form */
								<div className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor='firstName'>First Name</Label>
											<Input
												id='firstName'
												name='firstName'
												value={formData.firstName}
												onChange={handleChange}
												className={errors.firstName ? 'border-red-500' : ''}
											/>
											{errors.firstName && (
												<p className='text-red-500 text-xs'>
													{errors.firstName}
												</p>
											)}
										</div>

										<div className='space-y-2'>
											<Label htmlFor='lastName'>Last Name</Label>
											<Input
												id='lastName'
												name='lastName'
												value={formData.lastName}
												onChange={handleChange}
											/>
										</div>
									</div>

									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<Label htmlFor='age'>Age</Label>
											<Input
												id='age'
												name='age'
												type='number'
												value={formData.age}
												onChange={handleChange}
												className={errors.age ? 'border-red-500' : ''}
											/>
											{errors.age && (
												<p className='text-red-500 text-xs'>{errors.age}</p>
											)}
										</div>

										<div className='space-y-2'>
											<Label htmlFor='gender'>Gender</Label>
											<Select
												value={formData.gender}
												onValueChange={handleGenderChange}
											>
												<SelectTrigger
													id='gender'
													className={errors.gender ? 'border-red-500' : ''}
												>
													<SelectValue placeholder='Select gender' />
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
											{errors.gender && (
												<p className='text-red-500 text-xs'>{errors.gender}</p>
											)}
										</div>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='contactNumber'>Contact Number</Label>
										<Input
											id='contactNumber'
											name='contactNumber'
											value={formData.contactNumber}
											onChange={handleChange}
											className={errors.contactNumber ? 'border-red-500' : ''}
										/>
										{errors.contactNumber && (
											<p className='text-red-500 text-xs'>
												{errors.contactNumber}
											</p>
										)}
									</div>

									<div className='space-y-2'>
										<Label htmlFor='email'>Email</Label>
										<Input
											id='email'
											name='email'
											type='email'
											value={formData.email}
											onChange={handleChange}
											className={errors.email ? 'border-red-500' : ''}
											disabled // Email usually shouldn't be changed easily
										/>
										{errors.email && (
											<p className='text-red-500 text-xs'>{errors.email}</p>
										)}
									</div>

									<div className='flex space-x-2 pt-4'>
										<Button
											onClick={handleSave}
											className='bg-primary hover:bg-primary/90'
											disabled={saving}
										>
											{saving ? (
												<>Saving...</>
											) : (
												<>
													<Save className='h-4 w-4 mr-2' /> Save Changes
												</>
											)}
										</Button>

										<Button
											onClick={handleCancel}
											variant='outline'
											disabled={saving}
										>
											<X className='h-4 w-4 mr-2' /> Cancel
										</Button>
									</div>
								</div>
							) : (
								/* View Mode */
								<div className='space-y-6'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<div className='space-y-4'>
											<div className='flex items-start space-x-3'>
												<User className='h-5 w-5 text-primary mt-0.5' />
												<div>
													<p className='text-sm text-gray-500'>Full Name</p>
													<p className='font-medium'>
														{patient?.firstName} {patient?.lastName}
													</p>
												</div>
											</div>

											<div className='flex items-start space-x-3'>
												<Calendar className='h-5 w-5 text-primary mt-0.5' />
												<div>
													<p className='text-sm text-gray-500'>Age</p>
													<p className='font-medium'>{patient?.age} years</p>
												</div>
											</div>

											<div className='flex items-start space-x-3'>
												<UserCircle className='h-5 w-5 text-primary mt-0.5' />
												<div>
													<p className='text-sm text-gray-500'>Gender</p>
													<p className='font-medium capitalize'>
														{patient?.gender}
													</p>
												</div>
											</div>
										</div>

										<div className='space-y-4'>
											<div className='flex items-start space-x-3'>
												<Phone className='h-5 w-5 text-primary mt-0.5' />
												<div>
													<p className='text-sm text-gray-500'>
														Contact Number
													</p>
													<p className='font-medium'>
														{patient?.contactNumber}
													</p>
												</div>
											</div>

											<div className='flex items-start space-x-3'>
												<Mail className='h-5 w-5 text-primary mt-0.5' />
												<div>
													<p className='text-sm text-gray-500'>Email</p>
													<p className='font-medium'>{patient?.email}</p>
												</div>
											</div>
										</div>
									</div>

									<Separator />

									<div>
										<p className='text-sm text-gray-500 mb-2'>Account Status</p>
										<div className='flex items-center'>
											<div className='h-2.5 w-2.5 rounded-full bg-green-500 mr-2'></div>
											<span className='font-medium'>Active</span>
										</div>
									</div>
								</div>
							)}
						</TabsContent>

						<TabsContent value='appointments' className='space-y-6'>
							<div className='bg-muted/50 rounded-lg p-8 text-center'>
								<h3 className='text-lg font-medium mb-2'>Medical History</h3>
								<p className='text-gray-500 mb-4'>
									Your medical history will be displayed here
								</p>
								<Button
									variant='outline'
									onClick={() => router.push('/patient/appointments')}
								>
									View Appointments
								</Button>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
