import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  icon?: ReactNode;
};

export function Input({ invalid = false, icon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"
        >
          {icon}
        </span>
      ) : null}
      <input
        className={cn(
          "w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900",
          "placeholder:text-gray-400 focus:outline-none focus:ring-2",
          icon ? "pl-10" : "",
          invalid
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
          className,
        )}
        {...props}
      />
    </div>
  );
}