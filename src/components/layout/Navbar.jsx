"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ArrowRight, Calculator, LogOut } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "@/context/AuthContext";
export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About Us", href: "/about" },
        { name: "How It Works", href: "/how-it-works" },
        { name: "Contact", href: "/contact" },
    ];
    const handleLogout = () => {
        logout();
        router.push("/");
    };
    // Hide global marketing navbar on the dedicated dashboard and learning portal pages
    if (pathname === "/dashboard" || pathname.startsWith("/learning")) {
        return null;
    }
    return (<header className="hidden md:block sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-purple-100/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 p-0.5 shadow-lg shadow-purple-200 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-purple-600">
                <Calculator className="w-6 h-6 stroke-[2.5]"/>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-2xl tracking-tight text-slate-800 flex items-center gap-1">
                Abacus<span className="text-purple-600">Mind</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                  AI
                </span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase -mt-1">
                Smart Abacus Learning
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-purple-50/60 p-1.5 rounded-2xl border border-purple-100/80">
            {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (<Link key={link.name} href={link.href} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative ${isActive
                    ? "text-purple-700 font-bold"
                    : "text-slate-600 hover:text-purple-600 hover:bg-white/50"}`}>
                  {isActive && (<motion.div layoutId="activeNavTab" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-purple-100" transition={{ type: "spring", stiffness: 400, damping: 30 }}/>)}
                  <span className="relative z-10">{link.name}</span>
                </Link>);
        })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (<div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-purple-100/80 border border-purple-200 hover:bg-purple-200/80 transition">
                  <span className="text-xl">{user.avatar}</span>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block leading-tight">
                      {user.fullName.split(" ")[0]}
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-white px-1.5 rounded-full inline-block">
                      {user.abacusLevel.split(" - ")[0]}
                    </span>
                  </div>
                </Link>
                <Button onClick={handleLogout} variant="outline" size="sm" icon={<LogOut className="w-4 h-4 text-slate-500"/>}>
                  Logout
                </Button>
              </div>) : (<>
                <Link href="/login">
                  <Button variant="ghost" size="sm" icon={<User className="w-4 h-4"/>}>
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4"/>}>
                    Register Free
                  </Button>
                </Link>
              </>)}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2.5 rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition" aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-purple-100 px-4 pt-2 pb-6 shadow-xl">
            <div className="flex flex-col gap-2 pt-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (<Link key={link.name} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 rounded-2xl text-base font-semibold transition ${isActive
                        ? "bg-purple-100 text-purple-800 font-bold"
                        : "text-slate-700 hover:bg-slate-50"}`}>
                    {link.name}
                  </Link>);
            })}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                {isAuthenticated && user ? (<>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-50">
                      <span className="text-2xl">{user.avatar}</span>
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">
                          {user.fullName}
                        </span>
                        <span className="text-xs text-purple-700 font-semibold">
                          {user.abacusLevel}
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                }} variant="outline" size="md" fullWidth icon={<LogOut className="w-4 h-4"/>}>
                      Logout
                    </Button>
                  </>) : (<>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="md" fullWidth icon={<User className="w-4 h-4"/>}>
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="md" fullWidth icon={<ArrowRight className="w-4 h-4"/>}>
                        Register Free
                      </Button>
                    </Link>
                  </>)}
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </header>);
}
