"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("patientToken");
        const res = await axios.get("http://localhost:8000/appointment", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAppointments(res.data.data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-64 ml-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screenr from-blue-50 to-blue-100 px-6 py-8">
      <div className="mb-6 flex">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => router.push("/patient/dashboard")}
        >
          ←
        </Button>
        <h1 className="text-3xl font-bold text-blue-900 mb-6 px-1.5">
          My Appointments
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((item) => (
          <Card
            key={item._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-lg font-semibold text-blue-900">
                Dr. {item.doctor.firstName} {item.doctor.lastName} (
                {item.doctor.specialization})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-600 mb-2">
                📅 {new Date(item.date).toDateString()} 🕒 {item.time}
              </p>
              <p className="text-gray-600 mb-2">
                🏥 {item.hospital.name}, {item.hospital.location}
              </p>
              <Badge
                variant={item.status === "pending" ? "warning" : "success"}
                className="mb-4"
              >
                Status: {item.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
