"use client";

import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  badge?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  hoverEffect?: boolean;
}

export default function Card({
  children,
  className,
  badge,
  icon,
  iconBgColor = "bg-purple-100 text-purple-600",
  hoverEffect = true,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      whileHover={hoverEffect ? { y: -6, scale: 1.01 } : undefined}
      className={twMerge(
        clsx(
          "glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-300",
          hoverEffect && "hover:shadow-xl hover:border-purple-200/90",
          className
        )
      )}
    >
      {badge && (
        <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
          {badge}
        </span>
      )}

      {icon && (
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm ${iconBgColor}`}>
          {icon}
        </div>
      )}

      {children}
    </motion.div>
  );
}
