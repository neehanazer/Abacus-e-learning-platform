import type { Metadata } from "next";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import RotaryFabNav from "@/components/layout/RotaryFabNav";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mind Beads AI | Interactive Abacus E-Learning & Assessment Platform",
  description:
    "An interactive, friendly, and affordable AI-powered Abacus learning platform where children learn mental math, practice with virtual abacus, take mock exams, and build lifelong math confidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-abacus-pattern selection:bg-purple-200 selection:text-purple-900">
        <AuthProvider>
          {/* Laptop & Desktop Navigation Bar */}
          <Navbar />
          {/* Mobile & Phone Rotary FAB Navigation */}
          <RotaryFabNav />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
