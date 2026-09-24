"use client";
import React from "react";
import { Lock, CheckCircle2 } from "lucide-react";
export default function LevelSelectorTabs({ levels, selectedLevelId, onSelectLevel, }) {
    return (<div className="w-full overflow-x-auto pb-2 no-scrollbar">
      <div className="flex items-center gap-2.5 min-w-max">
        {levels.map((lvl) => {
            const isSelected = lvl.id === selectedLevelId;
            const isCompleted = lvl.progress >= 100;
            const isLocked = lvl.status === "locked";
            return (<button key={lvl.id} onClick={() => onSelectLevel(lvl.id)} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 border-2 ${isSelected
                    ? "bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white border-orange-400 shadow-lg shadow-orange-200 scale-105"
                    : isCompleted
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                        : isLocked
                            ? "bg-white/60 text-slate-400 border-slate-200 hover:bg-white"
                            : "bg-white text-[#1D3557] border-yellow-200 hover:bg-yellow-50/80 hover:border-yellow-300"}`}>
              <span className="text-base">{lvl.icon}</span>
              <div className="text-left">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider opacity-80">
                  Level {lvl.levelNumber}
                </span>
                <span className="block font-extrabold truncate max-w-[130px]">
                  {lvl.title.split(" ")[0]} {lvl.title.split(" ")[1] || ""}
                </span>
              </div>

              {isLocked ? (<Lock className="w-3.5 h-3.5 text-slate-400 ml-1"/>) : isCompleted ? (<CheckCircle2 className="w-4 h-4 text-emerald-500 ml-1"/>) : lvl.progress > 0 ? (<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/30 text-white font-black ml-1">
                  {lvl.progress}%
                </span>) : null}
            </button>);
        })}
      </div>
    </div>);
}
