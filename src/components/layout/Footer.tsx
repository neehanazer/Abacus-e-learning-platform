"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, ShieldCheck, Heart, Share2, Globe, Video, MessageCircle } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide global marketing footer on dedicated dashboard, learning, and admin pages
  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/learning") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 relative overflow-hidden border-t-4 border-purple-500">
      {/* Decorative floating blurred blobs in footer background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-amber-400 p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-purple-400">
                  <Calculator className="w-5 h-5" />
                </div>
              </div>
              <span className="font-heading font-extrabold text-2xl text-white">
                Mind<span className="text-purple-400">Beads</span> <span className="text-amber-400">AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Empowering children to build lightning-fast mental arithmetic skills, confidence, and concentration through interactive virtual abacus learning and AI feedback.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-2 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4" />
              100% Safe & Ad-Free Kid-Friendly Platform
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="font-heading text-white font-bold text-base mb-4 tracking-wide">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-purple-400 transition flex items-center gap-1">
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-purple-400 transition flex items-center gap-1">
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-purple-400 transition flex items-center gap-1">
                  <span>How It Works</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-purple-400 transition flex items-center gap-1">
                  <span>Contact & Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Learning Journey Column */}
          <div>
            <h4 className="font-heading text-white font-bold text-base mb-4 tracking-wide">
              Learning Flow
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>1. Interactive Video Lessons</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>2. Virtual Abacus Practice</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>3. Smart AI Evaluation</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>4. Mock & Final Certification</span>
              </li>
            </ul>
          </div>

          {/* Socials & Contact Placeholders */}
          <div>
            <h4 className="font-heading text-white font-bold text-base mb-4 tracking-wide">
              Connect With Us
            </h4>
            <p className="text-slate-400 text-xs mb-4">
              Stay updated with friendly math tips, worksheets, and updates!
            </p>
            <div className="flex items-center gap-2">
              <a
                href="#social"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition flex items-center justify-center"
                aria-label="Video Tutorials"
                title="Video Tutorials"
              >
                <Video className="w-4 h-4" />
              </a>
              <a
                href="#social"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white transition flex items-center justify-center"
                aria-label="Community"
                title="Community"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#social"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition flex items-center justify-center"
                aria-label="Website"
                title="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#social"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white transition flex items-center justify-center"
                aria-label="Share"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Mind Beads AI Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for young math achievers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
