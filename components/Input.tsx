"use client";

import type { ChangeEvent } from "react";

/* ---- Label ---- */
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

export function Label({ children, required, className = "", ...rest }: LabelProps) {
  return (
    <label className={`label ${className}`} {...rest}>
      {children}
      {required && <span className="ml-1 text-rose-400">*</span>}
    </label>
  );
}

/* ---- Input ---- */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export function Input({ label, error, required, className = "", id, ...rest }: InputProps) {
  const inputId = id || (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);
  return (
    <div className="input-group mb-5">
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      <input id={inputId} className={`input ${className}`} {...rest} />
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}

/* ---- Select ---- */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: Array<{ value: string | number; label: string }>;
}

export function Select({
  label,
  error,
  required,
  options,
  className = "",
  id,
  ...rest
}: SelectProps) {
  const selectId = id || (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);
  return (
    <div className="input-group mb-5">
      {label && (
        <Label htmlFor={selectId} required={required}>
          {label}
        </Label>
      )}
      <select id={selectId} className={`select ${className}`} {...rest}>
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}
