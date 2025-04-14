import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  description?: string;
}

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-[#EE6E27]">{value}</div>
      {description && (
        <div className="mt-1 text-sm text-gray-500">{description}</div>
      )}
    </div>
  );
}
