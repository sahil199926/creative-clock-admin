"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);

  const handleSendNotifications = async () => {
    try {
      setIsSending(true);
      const response = await fetch("/api/notifications", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to send notifications");
      }

      alert("Notifications sent successfully!");
    } catch (error) {
      console.error("Error sending notifications:", error);
      alert("Error sending notifications. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#EE6E27]">Dashboard</h1>
        <div className="flex gap-4">
          <Button
            variant="primary"
            onClick={handleSendNotifications}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send Notification to All Users"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.email}</h2>
        <p className="text-gray-600">
          You have successfully logged in to the Creative Clock Admin dashboard.
        </p>
      </div>
    </div>
  );
}
