import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm",
        className,
      )}
      {...props}
    />
  );
}