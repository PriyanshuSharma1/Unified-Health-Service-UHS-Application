import React, { useEffect, useState } from "react";

export default function LocationDisplay() {
  const [location, setLocation] = useState<string>("Fetching location...");

  useEffect(() => {
    (async () => {
      try {
        const ipRes = await fetch("https://ipapi.co/json");
        const ipData = await ipRes.json();

        if (ipData && ipData.city && ipData.region && ipData.country_name) {
          setLocation(
            `${ipData.city}, ${ipData.region}, ${ipData.country_name}`
          );
        } else {
          setLocation("Location not found");
        }
      } catch (error) {
        console.error("Error fetching IP-based location:", error);
        setLocation("Failed to retrieve location");
      }
    })();
  }, []);

  return <p className="text-sm font-medium text-gray-800">{location}</p>;
}
