"use client";

import React from "react";
import { HomeworkProvider } from "@/context/HomeworkContext";
import { HomeworkDashboard } from "@/components/homework/HomeworkDashboard";

export default function HomeworkPage() {
  return (
    <HomeworkProvider>
      <div className="min-h-screen bg-[#FFFBF0] relative overflow-hidden pb-16">
        {/* Soft Background Warm Glowing Elements */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <HomeworkDashboard />
        </div>
      </div>
    </HomeworkProvider>
  );
}
