"use client";

type MaxWidth = "sm" | "md" | "lg" | "xl" | "full";

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: MaxWidth;
  className?: string;
}

const maxWidthClass: Record<MaxWidth, string> = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  full: "max-w-full",
};

export function PageContainer({
  children,
  maxWidth = "xl",
  className = "",
}: PageContainerProps) {
  return (
    <main className={`mx-auto px-5 py-10 sm:py-14 ${maxWidthClass[maxWidth]} ${className}`}>
      {children}
    </main>
  );
}
