import type { InputHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({ invalid = false, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900",
        "placeholder:text-gray-400 focus:outline-none focus:ring-2",
        invalid
          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
          : "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
        className,
      )}
      {...props}
    />
  );
}