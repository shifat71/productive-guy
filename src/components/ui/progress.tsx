"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function Progress({ value, className, color, showLabel, size = "md" }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("relative w-full", className)}>
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", sizeClasses[size])}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            backgroundColor: color || "var(--primary)",
          }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs font-medium text-muted-foreground">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
