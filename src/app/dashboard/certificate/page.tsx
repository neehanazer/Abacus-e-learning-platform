import React from "react";
import type { Metadata } from "next";
import CertificatePageView from "@/components/certificate/CertificatePageView";

export const metadata: Metadata = {
  title: "Official Certificates & Re-Examination | Mind Beads AI",
  description:
    "View your certified Abacus Soroban diplomas, manage 24-hour re-examination eligibility, and verify cryptographic credentials.",
};

export default function DashboardCertificatePage() {
  return <CertificatePageView layoutContext="dashboard" />;
}
