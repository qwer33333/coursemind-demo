"use client";

import Link from "next/link";
import { Badge } from "./Badge";

export function AppHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3 font-semibold text-white">
          <span className="grid size-9 place-items-center rounded-xl bg-cyan-400 font-black text-slate-950">
            C
          </span>
          CourseMind Demo
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/materials"
            className="text-sm text-slate-300 hover:text-white transition"
          >
            学习资料
          </Link>
          <Badge variant="cyan" size="sm">DeepSeek 驱动</Badge>
        </nav>
      </div>
    </header>
  );
}
