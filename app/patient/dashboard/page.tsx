"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LocationDisplay from "@/components/locationdisplay";
import SearchBar from "@/components/searchbar";
import Image from "next/image";
import axios from "axios";

export default function PatientDashboard() {
  const router = useRouter();
  const [patientName, setPatientName] = useState("Patient");
  const [loading, setLoading] = useState(true); // Added loading state
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchPatientName = async () => {
      try {
        const token = await localStorage.getItem("patientToken");
        if (!token) {
          router.push("/patient/signin");
          return;
        }

        const response = await axios.get("http://localhost:8000/patient", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPatientName(response.data.name || "Patient");
      } catch (error) {
        console.error("Error fetching patient name:", error);
        router.push("/patient/signin");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchPatientName();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-8">
      {/* Search Bar */}
      <SearchBar />

      {/* Top Bar with Profile */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-lg text-gray-600">Hello,</p>
          <h1 className="text-3xl font-bold text-blue-900">{patientName} 👋</h1>
          <p className="text-sm text-gray-500">{currentDate}</p>
        </div>
        <div className="relative">
          <Image
            src="https://cdn-icons-png.flaticon.com/512/2922/2922561.png"
            alt="Profile"
            width={60}
            height={60}
            className="rounded-full border-2 border-blue-500"
          />
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
        </div>
      </div>

      {/* Location Display */}
      <div className="flex items-center mb-8 text-lg text-gray-700">
        <span className="mr-2">📍</span>
        <LocationDisplay />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-4xl mb-2">🩺</span>
            <Button
              className="bg-blue-600 text-white text-sm font-semibold"
              onClick={() => router.push("/patient/appointments")}
            >
              View Appointments
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex flex-col items-center">
            <span className="text-4xl mb-2">💊</span>
            <Button
              className="bg-blue-600 text-white text-sm font-semibold"
              onClick={() => router.push("/patient/medications")}
            >
              My Medications
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Section */}
      <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg font-semibold text-blue-900">
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600">You have no upcoming appointments.</p>
          <Button
            className="mt-4 w-full bg-blue-600 text-white text-lg font-semibold"
            onClick={() => router.push("/patient/appointments")}
          >
            📅 Schedule Appointment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
