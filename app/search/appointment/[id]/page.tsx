"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

export default function AppointmentScreen() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id; // because your file is [doctorId].tsx  console.log("doctorid:", doctorId);
  console.log("doctor id:", doctorId);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("patientToken");

      const res = await axios.post(
        `http://localhost:8000/appointment/booking/${doctorId}`,
        {
          doctorId,
          date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = res.data;
      alert("Appointment booked successfully!");
      router.push(`/search/bookingdetails/${data.data._id}`);
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted px-6 py-10">
      
      <Card className="max-w-xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-900 text-2xl font-bold">
            Book Appointment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-gray-700 font-medium mb-2">
              Selected Date & Time
            </p>
            <p className="text-sm text-gray-600">{date.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Choose Date & Time
            </label>
            <DatePicker
              selected={date}
              onChange={(val) => setDate(val as Date)}
              showTimeSelect
              dateFormat="Pp"
              timeFormat="HH:mm"
              timeIntervals={15}
              className="w-full rounded-lg border px-4 py-3 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              popperClassName="z-[1001]"
            />
          </div>

          <Separator />

          <Button
            onClick={handleBooking}
            className="w-full bg-blue-600 text-white text-base font-semibold"
            disabled={loading}
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
