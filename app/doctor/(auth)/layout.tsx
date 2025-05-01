'use client';

import DoctorNavBar from '@/components/DoctorNavBar';
import { useEffect } from 'react';

export default function PatientAuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// check if token exists in localStorage
	useEffect(() => {
		const token = localStorage.getItem('doctorToken');
		if (!token) {
			window.location.href = '/doctor/signin';
		}
	}, []);

	return (
		<div>
			<DoctorNavBar />
			<div>{children}</div>
		</div>
	);
}
