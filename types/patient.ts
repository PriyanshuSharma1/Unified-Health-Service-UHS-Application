export interface Patient {
	firstName: string;
	lastName: string;
	age: number;
	gender: 'male' | 'female' | 'other' | 'prefer not to say';
	contactNumber: string;
	email: string;
	otp: string;
}
