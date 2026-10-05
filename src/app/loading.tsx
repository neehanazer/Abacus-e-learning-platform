import React from "react";
import { Sparkles, Calculator } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 p-0.5 shadow-xl shadow-purple-300/40 animate-pulse">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-purple-600">
            <Calculator className="w-8 h-8 animate-bounce" />
          </div>
        </div>
        <div className="absolute -top-2 -right-2">
          <Sparkles className="w-6 h-6 text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
        </div>
      </div>
      <h3 className="font-heading font-extrabold text-2xl text-slate-800 tracking-tight">
        Loading <span className="text-purple-600">Mind Beads</span>...
      </h3>
      <p className="text-sm text-slate-500 mt-1 max-w-xs">
        Preparing your interactive learning tools and challenges!
      </p>
    </div>
  );
}
