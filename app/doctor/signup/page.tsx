"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Hospital {
  _id: string;
  name: string;
}

export default function DoctorSignUpForm() {
  const router = useRouter();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    contactNumber: "",
    specialization: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    hospitalId: "",
    experience: "",
    education: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch hospitals from the API
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8000/hospitals");
        if (response.data && Array.isArray(response.data.data)) {
          setHospitals(response.data.data);
        } else {
          console.error("Invalid hospital data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        setError("Failed to load hospitals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleHospitalChange = (value: string) => {
    setFormData({ ...formData, hospitalId: value });
  };

  const validateForm = () => {
    const {
      firstName,
      lastName,
      email,
      contactNumber,
      specialization,
      address,
      city,
      state,
      postalCode,
      country,
      hospitalId,
      experience,
      education,
      password,
      confirmPassword,
      age,
    } = formData;

    const isEmpty = [
      firstName,
      lastName,
      email,
      contactNumber,
      specialization,
      address,
      city,
      state,
      postalCode,
      country,
      hospitalId,
      experience,
      education,
      password,
      confirmPassword,
      age,
    ].some((field) => !field);

    if (isEmpty) {
      toast.error("All fields are required.");
      return "All fields are required.";
    }

    // Validate email
    const isValidEmail = (email: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email.");
      return "Invalid email.";
    }

    // Validate contact number
    const isValidPhoneNumber = (number: string) => /^\d{10}$/.test(number);
    if (!isValidPhoneNumber(contactNumber)) {
      toast.error("Contact number must be exactly 10 digits.");
      return "Invalid contact number.";
    }

    // Validate postal code
    const isValidPostalCode = (code: string) => /^\d{4,10}$/.test(code);
    if (!isValidPostalCode(postalCode)) {
      toast.error("Postal code must be numeric and 4–10 digits.");
      return "Invalid postal code.";
    }

    // Validate age
    const numericAge = Number(age);
    if (isNaN(numericAge) || numericAge <= 0 || !Number.isInteger(numericAge)) {
      toast.error("Please enter a valid age.");
      return "Invalid age.";
    }

    // Validate experience
    const numericExp = Number(experience);
    if (isNaN(numericExp) || numericExp < 0 || !Number.isInteger(numericExp)) {
      toast.error("Please enter a valid number of years of experience.");
      return "Invalid experience.";
    }

    // Validate password strength
    const isStrongPassword = (password: string) =>
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        password
      );
    if (!isStrongPassword(password)) {
      toast.error(
        "Password must be at least 8 characters, include a number, a special character, and an uppercase letter."
      );
      return "Weak password.";
    }

    // Passwords must match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return "Passwords do not match.";
    }

    return null; // All good!
  };

  const handleSignUp = async () => {
    const error = validateForm();
    if (error) {
      setError(error);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/auth/doctor/signup",
        formData
      );

      router.push("/doctor/signin");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-blue-900 text-3xl font-extrabold">
            Create Your Account
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Sign up to start managing your appointments and patients.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <Input
              placeholder="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <Input
            placeholder="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
            />
            <Input
              placeholder="Contact Number"
              name="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={handleChange}
            />
          </div>

          <Input
            placeholder="Specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
          />

          {/* Hospital Dropdown */}
          <Select
            onValueChange={handleHospitalChange}
            value={formData.hospitalId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Hospital" />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>
                  Loading hospitals...
                </SelectItem>
              ) : hospitals.length > 0 ? (
                hospitals.map((hospital) => (
                  <SelectItem key={hospital._id} value={hospital._id}>
                    {hospital.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No hospitals available
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
            />
            <Input
              placeholder="Education"
              name="education"
              value={formData.education}
              onChange={handleChange}
            />
          </div>

          <Input
            placeholder="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />

          <Input
            placeholder="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <Input
              placeholder="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </div>

          <Input
            placeholder="Postal Code"
            name="postalCode"
            type="number"
            value={formData.postalCode}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <Input
              placeholder="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <Button
            onClick={handleSignUp}
            className="w-full text-base font-semibold"
          >
            Create Account
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/doctor/signin" className="text-blue-600 font-medium">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
