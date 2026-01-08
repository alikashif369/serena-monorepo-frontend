"use client";

import React from "react";
import { motion } from "framer-motion";

interface TimelineControlProps {
  years: number[];
  selectedYear: number | null;
  onChange: (year: number) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function TimelineControl({
  years,
  selectedYear,
  onChange,
  disabled = false,
  loading = false,
}: TimelineControlProps) {
  const sortedYears = [...years].sort((a, b) => a - b);

  if (sortedYears.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#0f3f3c]/95 backdrop-blur-md rounded-full shadow-xl border border-[#115e59] px-4 py-2 inline-flex items-center gap-2">
      <span className="text-[10px] font-bold text-[#b08d4b] uppercase tracking-[0.15em] px-1">
        Timeline
      </span>

      <div className="h-4 w-px bg-white/10 mx-1" />

      <div className="flex items-center gap-1">
        {sortedYears.map((year) => {
          const isSelected = year === selectedYear;

          return (
            <button
              key={year}
              onClick={() => onChange(year)}
              disabled={disabled}
              className={`
                relative px-3 py-1 rounded-full text-xs font-bold
                transition-all duration-300
                ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
                ${
                  isSelected
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <span className="relative z-10">{year}</span>
              {isSelected && (
                <motion.div
                  layoutId="yearIndicator"
                  className="absolute inset-0 bg-[#b08d4b] rounded-full"
                  transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="w-3.5 h-3.5 ml-2 rounded-full border-2 border-[#b08d4b] border-t-transparent animate-spin" />
      )}
    </div>
  );
}
