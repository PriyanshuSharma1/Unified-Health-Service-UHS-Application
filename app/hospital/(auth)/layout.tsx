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
		const token = localStorage.getItem('hospitalToken');
		if (!token) {
			window.location.href = '/hospital/signin';
		}
	}, []);

	return (
		<div>
			<div>{children}</div>
		</div>
	);
}
