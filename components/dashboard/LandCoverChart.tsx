"use client";

import React, { useMemo, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, BarChart3, Info, TrendingUp, Droplets, Mountain } from "lucide-react";
import type { YearlyMetrics } from "./types";
import {
  doughnutOptions,
  horizontalBarOptions,
  landCoverChartColors,
  landCoverLabels,
} from "./utils/chartConfig";
import "./utils/chartConfig"; // Ensure Chart.js is registered

interface LandCoverChartProps {
  metrics: YearlyMetrics | null;
  loading?: boolean;
  variant?: "doughnut" | "bar";
  showTitle?: boolean;
  compact?: boolean;
}

// Skeleton loader for charts
function ChartSkeleton({ variant }: { variant: "doughnut" | "bar" }) {
  if (variant === "doughnut") {
    return (
      <div className="flex items-center justify-center gap-12 animate-pulse py-8">
        <div className="w-48 h-48 rounded-full border-[16px] border-gray-50 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gray-50" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-gray-200" />
              <div className="w-32 h-3 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3 h-48 animate-pulse px-4">
      {[70, 90, 50, 80, 60, 40, 30, 20, 10].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-100 rounded-t-xl"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-300">
      <div className="p-8 bg-gray-50 rounded-full mb-6 border border-gray-100">
        <PieChart className="w-12 h-12 opacity-30 text-emerald-600" />
      </div>
      <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Data Pending</p>
      <p className="text-xs mt-3 opacity-70 text-center max-w-[240px]">Geospatial analysis for this specific region is currently being synthesized.</p>
    </div>
  );
}

export default function LandCoverChart({
  metrics,
  loading = false,
  variant = "doughnut",
  showTitle = true,
  compact = false,
}: LandCoverChartProps) {
  const [currentVariant, setCurrentVariant] = useState(variant);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Process metrics into chart data
  const chartData = useMemo(() => {
    if (!metrics) return null;

    const values = [
      metrics.treeCanopy || 0,
      metrics.greenArea || 0,
      metrics.barrenLand || 0,
      metrics.wetLand || 0,
      metrics.water || 0,
      metrics.buildup || 0,
      metrics.snow || 0,
      metrics.rock || 0,
      metrics.solarPanels || 0,
    ];

    const filteredData = values
      .map((value, index) => ({
        value,
        label: landCoverLabels[index],
        color: landCoverChartColors[index],
        originalIndex: index
      }))
      .filter((item) => item.value > 0.05);

    return {
      labels: filteredData.map((d) => d.label),
      datasets: [
        {
          data: filteredData.map((d) => d.value),
          backgroundColor: filteredData.map((d) => d.color),
          borderColor: "#ffffff",
          borderWidth: 4,
          hoverOffset: 12,
          spacing: 2,
          borderRadius: currentVariant === "doughnut" ? 4 : 8,
        },
      ],
      raw: filteredData
    };
  }, [metrics, currentVariant]);

  const totalCoverage = useMemo(() => {
    if (!metrics) return 0;
    return (
      (metrics.treeCanopy || 0) +
      (metrics.greenArea || 0) +
      (metrics.barrenLand || 0) +
      (metrics.wetLand || 0) +
      (metrics.water || 0) +
      (metrics.buildup || 0) +
      (metrics.snow || 0) +
      (metrics.rock || 0) +
      (metrics.solarPanels || 0)
    );
  }, [metrics]);

  const dominantCover = useMemo(() => {
    if (!chartData?.raw) return null;
    return [...chartData.raw].sort((a, b) => b.value - a.value)[0];
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden h-full ${
        compact ? "p-5" : "p-8"
      }`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-30 pointer-events-none" />
      
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Geospatial Intelligence</span>
            </div>
            <h3 className="text-base font-serif font-bold text-gray-900 leading-tight">
              Land Cover Analysis
            </h3>
            {metrics?.year && (
              <p className="text-[9px] text-gray-400 font-medium mt-0.5 uppercase tracking-widest">Snapshot: {metrics.year}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button
              onClick={() => setCurrentVariant("doughnut")}
              className={`p-2 rounded-lg transition-all ${
                currentVariant === "doughnut"
                  ? "bg-white shadow-sm text-emerald-700"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentVariant("bar")}
              className={`p-2 rounded-lg transition-all ${
                currentVariant === "bar"
                  ? "bg-white shadow-sm text-emerald-700"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Analysis Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[280px]">
        {/* Chart View */}
        <div className="lg:col-span-7 relative">
          {loading ? (
            <ChartSkeleton variant={currentVariant} />
          ) : !chartData ? (
            <EmptyState />
          ) : (
            <div className={compact ? "h-60" : "h-72"}>
              {currentVariant === "doughnut" ? (
                <div className="relative h-full flex items-center justify-center">
                  <div className="w-full h-full p-2">
                    <Doughnut 
                        data={chartData} 
                        options={{
                            ...doughnutOptions,
                            plugins: {
                                ...doughnutOptions.plugins,
                                legend: { display: false }
                            }
                        }} 
                    />
                  </div>
                  {/* Premium Center Indicator */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <p className="text-3xl font-black text-gray-900 leading-none">
                          {dominantCover?.value.toFixed(1)}%
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 mt-1.5">
                          {dominantCover?.label}
                        </p>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="h-full pt-6 px-4">
                  <Bar data={chartData} options={horizontalBarOptions} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Legend / Insights */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
             {chartData?.raw.slice(0, 6).map((item, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:shadow-md transition-all cursor-default"
                >
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-2.5 h-2.5 rounded-full shadow-sm ring-2 ring-white"
                            style={{ backgroundColor: item.color }}
                        />
                        <div>
                            <p className="text-[11px] font-bold text-gray-800 leading-none">{item.label}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black text-gray-900">{item.value.toFixed(1)}%</p>
                    </div>
                </motion.div>
             ))}
          </div>
        </div>
      </div>

      {/* Footer Metrics - Refined for impact */}
      {metrics && !loading && (
        <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-3 gap-4 md:gap-8 text-center relative z-10">
          <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-emerald-600 shadow-sm">
                <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-emerald-700">
              {((metrics.treeCanopy || 0) + (metrics.greenArea || 0)).toFixed(1)}%
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-800/60 mt-0.5">Total Vegetation</p>
          </div>
          
          <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/50">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-amber-600 shadow-sm">
                <Mountain className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-amber-600">
              {(metrics.barrenLand || 0).toFixed(1)}%
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-800/60 mt-0.5">Total Barren</p>
          </div>
          
          <div className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100/50">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-blue-600 shadow-sm">
                <Droplets className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-blue-600">
              {(metrics.water || 0).toFixed(1)}%
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-800/60 mt-0.5">Water Resources</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
