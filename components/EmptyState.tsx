"use client";

import Link from "next/link";
import { Card } from "./Card";
import { Button } from "./Button";

export function EmptyState({ message }: { message: string }) {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-xl place-items-center px-5">
      <Card padding="lg" className="w-full text-center">
        <p className="mb-6 text-slate-300">{message}</p>
        <Link href="/">
          <Button variant="primary">返回首页</Button>
        </Link>
      </Card>
    </main>
  );
}
