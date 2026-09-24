"use client";
import React from "react";
import { motion } from "framer-motion";
export default function SectionHeader({ badge, badgeIcon, title, highlightText, description, align = "center", }) {
    return (<motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, ease: "easeOut" }} className={`max-w-3xl mb-12 ${align === "center" ? "mx-auto text-center" : "text-left"}`}>
      {badge && (<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/90 text-purple-700 font-semibold text-xs md:text-sm tracking-wide mb-4 shadow-sm border border-purple-200/60">
          {badgeIcon}
          {badge}
        </span>)}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-800 leading-tight">
        {title}{" "}
        {highlightText && (<span className="text-gradient-purple underline decoration-amber-300 decoration-wavy decoration-2">
            {highlightText}
          </span>)}
      </h2>
      {description && (<p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>)}
    </motion.div>);
}
