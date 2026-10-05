"use client";

import React, { useEffect } from "react";
import Button from "@/components/ui/Button";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global page error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-inner text-2xl font-bold">
        ⚠️
      </div>
      <h2 className="text-3xl font-extrabold text-slate-800 font-heading mb-2">Something went wrong</h2>
      <p className="text-slate-500 max-w-md mb-6 text-sm">
        An unexpected error occurred while loading this page. You can try refreshing or go back to home.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={() => reset()} icon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" icon={<Home className="w-4 h-4" />}>
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
