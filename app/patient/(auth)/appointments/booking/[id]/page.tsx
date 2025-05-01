'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, isSameDay } from 'date-fns';
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
import axios from 'axios';

// Define an interface for the taken slots
interface TakenAppointment {
	_id: string;
	appointmentDate: string;
	appointmentTime: string;
	status: string;
}

export default function AppointmentScreen() {
	const router = useRouter();
	const params = useParams();
	const doctorId = params.id;

	const [date, setDate] = useState<Date | undefined>(new Date());
	const [selectedTime, setSelectedTime] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [availableSlots, setAvailableSlots] = useState<string[]>([]);

	// State for taken appointments
	const [takenAppointments, setTakenAppointments] = useState<
		TakenAppointment[]
	>([]);

	// Fetch doctor's taken appointments
	useEffect(() => {
		const fetchTakenSlots = async () => {
			try {
				const res = await axios.get(
					`http://localhost:8000/appointments/doctor/${doctorId}`
				);

				if (res.data && res.data.data && res.data.data.appointments) {
					setTakenAppointments(res.data.data.appointments);
					console.log('Taken appointments:', res.data.data.appointments);
				}
			} catch (error) {
				console.error('Error fetching taken slots:', error);
			}
		};

		fetchTakenSlots();
	}, [doctorId]);

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
					slots.push(`${formattedHour}:${formattedMinute}`);
				}
			}

			// Afternoon slots: 1 PM - 3 PM
			for (let hour = 13; hour < 16; hour++) {
				for (let minute = 0; minute < 60; minute += 15) {
					const formattedHour = hour.toString().padStart(2, '0');
					const formattedMinute = minute.toString().padStart(2, '0');
					slots.push(`${formattedHour}:${formattedMinute}`);
				}
			}

			// Evening slots: 5 PM - 7 PM
			for (let hour = 17; hour < 18; hour++) {
				for (let minute = 0; minute < 60; minute += 15) {
					const formattedHour = hour.toString().padStart(2, '0');
					const formattedMinute = minute.toString().padStart(2, '0');
					slots.push(`${formattedHour}:${formattedMinute}`);
				}
			}

			return slots;
		};

		setAvailableSlots(generateTimeSlots());
		setSelectedTime(null); // Reset selected time when date changes
	}, [date]);

	// Check if a time slot is taken
	const isSlotTaken = (timeSlot: string): boolean => {
		if (!date) return false;

		return takenAppointments.some((appointment) => {
			const appointmentDate = new Date(appointment.appointmentDate);
			// Compare if it's the same day and same time slot
			return (
				isSameDay(appointmentDate, date) &&
				appointment.appointmentTime === timeSlot &&
				['scheduled', 'confirmed', 'pending'].includes(
					appointment.status.toLowerCase()
				)
			);
		});
	};

	const handleBooking = async () => {
		if (!date || !selectedTime) {
			alert('Please select both date and time');
			return;
		}

		try {
			setLoading(true);
			const token = localStorage.getItem('patientToken');

			// Format the date as YYYY-MM-DD
			const formattedDate = format(date, 'yyyy-MM-dd');

			const res = await axios.post(
				`http://localhost:8000/appointments/booking/${doctorId}`,
				{
					doctorId,
					appointmentDate: formattedDate,
					appointmentTime: selectedTime,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			alert('Appointment booked successfully!');
			console.log('Booking response:', res.data);
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
					<CardTitle className='text-primary text-2xl font-bold'>
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
										// Disable past dates
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
											{morningSlots.map((time) => {
												const taken = isSlotTaken(time);
												return (
													<Button
														key={time}
														variant={
															selectedTime === time ? 'default' : 'outline'
														}
														className={`text-xs h-8 ${
															taken
																? 'opacity-50 cursor-not-allowed bg-gray-100'
																: ''
														}`}
														onClick={() => !taken && setSelectedTime(time)}
														disabled={taken}
													>
														{format(
															new Date().setHours(
																parseInt(time.split(':')[0]),
																parseInt(time.split(':')[1])
															),
															'h:mm a'
														)}
													</Button>
												);
											})}
										</div>
									</div>

									{/* Afternoon slots */}
									<div>
										<h4 className='text-sm font-semibold text-gray-500 mb-2'>
											Afternoon (1 PM - 3 PM)
										</h4>
										<div className='grid grid-cols-4 gap-2'>
											{afternoonSlots.map((time) => {
												const taken = isSlotTaken(time);
												return (
													<Button
														key={time}
														variant={
															selectedTime === time ? 'default' : 'outline'
														}
														className={`text-xs h-8 ${
															taken
																? 'opacity-50 cursor-not-allowed bg-gray-100'
																: ''
														}`}
														onClick={() => !taken && setSelectedTime(time)}
														disabled={taken}
													>
														{format(
															new Date().setHours(
																parseInt(time.split(':')[0]),
																parseInt(time.split(':')[1])
															),
															'h:mm a'
														)}
													</Button>
												);
											})}
										</div>
									</div>

									{/* Evening slots */}
									<div>
										<h4 className='text-sm font-semibold text-gray-500 mb-2'>
											Evening (5 PM - 7 PM)
										</h4>
										<div className='grid grid-cols-4 gap-2'>
											{eveningSlots.map((time) => {
												const taken = isSlotTaken(time);
												return (
													<Button
														key={time}
														variant={
															selectedTime === time ? 'default' : 'outline'
														}
														className={`text-xs h-8 ${
															taken
																? 'opacity-50 cursor-not-allowed bg-gray-100'
																: ''
														}`}
														onClick={() => !taken && setSelectedTime(time)}
														disabled={taken}
													>
														{format(
															new Date().setHours(
																parseInt(time.split(':')[0]),
																parseInt(time.split(':')[1])
															),
															'h:mm a'
														)}
													</Button>
												);
											})}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className='bg-primary/10 p-4 rounded-lg'>
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
						className='w-full bg-primary hover:bg-primary/90 text-white text-base font-semibold'
						disabled={loading || !date || !selectedTime}
					>
						{loading ? 'Booking...' : 'Confirm Appointment'}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
