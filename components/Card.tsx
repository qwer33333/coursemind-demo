"use client";

interface CardProps {
  children: React.ReactNode;
  padding?: "none" | "md" | "lg";
  hover?: boolean;
  className?: string;
}

const paddingClass: Record<string, string> = {
  none: "",
  md: "p-6 sm:p-8",
  lg: "card-padded",
};

export function Card({ children, padding = "md", hover = false, className = "" }: CardProps) {
  const cls = ["card", paddingClass[padding], hover ? "card-hover" : "", className]
    .filter(Boolean)
    .join(" ");
  return <div className={cls}>{children}</div>;
}
