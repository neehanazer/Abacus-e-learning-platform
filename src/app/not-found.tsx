import React from "react";
import Link from "next/link";
import { ArrowLeft, Calculator } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4 shadow-inner">
        <Calculator className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-800 font-heading mb-2">Page Not Found</h1>
      <p className="text-slate-500 max-w-md mb-6 text-sm">
        Oops! We couldn&apos;t find the abacus page you were looking for. Let&apos;s get you back on track!
      </p>
      <Link href="/">
        <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
          Return to Home
        </Button>
      </Link>
    </div>
  );
}
