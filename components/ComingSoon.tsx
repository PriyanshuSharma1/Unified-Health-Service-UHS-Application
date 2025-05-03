'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ComingSoon() {
	const router = useRouter();
	return (
		<div className='w-screen h-screen flex items-center justify-center'>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='text-center max-w-md'
			>
				<div className='mb-6 flex justify-center'>
					<motion.div
						animate={{ rotate: [0, 10, -10, 10, 0] }}
						transition={{
							duration: 3,
							repeat: Infinity,
							repeatType: 'loop',
						}}
						className='bg-blue-100 p-6 rounded-full'
					>
						<Construction size={48} className='text-blue-600' />
					</motion.div>
				</div>

				<h1 className='text-2xl md:text-3xl font-bold text-blue-900 mb-3'>
					Feature Coming Soon
				</h1>

				<p className='text-gray-600 mb-6'>
					We're working on this feature and it will be available soon.
				</p>

				<Button
					className='bg-blue-600 hover:bg-blue-700'
					onClick={() => router.back()}
				>
					Go Back
				</Button>
			</motion.div>
		</div>
	);
}
