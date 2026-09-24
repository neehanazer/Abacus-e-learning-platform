"use client";
import React from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export default function Button({ variant = "primary", size = "md", children, icon, iconPosition = "right", fullWidth = false, className, ...props }) {
    const baseStyles = "inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";
    const sizeStyles = {
        sm: "px-4 py-2 text-sm gap-1.5",
        md: "px-6 py-3 text-base gap-2 shadow-md",
        lg: "px-8 py-4 text-lg gap-2.5 shadow-lg",
    };
    const variantStyles = {
        primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-purple-200/50 hover:shadow-purple-300/80 active:shadow-inner",
        secondary: "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-amber-200/50 hover:shadow-amber-300/80",
        accent: "bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-600 shadow-emerald-200/50",
        outline: "border-2 border-purple-300 bg-white/80 backdrop-blur-md text-purple-700 hover:bg-purple-50 hover:border-purple-400",
        ghost: "bg-transparent text-slate-700 hover:bg-slate-100/80",
    };
    return (<motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], fullWidth && "w-full", className))} {...props}>
      {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
    </motion.button>);
}
