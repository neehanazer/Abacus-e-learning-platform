"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Sparkles,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  MessageSquare,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Parent",
    childAge: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", role: "Parent", childAge: "", message: "" });
    }, 500);
  };

  const faqs = [
    {
      q: "What age group is this Abacus platform designed for?",
      a: "Our curriculum and virtual abacus are optimized for children aged 5 to 14 years. We offer level-wise learning from basic bead recognition for beginners up to advanced multi-digit mental arithmetic.",
    },
    {
      q: "Do we need to purchase a physical abacus tool?",
      a: "No! Our built-in Virtual Abacus tool simulates a real abacus on any tablet, computer, or touchscreen smartphone. However, if your child already has a physical abacus, they can use both side-by-side!",
    },
    {
      q: "How does the AI evaluation help my child?",
      a: "The AI system tracks calculation speed, detects formula patterns (like 'Small Friends' or 'Big Friends' rules), and gives instant encouraging hints when a mistake happens so children learn without feeling discouraged.",
    },
    {
      q: "Can schools or learning centers register as an institution?",
      a: "Yes! We support school partner accounts with batch student management, teacher progress monitors, and custom worksheet printing.",
    },
  ];

  return (
    <div className="space-y-20 pt-8 pb-20">
      {/* PAGE HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/90 text-purple-800 font-bold text-xs sm:text-sm border border-purple-200">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>We&apos;re Here to Help</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto font-heading">
          Get in Touch with Our <span className="text-gradient-purple">Abacus Team</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Have questions about levels, enrollment, or institutional partnerships? Send us a message and our education specialists will respond promptly.
        </p>
      </section>

      {/* CONTACT FORM & CONTACT INFO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Info Cards (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-3xl p-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-amber-50 shadow-xl space-y-6">
              <h3 className="text-2xl font-extrabold text-slate-800 font-heading">
                Reach Out Directly
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Whether you are a parent exploring courses or an educator with feedback, our friendly team is ready to guide you.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Email Support
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      support@mindbeads.ai
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Helpline (Mon - Sat)
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      +1 (800) 555-ABACUS
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Support Hours
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      9:00 AM - 6:00 PM EST
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold bg-purple-100/80 px-4 py-3 rounded-2xl border border-purple-200">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>100% Privacy Protection for Parent & Child Data</span>
              </div>
            </div>
          </div>

          {/* Contact Form (Right) */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-3xl p-8 md:p-10 border-2 border-purple-200 shadow-2xl relative bg-white">
              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 space-y-4"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800 font-heading">
                    Thank You for Contacting Us! 🎉
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                    We have received your message. One of our education advisors will reach out to you at <span className="font-bold text-purple-700">{formData.email || "your email"}</span> within 24 hours.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-4 px-6 py-2.5 rounded-2xl bg-purple-100 text-purple-700 font-bold text-sm hover:bg-purple-200 transition"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-800 font-heading mb-1">
                      Send a Message
                    </h3>
                    <p className="text-xs text-slate-500">
                      Fill out the details below and we&apos;ll be in touch shortly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        I am a *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 font-medium"
                      >
                        <option value="Parent">Parent</option>
                        <option value="Teacher">Teacher / School Educator</option>
                        <option value="Coaching Center">Coaching Center Owner</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Child&apos;s Age / Grade (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 7 years old / Grade 2"
                        value={formData.childAge}
                        onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Your Message or Question *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="How can we help your child or school with Abacus learning?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm bg-slate-50/50 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Parent & Educator FAQs"
          badgeIcon={<HelpCircle className="w-4 h-4 text-purple-600" />}
          title="Frequently Asked"
          highlightText="Questions"
          description="Everything you need to know about starting your child's abacus journey."
        />

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="glass-card rounded-2xl border border-purple-100 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-extrabold text-slate-800 text-base font-heading gap-4 hover:text-purple-600 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-600 transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-purple-50/80"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
