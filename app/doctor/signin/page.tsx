"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DoctorSignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/auth/doctor/signin",
        { email, password }
      );

      if (response.data.status === "error") {
        setError(response.data.message);
        return;
      }

      localStorage.setItem("doctorToken", response.data.token);
      router.push(`/doctor/dashboard?email=${email}`);
    } catch (error) {
      console.error("Sign-in error:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-blue-900 text-3xl font-extrabold">
            Welcome Back!
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to access your dashboard and manage appointments.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            onClick={handleSignIn}
            className="w-full text-base font-semibold"
          >
            Sign In
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            Don’t have an account?{" "}
            <Link
              href="/doctor/auth/signup"
              className="text-blue-600 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
