import React from "react";
import type { Metadata } from "next";
import { LearningProvider } from "@/context/LearningContext";
import LearningNavbar from "@/components/learning/LearningNavbar";
import CelebrationModal from "@/components/learning/CelebrationModal";

export const metadata: Metadata = {
  title: "Abacus Video Lessons & Learning Hub | AbacusMind AI",
  description:
    "Interactive child-friendly video lessons for Abacus mastery, bead manipulation techniques, and mental arithmetic foundations.",
};

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LearningProvider>
      <div className="min-h-screen bg-[#FFFBF0] flex flex-col font-sans selection:bg-yellow-200">
        {/* Dedicated Student Learning Navbar */}
        <LearningNavbar />

        {/* Main Content Area */}
        <main className="flex-grow">{children}</main>

        {/* Global Celebration Popup */}
        <CelebrationModal />
      </div>
    </LearningProvider>
  );
}
