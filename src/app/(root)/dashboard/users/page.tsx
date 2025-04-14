"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";

interface User {
  id: string;
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

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const handleViewDetails = (user: User) => {
    router.push(`/dashboard/users/${user.email}`);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => {
          const data = doc.data() as User;
          return {
            id: doc.id,
            email: data.email,
            createdAt: data.createdAt
              ? new Date(data.createdAt).toLocaleDateString()
              : "N/A",
            friends: Array.isArray(data.friends) ? data.friends : [],
            goals: data.goals || {},
          };
        });
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    {
      header: "Email",
      accessor: (user: User) => user.email,
    },
    {
      header: "Created At",
      accessor: (user: User) => user.createdAt,
    },
    {
      header: "Total Friends",
      accessor: (user: User) => user.friends.length.toString(),
    },
    {
      header: "Goals",
      accessor: (user: User) => {
        const goalCount = Object.keys(user.goals).length;
        return goalCount.toString();
      },
    },
    {
      header: "Actions",
      accessor: (user: User) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(user)}
          >
            View Details
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE6E27]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#EE6E27]">Users</h1>
        <Button variant="secondary">Add User</Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table data={users} columns={columns} />
      </div>
    </div>
  );
}
