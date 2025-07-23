"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams } from "next/navigation";

interface UserDetails {
  email: string;
  createdAt: string;
  friends: string[];
  goals: {
    Reading?: {
      duration: {
        hours: number;
        minutes: number;
      };
      frequency: string;
      id: string;
      title: string;
    };
    Writing?: {
      duration: {
        hours: number;
        minutes: number;
      };
      frequency: string;
      id: string;
      title: string;
    };
  };
}

export default function UserDetailsPage() {
  const params = useParams();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Create a query to find the user by email
        const usersRef = collection(db, "users");
        console.log(params.id);
        const q = query(usersRef, where("email", "==", params.id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Get the first matching document
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data() as UserDetails;
          setUser({
            ...userData,
            createdAt: userData.createdAt
              ? new Date(userData.createdAt).toLocaleString()
              : "N/A",
          });
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Error fetching user details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUserDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE6E27]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-yellow-700">No user data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Created At</p>
                <p className="font-medium">{user.createdAt}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Friends</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {user.friends && user.friends.length > 0 ? (
                <ul className="list-disc list-inside">
                  {user.friends.map((friend, index) => (
                    <li key={index} className="text-gray-700">
                      {friend}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No friends added yet</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Goals</h2>
            <div className="space-y-4">
              {Object.entries(user.goals || {}).map(([goalType, goal]) => (
                <div key={goalType} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2">{goalType}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium">
                        {goal.duration.hours}h {goal.duration.minutes}m
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Frequency</p>
                      <p className="font-medium">{goal.frequency}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!user.goals || Object.keys(user.goals).length === 0) && (
                <p className="text-gray-500">No goals set</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
