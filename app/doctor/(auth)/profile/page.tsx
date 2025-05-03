'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	Briefcase,
	GraduationCap,
	Edit,
	Building,
	CheckCircle,
	AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// Define the Doctor interface
interface Doctor {
	_id: string;
	firstName: string;
	lastName: string;
	specialization: string;
	contactNumber: string;
	email: string;
	hospital: {
		_id: string;
		name: string;
	};
	verified: boolean;
	country: string;
	city: string;
	state: string;
	postalCode: string;
	address: string;
	experience: number;
	education: string;
	age: number;
	profilePicture?: string;
}

// Create a schema for form validation
const doctorSchema = z.object({
	firstName: z
		.string()
		.min(2, { message: 'First name must be at least 2 characters' }),
	lastName: z
		.string()
		.min(2, { message: 'Last name must be at least 2 characters' }),
	specialization: z.string().min(2, { message: 'Specialization is required' }),
	contactNumber: z
		.string()
		.min(10, { message: 'Valid contact number is required' }),
	email: z.string().email({ message: 'Invalid email address' }),
	country: z.string().min(2, { message: 'Country is required' }),
	city: z.string().min(2, { message: 'City is required' }),
	state: z.string().min(2, { message: 'State is required' }),
	postalCode: z.string().min(5, { message: 'Valid postal code is required' }),
	address: z.string().min(5, { message: 'Address is required' }),
	experience: z.coerce
		.number()
		.min(0, { message: 'Experience must be a positive number' }),
	education: z.string().min(2, { message: 'Education details are required' }),
	age: z.coerce.number().min(18, { message: 'Age must be at least 18' }),
});

export default function DoctorProfile() {
	const router = useRouter();
	const [doctor, setDoctor] = useState<Doctor | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [tab, setTab] = useState('profile');
	const [updating, setUpdating] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [profileImage, setProfileImage] = useState<File | null>(null);

	// Initialize form
	const form = useForm<z.infer<typeof doctorSchema>>({
		resolver: zodResolver(doctorSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			specialization: '',
			contactNumber: '',
			email: '',
			country: '',
			city: '',
			state: '',
			postalCode: '',
			address: '',
			experience: 0,
			education: '',
			age: 0,
		},
	});

	// Fetch doctor data
	useEffect(() => {
		const fetchDoctorData = async () => {
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
					const doctorData = response.data.data;
					setDoctor(doctorData);

					// Set form values
					form.reset({
						firstName: doctorData.firstName || '',
						lastName: doctorData.lastName || '',
						specialization: doctorData.specialization || '',
						contactNumber: doctorData.contactNumber || '',
						email: doctorData.email || '',
						country: doctorData.country || '',
						city: doctorData.city || '',
						state: doctorData.state || '',
						postalCode: doctorData.postalCode || '',
						address: doctorData.address || '',
						experience: doctorData.experience || 0,
						education: doctorData.education || '',
						age: doctorData.age || 0,
					});

					if (doctorData.profilePicture) {
						setImagePreview(doctorData.profilePicture);
					}
				}
			} catch (error) {
				console.error('Error fetching doctor data:', error);
				setError('Failed to load doctor profile. Please try again.');

				if (axios.isAxiosError(error) && error.response?.status === 401) {
					localStorage.removeItem('doctorToken');
					router.push('/doctor/signin');
				}
			} finally {
				setLoading(false);
			}
		};

		fetchDoctorData();
	}, [router]);

	// Handle form submission
	const onSubmit = async (values: z.infer<typeof doctorSchema>) => {
		try {
			setUpdating(true);
			const token = localStorage.getItem('doctorToken');

			// First update doctor profile data
			const response = await axios.put(
				'http://localhost:8000/auth/doctor/update',
				values,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.data) {
				// Update local state with new values
				setDoctor({
					...doctor!,
					...values,
				});
				setTab('profile');
				toast.success('Profile updated successfully!');
			}
		} catch (error) {
			console.error('Error updating doctor profile:', error);
			setError('Failed to update doctor information. Please try again.');
		} finally {
			setUpdating(false);
		}
	};

	// Handle profile image change
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setProfileImage(file);
			setImagePreview(URL.createObjectURL(file));
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<div className='w-16 h-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto'></div>
					<p className='mt-4 text-blue-900 font-medium'>Loading profile...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center min-h-screen p-4'>
				<Card className='max-w-md w-full'>
					<CardHeader>
						<CardTitle className='text-red-600'>Error</CardTitle>
						<CardDescription>
							There was a problem loading your profile
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p>{error}</p>
					</CardContent>
					<CardFooter>
						<Button onClick={() => window.location.reload()}>Try Again</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return (
		<div className='container max-w-6xl mx-auto py-8 px-4'>
			<Tabs defaultValue='profile' value={tab} onValueChange={setTab}>
				<TabsList className='grid w-full grid-cols-2'>
					<TabsTrigger value='profile'>View Profile</TabsTrigger>
					<TabsTrigger value='edit'>Edit Profile</TabsTrigger>
				</TabsList>

				{/* View Profile Tab */}
				<TabsContent value='profile'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{/* Profile Summary Card */}
						<div className='md:col-span-1'>
							<Card className='mb-6'>
								<CardContent className='pt-6 flex flex-col items-center'>
									<div className='relative mb-4'>
										{doctor?.profilePicture ? (
											<Image
												src={doctor.profilePicture}
												alt='Profile'
												width={120}
												height={120}
												className='rounded-full object-cover border-4 border-white shadow-md'
											/>
										) : (
											<div className='w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center'>
												<User className='h-16 w-16 text-blue-500' />
											</div>
										)}

										{doctor?.verified && (
											<Badge className='absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white flex items-center'>
												<CheckCircle className='h-3 w-3 mr-1' /> Verified
											</Badge>
										)}
									</div>

									<h2 className='text-2xl font-bold text-center text-blue-900 mt-2'>
										Dr. {doctor?.firstName} {doctor?.lastName}
									</h2>

									<p className='text-blue-600 font-medium text-center'>
										{doctor?.specialization}
									</p>

									<Separator className='my-4' />

									<div className='w-full space-y-3'>
										<div className='flex items-center'>
											<Mail className='h-4 w-4 mr-2 text-gray-500' />
											<span className='text-sm'>{doctor?.email}</span>
										</div>

										<div className='flex items-center'>
											<Phone className='h-4 w-4 mr-2 text-gray-500' />
											<span className='text-sm'>{doctor?.contactNumber}</span>
										</div>

										<div className='flex items-center'>
											<Building className='h-4 w-4 mr-2 text-gray-500' />
											<span className='text-sm'>{doctor?.hospital?.name}</span>
										</div>

										<div className='flex items-center'>
											<Calendar className='h-4 w-4 mr-2 text-gray-500' />
											<span className='text-sm'>{doctor?.age} years old</span>
										</div>
									</div>

									<Button
										className='mt-6 w-full bg-blue-600 hover:bg-blue-700'
										onClick={() => setTab('edit')}
									>
										<Edit className='h-4 w-4 mr-2' /> Edit Profile
									</Button>
								</CardContent>
							</Card>
						</div>

						{/* Professional Details */}
						<div className='md:col-span-2'>
							<Card className='mb-6'>
								<CardHeader>
									<CardTitle className='text-xl text-blue-900'>
										Professional Information
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-6'>
									<div className='space-y-2'>
										<h3 className='text-sm font-medium text-gray-500'>
											Specialization
										</h3>
										<p className='text-lg'>{doctor?.specialization}</p>
									</div>

									<div className='space-y-2'>
										<h3 className='text-sm font-medium text-gray-500'>
											Experience
										</h3>
										<p className='text-lg flex items-center'>
											<Briefcase className='h-5 w-5 mr-2 text-blue-600' />
											{doctor?.experience} years
										</p>
									</div>

									<div className='space-y-2'>
										<h3 className='text-sm font-medium text-gray-500'>
											Education
										</h3>
										<p className='text-lg flex items-start'>
											<GraduationCap className='h-5 w-5 mr-2 text-blue-600 mt-1' />
											<span>{doctor?.education}</span>
										</p>
									</div>

									<div className='space-y-2'>
										<h3 className='text-sm font-medium text-gray-500'>
											Hospital Affiliation
										</h3>
										<p className='text-lg flex items-center'>
											<Building className='h-5 w-5 mr-2 text-blue-600' />
											{doctor?.hospital?.name}
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Contact & Location Information */}
							<Card>
								<CardHeader>
									<CardTitle className='text-xl text-blue-900'>
										Contact & Location
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<h3 className='text-sm font-medium text-gray-500'>
												City
											</h3>
											<p>{doctor?.city}</p>
										</div>

										<div className='space-y-2'>
											<h3 className='text-sm font-medium text-gray-500'>
												State
											</h3>
											<p>{doctor?.state}</p>
										</div>

										<div className='space-y-2'>
											<h3 className='text-sm font-medium text-gray-500'>
												Country
											</h3>
											<p>{doctor?.country}</p>
										</div>

										<div className='space-y-2'>
											<h3 className='text-sm font-medium text-gray-500'>
												Postal Code
											</h3>
											<p>{doctor?.postalCode}</p>
										</div>
									</div>

									<Separator />

									<div className='space-y-2'>
										<h3 className='text-sm font-medium text-gray-500'>
											Full Address
										</h3>
										<p className='flex items-start'>
											<MapPin className='h-5 w-5 mr-2 text-blue-600' />
											<span>{doctor?.address}</span>
										</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>

				{/* Edit Profile Tab */}
				<TabsContent value='edit'>
					<Card>
						<CardHeader>
							<CardTitle>Edit Your Profile</CardTitle>
							<CardDescription>
								Update your personal and professional information
							</CardDescription>
						</CardHeader>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)}>
								<CardContent className='space-y-8'>
									{/* Personal Information Section */}
									<div>
										<h3 className='text-lg font-medium mb-4'>
											Personal Information
										</h3>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
											<FormField
												control={form.control}
												name='firstName'
												render={({ field }) => (
													<FormItem>
														<FormLabel>First Name</FormLabel>
														<FormControl>
															<Input placeholder='First name' {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name='lastName'
												render={({ field }) => (
													<FormItem>
														<FormLabel>Last Name</FormLabel>
														<FormControl>
															<Input placeholder='Last name' {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name='email'
												render={({ field }) => (
													<FormItem>
														<FormLabel>Email Address</FormLabel>
														<FormControl>
															<Input
																placeholder='Email'
																type='email'
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name='contactNumber'
												render={({ field }) => (
													<FormItem>
														<FormLabel>Contact Number</FormLabel>
														<FormControl>
															<Input placeholder='Contact number' {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name='age'
												render={({ field }) => (
													<FormItem>
														<FormLabel>Age</FormLabel>
														<FormControl>
															<Input
																placeholder='Age'
																type='number'
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>

									{/* Professional Information Section */}
									<div>
										<h3 className='text-lg font-medium mb-4'>
											Professional Information
										</h3>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
											<FormField
												control={form.control}
												name='specialization'
												render={({ field }) => (
													<FormItem>
														<FormLabel>Specialization</FormLabel>
														<FormControl>
															<Input placeholder='Specialization' {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name='experience'
												render={({ field }) => (
													<FormItem>
														<FormLabel>Years of Experience</FormLabel>
														<FormControl>
															<Input
																placeholder='Years of experience'
																type='number'
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name='education'
												render={({ field }) => (
													<FormItem className='col-span-1 md:col-span-2'>
														<FormLabel>Education</FormLabel>
														<FormControl>
															<Textarea
																placeholder='Education and qualifications'
																className='min-h-24'
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>

									{/* Location Information Section */}
									<div>
										<h3 className='text-lg font-medium mb-4'>
											Location Information
										</h3>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
											<FormField
												control={form.control}
												name='city'
												render={({ field }) => (
													<FormItem>
														<FormLabel>City</FormLabel>
														<FormControl>
															<Input placeholder='City' {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name='state'
												render={({ field }) => (
													<FormItem>
														<FormLabel>State/Province</FormLabel>
														<FormControl>
															<Input placeholder='State' {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name='country'
												render={({ field }) => (
													<FormItem>
														<FormLabel>Country</FormLabel>
														<FormControl>
															<Input placeholder='Country' {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name='postalCode'
												render={({ field }) => (
													<FormItem>
														<FormLabel>Postal Code</FormLabel>
														<FormControl>
															<Input placeholder='Postal Code' {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name='address'
												render={({ field }) => (
													<FormItem className='col-span-1 md:col-span-2'>
														<FormLabel>Full Address</FormLabel>
														<FormControl>
															<Textarea
																placeholder='Full address'
																className='min-h-24'
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</div>

									{/* Hospital information display - not editable */}
									<div className='bg-blue-50 p-4 rounded-md'>
										<h3 className='text-base font-medium mb-2 text-blue-800'>
											Hospital Affiliation
										</h3>
										<p className='text-sm text-blue-700'>
											Current hospital:{' '}
											<strong>{doctor?.hospital?.name}</strong>
										</p>
										<p className='text-xs text-blue-600 mt-2'>
											To change your hospital affiliation, please contact the
											admin.
										</p>
									</div>
								</CardContent>
								<CardFooter className='flex justify-between pt-6'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setTab('profile')}
									>
										Cancel
									</Button>
									<Button
										type='submit'
										disabled={updating}
										className='bg-blue-600 hover:bg-blue-700 text-white'
									>
										{updating ? 'Saving...' : 'Save Changes'}
									</Button>
								</CardFooter>
							</form>
						</Form>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
