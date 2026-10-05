"use client";

import React, { Suspense } from "react";
import PracticeDashboard from "@/components/practice/PracticeDashboard";

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center p-8 text-slate-500 font-bold">
          Loading Practice...
        </div>
      }
    >
      <div className="min-h-screen bg-[#FFFBF0] relative overflow-hidden pb-16">
        {/* Soft Background Warm Glowing Elements */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <PracticeDashboard />
        </div>
      </div>
    </Suspense>
  );
}
