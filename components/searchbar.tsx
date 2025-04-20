import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import HospitalSearchResults from '@/components/hospitalsearch';

export default function SearchBar() {
	const [searchQuery, setSearchQuery] = useState('');
	const [hospitals, setHospitals] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (searchQuery.trim() !== '') {
			const delayDebounceFn = setTimeout(() => {
				searchHospitals();
			}, 800);
			return () => clearTimeout(delayDebounceFn);
		}
	}, [searchQuery]);
	useEffect(() => {
		setSearchQuery(
			(prevQuery) => prevQuery.charAt(0).toUpperCase() + prevQuery.slice(1)
		);
	}, [searchQuery]);

	const searchHospitals = async () => {
		setLoading(true);
		setError('');
		try {
			const response = await axios.get(
				`http://localhost:8000/auth/hospital/hospsearch?name=${searchQuery}`
			);
			setHospitals(response.data.data || []);
		} catch (error) {
			console.error('Error searching hospitals:', error);
			setError('Failed to fetch hospitals. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='w-full mb-6'>
			<div className='flex items-center space-x-2'>
				<span className='text-xl'>🔍</span>
				<Input
					type='text'
					placeholder='Search hospital...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='flex-1'
				/>
				<Button
					onClick={searchHospitals}
					disabled={loading}
					className='shrink-0'
				>
					{loading ? '...' : 'Search'}
				</Button>
			</div>

			{error && <p className='text-red-500 text-sm mt-2'>{error}</p>}

			{loading && (
				<p className='text-muted text-sm mt-2'>Searching hospitals...</p>
			)}

			<HospitalSearchResults hospitals={hospitals} />
		</div>
	);
}
