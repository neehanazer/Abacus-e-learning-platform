import React from "react";
import type { Metadata } from "next";
import CertificatePageView from "@/components/certificate/CertificatePageView";

export const metadata: Metadata = {
  title: "Mastery Certification & Re-Examination | Abacus Video Lessons & Learning Hub",
  description:
    "View your certified Abacus Soroban diplomas, manage 24-hour re-examination cooldown, and verify credentials.",
};

export default function LearningCertificatePage() {
  return <CertificatePageView layoutContext="learning" />;
}
