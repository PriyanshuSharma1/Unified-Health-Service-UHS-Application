import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Hospital {
	_id: string;
	name: string;
	address: string;
	contactNumber: string;
}

interface Props {
	hospitals: Hospital[];
}

export default function HospitalSearchResults({ hospitals }: Props) {
	if (hospitals.length === 0) {
		return (
			<p className='text-center text-muted-foreground mt-6'>
				No hospitals found
			</p>
		);
	}

	return (
		<div className='container mx-auto mt-4'>
			{hospitals.map((hospital) => (
				<Card key={hospital._id} className='border border-gray-200'>
					<CardHeader>
						<CardTitle className='text-blue-700 text-xl font-semibold'>
							{hospital.name}
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2'>
						<p className='text-gray-600'>{hospital.address}</p>
						<p className='text-gray-500'>📞 {hospital.contactNumber}</p>
						<Link href={`/patient/hospitals/${hospital._id}`}>
							<Button className='mt-3 w-full bg-blue-600 text-white'>
								View Profile
							</Button>
						</Link>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
