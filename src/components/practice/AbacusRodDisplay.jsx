"use client";
import React from "react";
import { motion } from "framer-motion";
export default function AbacusRodDisplay({ value, digits = 1, size = "md", }) {
    const tenThousands = Math.floor(value / 10000) % 10;
    const thousands = Math.floor(value / 1000) % 10;
    const hundreds = Math.floor(value / 100) % 10;
    const tens = Math.floor(value / 10) % 10;
    const units = value % 10;
    const rods = digits === 5
        ? [
            { val: tenThousands, label: "10K" },
            { val: thousands, label: "1K" },
            { val: hundreds, label: "100s" },
            { val: tens, label: "10s" },
            { val: units, label: "1s" },
        ]
        : digits === 4
            ? [
                { val: thousands, label: "1K" },
                { val: hundreds, label: "100s" },
                { val: tens, label: "10s" },
                { val: units, label: "1s" },
            ]
            : digits === 3
                ? [
                    { val: hundreds, label: "Hundreds (100s)" },
                    { val: tens, label: "Tens (10s)" },
                    { val: units, label: "Units (1s)" },
                ]
                : digits === 2
                    ? [
                        { val: tens, label: "Tens (10s)" },
                        { val: units, label: "Units (1s)" },
                    ]
                    : [{ val: units, label: "Unit Rod" }];
    const scale = size === "sm" ? 0.75 : size === "lg" ? 1.2 : 1.0;
    const rodWidth = 80 * scale;
    const frameHeight = 220 * scale;
    return (<div className="inline-flex items-center justify-center p-4 bg-amber-50/80 rounded-3xl border-4 border-amber-200/90 shadow-lg">
      <div className="flex items-center gap-3">
        {rods.map((rod, idx) => {
            const hasUpperBead = rod.val >= 5;
            const lowerBeadCount = rod.val % 5;
            return (<div key={idx} className="flex flex-col items-center">
              {/* Rod Column Label */}
              <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider mb-1.5">
                {rod.label}
              </span>

              {/* Physical Soroban Frame Segment */}
              <div style={{ width: `${rodWidth}px`, height: `${frameHeight}px` }} className="relative bg-[#3D2619] rounded-2xl p-1.5 shadow-inner border-2 border-[#2B1B12] flex flex-col justify-between overflow-hidden">
                {/* Vertical Bamboo Rod Spine */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2.5 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300 rounded-full shadow-sm z-0"/>

                {/* UPPER HEAVEN DECK (Value = 5) */}
                <div className="relative z-10 h-[52px] flex items-center justify-center">
                  {/* Upper Bead (Bi-conical Soroban shape) */}
                  <motion.div animate={{
                    y: hasUpperBead ? 14 : -12,
                }} transition={{ type: "spring", stiffness: 450, damping: 28 }} className="w-14 h-7 rounded-[14px] bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 border-2 border-amber-600/70 shadow-md flex items-center justify-center cursor-default">
                    <div className="w-full h-0.5 bg-amber-600/30"/>
                  </motion.div>
                </div>

                {/* HORIZONTAL RECKONING BEAM (Reckoning Bar) */}
                <div className="relative z-20 h-4 bg-gradient-to-b from-[#5C3A21] to-[#2B1B12] rounded-md border-y border-amber-500/40 flex items-center justify-center shadow-md">
                  {/* Unit Reckoning Dot */}
                  <div className="w-2 h-2 rounded-full bg-white shadow-sm"/>
                </div>

                {/* LOWER EARTH DECK (4 Lower Beads, Value = 1 each) */}
                <div className="relative z-10 h-[110px] flex flex-col justify-between py-1">
                  {[0, 1, 2, 3].map((bIdx) => {
                    const isActive = bIdx < lowerBeadCount;
                    return (<div key={bIdx} className="h-6 flex items-center justify-center">
                        <motion.div animate={{
                            y: isActive ? -12 : 12,
                        }} transition={{
                            type: "spring",
                            stiffness: 450,
                            damping: 28,
                            delay: bIdx * 0.02,
                        }} className={`w-14 h-6 rounded-[12px] border-2 shadow-sm flex items-center justify-center transition-colors ${isActive
                            ? "bg-gradient-to-r from-orange-400 via-amber-300 to-amber-500 border-orange-600/80 shadow-orange-300/40"
                            : "bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 border-amber-400/60 opacity-80"}`}>
                          <div className="w-full h-0.5 bg-amber-700/20"/>
                        </motion.div>
                      </div>);
                })}
                </div>
              </div>

              {/* Rod Value Indicator */}
              <div className="mt-2 w-9 h-9 rounded-2xl bg-white border-2 border-amber-300 shadow-sm flex items-center justify-center text-lg font-black text-[#1D3557]">
                {rod.val}
              </div>
            </div>);
        })}
      </div>
    </div>);
}
