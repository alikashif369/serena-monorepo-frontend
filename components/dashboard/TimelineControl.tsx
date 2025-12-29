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
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-stone-200 px-2 py-1.5 inline-flex items-center gap-1">
      <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wide px-2">
        Year
      </span>

      <div className="flex items-center gap-1">
        {sortedYears.map((year) => {
          const isSelected = year === selectedYear;

          return (
            <button
              key={year}
              onClick={() => onChange(year)}
              disabled={disabled}
              className={`
                relative px-3 py-1.5 rounded-md text-sm font-semibold
                transition-all duration-150
                ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                ${
                  isSelected
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                }
              `}
            >
              {year}
              {isSelected && (
                <motion.div
                  layoutId="yearIndicator"
                  className="absolute inset-0 bg-emerald-500 rounded-md -z-10"
                  transition={{ duration: 0.15 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="w-4 h-4 ml-2 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      )}
    </div>
  );
}
