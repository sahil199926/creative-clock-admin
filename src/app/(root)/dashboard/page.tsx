"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("sahli199926@gmail.com");

  const handleLogout = () => {
    // Clear the auth token
    document.cookie =
      "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#EE6E27]">Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {userEmail}</h2>
        <p className="text-gray-600">
          You have successfully logged in to the Creative Clock Admin dashboard.
        </p>
      </div>
    </div>
  );
}
