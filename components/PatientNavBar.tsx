"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarIcon,
  PillIcon,
  UserIcon,
  LogOutIcon,
  SearchIcon,
} from "lucide-react";
import axios from "axios";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Patient {
  firstName: string;
  lastName: string;
  email: string;
}

export function PatientNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("patientToken");

        if (!token) {
          // If no token found, don't make the request
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8000/patients/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setPatient(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load patient info:", error);
        // If there's an authentication error, clear the token
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("patientToken");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      href: "/patient/dashboard",
      icon: <PillIcon className="h-4 w-4 mr-2" />,
    },
    {
      name: "Appointments",
      href: "/patient/appointments",
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
    },
    {
      name: "Profile",
      href: "/patient/profile",
      icon: <UserIcon className="h-4 w-4 mr-2" />,
    },
    {
      name: "Search",
      href: "/patient/search",
      icon: <SearchIcon className="h-4 w-4 mr-2" />,
    },
  ];

  const handleLogout: () => void = () => {
    localStorage.removeItem("patientToken");
    router.push("/patient/signin");
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!patient) return "PA"; // Patient Avatar default
    return `${patient.firstName.charAt(0)}${
      patient.lastName ? patient.lastName.charAt(0) : ""
    }`;
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <div className="flex items-center">
          <Link href="/patient/dashboard" className="font-semibold mr-8">
            <Image
              src="/mass-logo.png"
              alt="MASS Logo"
              width={40}
              height={40}
              className="mr-2"
            />
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    href={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "flex items-center",
                      pathname === item.href ? "bg-accent" : ""
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition">
                <AvatarImage src="/avatar-placeholder.png" alt="Patient" />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : patient ? (
                    <>
                      <p className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {patient.email}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Not logged in
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/patient/profile"
                  className="flex items-center cursor-pointer"
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

export default PatientNavBar;
