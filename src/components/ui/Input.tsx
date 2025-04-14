import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  fullWidth = false,
  className = "",
  ...props
}: InputProps) {
  const inputClasses = `
    mt-1 block w-full rounded-md border-gray-300 shadow-sm 
    focus:border-[#EE6E27] focus:ring-[#EE6E27] 
    ${error ? "border-red-500" : ""}
    ${className}
  `;

  return (
    <div className={`${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
