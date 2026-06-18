"use client";

import { useState } from "react";

type AlertVariant = "error" | "success" | "info";

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  className?: string;
}

const variantClass: Record<AlertVariant, string> = {
  error: "alert-error",
  success: "alert-success",
  info: "alert-info",
};

export function Alert({
  variant,
  title,
  children,
  dismissible = false,
  className = "",
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const cls = ["alert", variantClass[variant], className].filter(Boolean).join(" ");

  return (
    <div className={cls} role="alert">
      {dismissible && (
        <button
          className="self-end text-current opacity-60 hover:opacity-100 transition"
          onClick={() => setDismissed(true)}
          aria-label="关闭"
        >
          ✕
        </button>
      )}
      {title && <p className="alert-title">{title}</p>}
      <div>{children}</div>
    </div>
  );
}
