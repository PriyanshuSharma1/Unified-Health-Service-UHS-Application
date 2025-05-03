"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Edit,
  FileText,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

// Define the Hospital interface
interface Hospital {
  _id: string;
  name: string;
  state: string;
  city: string;
  country: string;
  postalCode: string;
  address: string;
  contactNumber: string;
  email: string;
  registrationDocument: string;
  services: string;
  isValidated: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Create a schema for form validation
const hospitalSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Hospital name must be at least 3 characters" }),
  state: z.string().min(2, { message: "State is required" }),
  city: z.string().min(2, { message: "City is required" }),
  country: z.string().min(2, { message: "Country is required" }),
  postalCode: z.string().min(5, { message: "Valid postal code is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  contactNumber: z
    .string()
    .min(10, { message: "Valid contact number is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  services: z.string().optional(),
});

export default function HospitalDetail() {
  const router = useRouter();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [tab, setTab] = useState("details");

  // Initialize the form with zod resolver
  const form = useForm<z.infer<typeof hospitalSchema>>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: "",
      state: "",
      city: "",
      country: "",
      postalCode: "",
      address: "",
      contactNumber: "",
      email: "",
      services: "",
    },
  });

  // Fetch hospital data
  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("hospitalToken");

        if (!token) {
          router.push("/hospital/signin");
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/hospitals/current",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          const hospitalData = response.data.data;
          setHospital(hospitalData);

          // Set form values
          form.reset({
            name: hospitalData.name || "",
            state: hospitalData.state || "",
            city: hospitalData.city || "",
            country: hospitalData.country || "",
            postalCode: hospitalData.postalCode || "",
            address: hospitalData.address || "",
            contactNumber: hospitalData.contactNumber || "",
            email: hospitalData.email || "",
            services: hospitalData.services || "",
          });
        }
      } catch (error) {
        console.error("Error fetching hospital data:", error);
        setError("Failed to load hospital data. Please try again.");

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("hospitalToken");
          router.push("/hospital/signin");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, [router]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof hospitalSchema>) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("hospitalToken");

      const response = await axios.put(
        "http://localhost:8000/hospitals/update",
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Update local state with new values
        setHospital({
          ...hospital!,
          ...values,
        });
        setEditMode(false);
        router.push("/hospital/detail");
      }
    } catch (error) {
      console.error("Error updating hospital data:", error);
      setError("Failed to update hospital information. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Helper function to format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-primary font-medium">
            Loading hospital details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              There was a problem loading hospital details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Hospital Not Found</CardTitle>
            <CardDescription>
              We couldn't find your hospital information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please make sure you are logged in or contact support for
              assistance.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/hospital/signin")}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div>
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => router.push("/hospital/dashboard")}
        >
          ← Back to Dashboard
        </Button>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{hospital.name}</h1>
          <p className="text-muted-foreground flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {hospital.city}, {hospital.state}, {hospital.country}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          {hospital.isValidated ? (
            <Badge className="bg-green-600 text-white flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" /> Verified Hospital
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-500 text-amber-500 flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1" /> Pending Verification
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Hospital Details</TabsTrigger>
          <TabsTrigger value="edit">Edit Information</TabsTrigger>
        </TabsList>

        {/* View Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Information</CardTitle>
              <CardDescription>
                Review your hospital's registered details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Hospital Name
                  </h3>
                  <p className="text-lg">{hospital.name}</p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </h3>
                  <p className="text-lg flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    {hospital.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Contact Number
                  </h3>
                  <p className="text-lg flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    {hospital.contactNumber}
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Location
                  </h3>
                  <p className="text-lg">
                    {hospital.city}, {hospital.state}
                  </p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Country
                  </h3>
                  <p className="text-lg">{hospital.country}</p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Postal Code
                  </h3>
                  <p className="text-lg">{hospital.postalCode}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Full Address
                </h3>
                <p className="text-base">{hospital.address}</p>
              </div>

              {hospital.services && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Services Offered
                    </h3>
                    <p className="text-base">{hospital.services}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Registration Document
                </h3>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <span className="truncate max-w-xs">
                    {hospital.registrationDocument.split("/").pop() ||
                      "Registration Document"}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Registration Date:
                  </span>
                  <p>{formatDate(hospital.createdAt)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p>{formatDate(hospital.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => setTab("edit")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Hospital Information
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Edit Information Tab */}
        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Edit Hospital Information</CardTitle>
              <CardDescription>
                Update your hospital's registered details
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hospital Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Hospital name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Email"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Postal Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Full address"
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Services Offered</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe services your hospital offers"
                            className="min-h-36"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          List the medical services and specialties your
                          hospital provides. This will help patients find your
                          facility for specific treatments.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="text-sm font-medium mb-2">
                      Registration Document
                    </h3>
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="truncate max-w-xs">
                        {hospital.registrationDocument.split("/").pop() ||
                          "Registration Document"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      To update your registration document, please contact
                      support.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex pt-6 justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTab("details")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updating}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
