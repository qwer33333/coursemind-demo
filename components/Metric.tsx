"use client";

interface MetricProps {
  label: string;
  value: string | number;
}

export function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black text-white">{value}</p>
    </div>
  );
}
