import React from "react";
import type { Metadata } from "next";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Student Dashboard & BrainGym | Mind Beads AI",
  description: "Personalized student abacus learning dashboard, progress tracking, and interactive brain gym games.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
