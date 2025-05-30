'use client';

import PatientNavBar from '@/components/PatientNavBar';
import { useEffect } from 'react';

export default function PatientAuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// check if token exists in localStorage
	useEffect(() => {
		const token = localStorage.getItem('patientToken');
		if (!token) {
			window.location.href = '/patient/signin';
		}
	}, []);

	return (
		<div>
			<PatientNavBar />
			<div>{children}</div>
		</div>
	);
}
