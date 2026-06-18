"use client";

type BadgeVariant = "cyan" | "indigo" | "emerald" | "rose" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

const variantClass: Record<BadgeVariant, string> = {
  cyan: "badge-cyan",
  indigo: "badge-indigo",
  emerald: "badge-emerald",
  rose: "badge-rose",
  neutral: "badge-neutral",
};

export function Badge({
  variant = "neutral",
  size = "md",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span className={`badge ${variantClass[variant]} ${size === "sm" ? "badge-sm" : ""} ${className}`}>
      {children}
    </span>
  );
}
