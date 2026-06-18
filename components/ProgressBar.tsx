"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  showPercent = false,
  className = "",
}: ProgressBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className={className}>
      {showPercent && (
        <p className="mb-1 text-sm text-slate-400">
          {value} / {max}
        </p>
      )}
      <div className="progress">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
