"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useHomework } from "@/context/HomeworkContext";
import { PRACTICE_CATEGORIES, PracticeCategoryOption } from "@/data/practiceData";
import { PlusCircle, X, Check, BookOpen, Calendar, HelpCircle, Sparkles } from "lucide-react";

export const AssignHomeworkModal: React.FC = () => {
  const { assignModalOpen, setAssignModalOpen, assignNewHomework } = useHomework();

  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    PRACTICE_CATEGORIES[0].id
  );
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [dueDate, setDueDate] = useState<string>("18 September");

  if (!assignModalOpen) return null;

  const filteredCategories = PRACTICE_CATEGORIES.filter(
    (cat) => cat.level === selectedLevel
  );

  const selectedCategory =
    PRACTICE_CATEGORIES.find((cat) => cat.id === selectedCategoryId) ||
    filteredCategories[0] ||
    PRACTICE_CATEGORIES[0];

  const handleAssign = () => {
    assignNewHomework(
      selectedCategory,
      questionCount,
      dueDate,
      `Complete these ${questionCount} questions on ${selectedCategory.name}. Master your bead speed!`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl border-4 border-[#E9C46A] shadow-2xl p-6 sm:p-8 max-w-xl w-full relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={() => setAssignModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <PlusCircle className="w-5 h-5 text-amber-600" />
            </span>
            <h2 className="text-2xl font-black text-[#1D3557]">
              Assign New Homework Task
            </h2>
          </div>
          <p className="text-stone-600 text-sm font-medium">
            Select a practice topic from the 8-level syllabus to create an assigned homework set.
          </p>
        </div>

        {/* Step 1: Select Syllabus Level */}
        <div className="mb-5">
          <label className="text-xs font-black text-stone-600 uppercase tracking-wider block mb-2">
            1. Select Syllabus Level
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setSelectedLevel(lvl);
                  const firstInLevel = PRACTICE_CATEGORIES.find((c) => c.level === lvl);
                  if (firstInLevel) setSelectedCategoryId(firstInLevel.id);
                }}
                className={`py-2 rounded-xl font-black text-xs transition-all border-2 ${
                  selectedLevel === lvl
                    ? "bg-[#1D3557] text-white border-[#1D3557] shadow-sm"
                    : "bg-stone-50 hover:bg-amber-50 text-stone-700 border-stone-200"
                }`}
              >
                L-{lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Topic / Worksheet Category */}
        <div className="mb-5">
          <label className="text-xs font-black text-stone-600 uppercase tracking-wider block mb-2">
            2. Choose Topic (Level {selectedLevel})
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {filteredCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-amber-50/80 border-amber-400 shadow-sm"
                      : "bg-white hover:bg-stone-50 border-stone-200"
                  }`}
                >
                  <div>
                    <div className="text-sm font-black text-[#1D3557]">{cat.name}</div>
                    <div className="text-xs text-stone-500 font-medium">
                      {cat.digits}-Digit • {cat.rowCount} Rows • {cat.badge || "Direct bead moves"}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Question Count & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-black text-stone-600 uppercase tracking-wider block mb-2">
              3. Questions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 15, 20].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-2.5 rounded-xl font-bold text-xs border-2 transition-all ${
                    questionCount === count
                      ? "bg-[#F4A261] text-white border-[#F4A261] shadow-sm font-black"
                      : "bg-stone-50 text-stone-700 border-stone-200"
                  }`}
                >
                  {count} Qs
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-stone-600 uppercase tracking-wider block mb-2">
              4. Due Date
            </label>
            <select
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-50 border-2 border-stone-200 rounded-xl text-xs font-bold text-[#1D3557] focus:outline-none focus:border-amber-400"
            >
              <option value="15 September">In 3 Days (15 Sep)</option>
              <option value="18 September">Next Week (18 Sep)</option>
              <option value="25 September">End of Month (25 Sep)</option>
              <option value="No Deadline">No Deadline</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setAssignModalOpen(false)}
            className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-sm transition-colors border-2 border-stone-200"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-[#F4A261] to-[#E76F51] hover:from-[#E76F51] hover:to-[#F4A261] text-white font-black rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 border-b-4 border-[#C85A3D]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Homework</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
