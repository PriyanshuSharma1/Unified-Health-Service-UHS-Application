'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Doctor {
	_id: string;
	firstName: string;
	lastName: string;
	specialization: string;
	contactNumber: string;
	email: string;
	hospital?: {
		name: string;
		location?: string;
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
}

export default function HospitalDoctors() {
	const [doctors, setDoctors] = useState<Doctor[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const router = useRouter();

	const fetchDoctorInfo = async () => {
		try {
			const token = localStorage.getItem('hospitalToken');
			const res = await fetch('http://localhost:8000/auth/verify', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await res.json();
			setDoctors(data.data);
		} catch (err) {
			setError('Failed to load doctors');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDoctorInfo();
	}, []);

	const verifyDoctors = async (id: string, verified: boolean) => {
		try {
			const token = localStorage.getItem('hospitalToken');
			await fetch(`http://localhost:8000/auth/${id}/verified`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ verified }),
			});
			setDoctors((prev) =>
				prev.map((doc) => (doc._id === id ? { ...doc, verified } : doc))
			);
		} catch (error) {
			console.error('Error updating the verification', error);
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-blue-600 text-lg font-medium'>Loading doctors...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-red-600 text-lg font-medium'>{error}</p>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-muted px-6 py-8'>
			<Button
				variant='outline'
				className='mb-4'
				onClick={() => router.push('/hospital/dashboard')}
			>
				← Back to Dashboard
			</Button>
			<h1 className='text-3xl font-extrabold text-accent mb-6'>
				Doctors to Review
			</h1>

			<div className='space-y-6'>
				{doctors.map((item) => (
					<Card key={item._id} className='border shadow-sm'>
						<CardHeader>
							<CardTitle className='text-xl text-blue-900 mb-1'>
								Dr. {item.firstName} {item.lastName}
							</CardTitle>
							<p className='text-sm text-gray-600'>
								Specialization: {item.specialization}
							</p>
							<p className='text-sm text-gray-600'>
								Experience: {item.experience} years
							</p>
							<p className='text-sm text-gray-600'>
								Education: {item.education}
							</p>
							<p className='text-sm text-gray-600'>Age: {item.age}</p>
							<p className='text-sm text-gray-600'>
								📍 Address: {item.address}, {item.city}, {item.state},{' '}
								{item.postalCode}, {item.country}
							</p>
							<p className='text-sm text-gray-600'>
								📞 Contact: {item.contactNumber}
							</p>
							<p className='text-sm text-gray-600'>📧 Email: {item.email}</p>
							{item.hospital && (
								<p className='text-sm text-gray-600'>
									🏥 Hospital: {item.hospital.name}{' '}
									{item.hospital.location ? `, ${item.hospital.location}` : ''}
								</p>
							)}
							<p
								className={`font-semibold mt-2 ${
									item.verified ? 'text-green-600' : 'text-yellow-600'
								}`}
							>
								{item.verified ? '✅ Verified Doctor' : '⏳ Not Verified'}
							</p>
						</CardHeader>
						<CardContent>
							<Button
								className='w-full'
								onClick={() => verifyDoctors(item._id, !item.verified)}
							>
								{item.verified ? '❌ Unverify Doctor' : '✅ Verify Doctor'}
							</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
