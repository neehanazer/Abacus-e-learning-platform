import React from "react";
import type { Metadata } from "next";
import { LearningProvider } from "@/context/LearningContext";
import { PracticeProvider } from "@/context/PracticeContext";
import LearningNavbar from "@/components/learning/LearningNavbar";
import CelebrationModal from "@/components/learning/CelebrationModal";

import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Abacus Video Lessons & Learning Hub | Mind Beads AI",
  description:
    "Interactive child-friendly video lessons for Abacus mastery, bead manipulation techniques, and mental arithmetic foundations.",
};

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <LearningProvider>
        <PracticeProvider>
          <div className="min-h-screen bg-[#FFFBF0] flex flex-col font-sans selection:bg-yellow-200">
            {/* Dedicated Student Learning Navbar */}
            <LearningNavbar />

            {/* Main Content Area */}
            <main className="flex-grow">{children}</main>

            {/* Global Celebration Popup */}
            <CelebrationModal />
          </div>
        </PracticeProvider>
      </LearningProvider>
    </AuthGuard>
  );
}
