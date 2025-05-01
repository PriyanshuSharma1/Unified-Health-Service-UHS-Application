'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import axios from 'axios';

export default function AppointmentScreen() {
	const router = useRouter();
	const params = useParams();
	const { id: doctorId } = params;

	const [date, setDate] = useState<Date | undefined>(new Date());
	const [selectedTime, setSelectedTime] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [availableSlots, setAvailableSlots] = useState<string[]>([]);

	// Generate time slots for specific hours (10-12, 1-3, 5-7)
	useEffect(() => {
		if (!date) return;

		const generateTimeSlots = () => {
			const slots: string[] = [];

			// Morning slots: 10 AM - 12 PM
			for (let hour = 10; hour < 12; hour++) {
				for (let minute = 0; minute < 60; minute += 15) {
					const formattedHour = hour.toString().padStart(2, '0');
					const formattedMinute = minute.toString().padStart(2, '0');
					slots.push(`${formattedHour}:${formattedMinute}:00`);
				}
			}

			// Afternoon slots: 1 PM - 3 PM
			for (let hour = 13; hour < 16; hour++) {
				for (let minute = 0; minute < 60; minute += 15) {
					const formattedHour = hour.toString().padStart(2, '0');
					const formattedMinute = minute.toString().padStart(2, '0');
					slots.push(`${formattedHour}:${formattedMinute}:00`);
				}
			}

			// Evening slots: 5 PM - 7 PM
			for (let hour = 17; hour < 18; hour++) {
				for (let minute = 0; minute < 60; minute += 15) {
					const formattedHour = hour.toString().padStart(2, '0');
					const formattedMinute = minute.toString().padStart(2, '0');
					slots.push(`${formattedHour}:${formattedMinute}:00`);
				}
			}

			return slots;
		};

		setAvailableSlots(generateTimeSlots());
		setSelectedTime(null); // Reset selected time when date changes
	}, [date]);

	const handleBooking = async () => {
		if (!date || !selectedTime) {
			alert('Please select both date and time');
			return;
		}

		try {
			setLoading(true);
			const token = localStorage.getItem('patientToken');

			// Create a new Date object combining the selected date and time
			const [hours, minutes] = selectedTime.split(':').map(Number);
			const appointmentDate = new Date(date);
			console.log('Selected Date:', appointmentDate);
			appointmentDate.setHours(hours, minutes, 0, 0);
			console.log('Booking appointment:', appointmentDate);

			const res = await axios.post(
				`http://localhost:8000/appointment/booking/${doctorId}`,
				{
					doctorId,
					// this gives the date in ISO format in UTC format so the time is not correct
					// we will directly use the appointment time rather than the date
					// and the reason is, by saving in the default format, we can easily
					// convert it to the local time of the user
					appointmentDate: appointmentDate.toISOString(),
					appointmentTime: selectedTime,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			alert('Appointment booked successfully!');
			router.push(
				`/patient/appointments/detail/${res.data.data.appointment._id}`
			);
		} catch (error) {
			console.error('Error booking appointment:', error);
			alert('Failed to book appointment. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Group time slots by time period for better UI organization
	const morningSlots = availableSlots.filter((time) => {
		const hour = parseInt(time.split(':')[0]);
		return hour >= 10 && hour < 12;
	});

	const afternoonSlots = availableSlots.filter((time) => {
		const hour = parseInt(time.split(':')[0]);
		return hour >= 13 && hour < 15;
	});

	const eveningSlots = availableSlots.filter((time) => {
		const hour = parseInt(time.split(':')[0]);
		return hour >= 17 && hour < 19;
	});

	return (
		<div className='min-h-screen bg-muted px-6 py-10'>
			<Card className='max-w-3xl mx-auto shadow-lg'>
				<CardHeader>
					<CardTitle className='text-blue-900 text-2xl font-bold'>
						Book Appointment
					</CardTitle>
					<CardDescription>
						Please select a date and available time slot
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					<div className='grid md:grid-cols-2 gap-6'>
						{/* Calendar Section */}
						<div className='space-y-2'>
							<h3 className='font-medium text-gray-700'>Select Date</h3>
							<div className='border rounded-md p-2'>
								<Calendar
									mode='single'
									selected={date}
									onSelect={setDate}
									className='rounded-md border'
									disabled={(date) => {
										// Disable past dates and weekends if needed
										const today = new Date();
										today.setHours(0, 0, 0, 0);
										return date < today;
									}}
								/>
							</div>
						</div>

						{/* Time Slots Section */}
						<div className='space-y-4'>
							<h3 className='font-medium text-gray-700'>Select Time Slot</h3>
							{date && (
								<div className='space-y-4'>
									{/* Morning slots */}
									<div>
										<h4 className='text-sm font-semibold text-gray-500 mb-2'>
											Morning (10 AM - 12 PM)
										</h4>
										<div className='grid grid-cols-4 gap-2'>
											{morningSlots.map((time) => (
												<Button
													key={time}
													variant={
														selectedTime === time ? 'default' : 'outline'
													}
													className='text-xs h-8'
													onClick={() => setSelectedTime(time)}
												>
													{format(
														new Date().setHours(
															parseInt(time.split(':')[0]),
															parseInt(time.split(':')[1])
														),
														'h:mm a'
													)}
												</Button>
											))}
										</div>
									</div>

									{/* Afternoon slots */}
									<div>
										<h4 className='text-sm font-semibold text-gray-500 mb-2'>
											Afternoon (1 PM - 3 PM)
										</h4>
										<div className='grid grid-cols-4 gap-2'>
											{afternoonSlots.map((time) => (
												<Button
													key={time}
													variant={
														selectedTime === time ? 'default' : 'outline'
													}
													className='text-xs h-8'
													onClick={() => setSelectedTime(time)}
												>
													{format(
														new Date().setHours(
															parseInt(time.split(':')[0]),
															parseInt(time.split(':')[1])
														),
														'h:mm a'
													)}
												</Button>
											))}
										</div>
									</div>

									{/* Evening slots */}
									<div>
										<h4 className='text-sm font-semibold text-gray-500 mb-2'>
											Evening (5 PM - 7 PM)
										</h4>
										<div className='grid grid-cols-4 gap-2'>
											{eveningSlots.map((time) => (
												<Button
													key={time}
													variant={
														selectedTime === time ? 'default' : 'outline'
													}
													className='text-xs h-8'
													onClick={() => setSelectedTime(time)}
												>
													{format(
														new Date().setHours(
															parseInt(time.split(':')[0]),
															parseInt(time.split(':')[1])
														),
														'h:mm a'
													)}
												</Button>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className='bg-blue-50 p-4 rounded-lg'>
						<h3 className='font-medium text-gray-700 mb-2'>
							Appointment Summary
						</h3>
						<p className='text-sm text-gray-600'>
							Date: {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Not selected'}
						</p>
						<p className='text-sm text-gray-600'>
							Time:{' '}
							{selectedTime
								? format(
										new Date().setHours(
											parseInt(selectedTime.split(':')[0]),
											parseInt(selectedTime.split(':')[1])
										),
										'h:mm a'
								  )
								: 'Not selected'}
						</p>
					</div>

					<Separator />

					<Button
						onClick={handleBooking}
						className='w-full bg-blue-600 text-white text-base font-semibold'
						disabled={loading || !date || !selectedTime}
					>
						{loading ? 'Booking...' : 'Confirm Appointment'}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
