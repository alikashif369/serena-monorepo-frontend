"use client";

import React, { useMemo, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { PieChart, BarChart3, TrendingUp, Droplets, Mountain, ArrowUpRight } from "lucide-react";
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

// Skeleton loader
function ChartSkeleton({ variant }: { variant: "doughnut" | "bar" }) {
  if (variant === "doughnut") {
    return (
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 animate-pulse py-12 px-8 bg-white/40 backdrop-blur-md rounded-[2.5rem]">
        <div className="w-56 h-56 rounded-full border-[20px] border-white/40 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/20" />
        </div>
        <div className="space-y-4 w-full lg:w-1/3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl bg-white/40" />
              <div className="w-full h-4 bg-white/30 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-4 h-64 animate-pulse px-8 py-8 bg-white/40 backdrop-blur-md rounded-[2.5rem]">
      {[70, 90, 50, 80, 60, 40, 30, 20, 10].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-white/30 rounded-t-2xl"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60">
      <div className="p-6 bg-white/50 rounded-full mb-6 shadow-sm ring-1 ring-white">
        <PieChart className="w-10 h-10 opacity-40 text-gray-500" />
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Analysis Pending</p>
      <p className="text-xl font-serif text-gray-600 mt-2 font-medium">No Geospatial Data</p>
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
          borderWidth: 0,
          hoverOffset: 15,
          spacing: 5,
          borderRadius: 8,
        },
      ],
      raw: filteredData
    };
  }, [metrics]);

  const dominantCover = useMemo(() => {
    if (!chartData?.raw) return null;
    return [...chartData.raw].sort((a, b) => b.value - a.value)[0];
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative h-full flex flex-col group ${compact ? "p-0" : ""}`}
    >
      {/* Glass Container Background */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl z-0" />
      
      {/* Decorative Blur */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-100/40 rounded-full blur-[80px] pointer-events-none z-0" />

      {/* Content */}
      <div className={`relative z-10 flex flex-col h-full ${compact ? "p-6" : "p-8"}`}>
        
        {/* Header */}
        {showTitle && (
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <span className="px-3 py-1 bg-white/60 backdrop-blur-sm border border-white/40 text-emerald-800 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-sm">
                    Geospatial Intelligence
                 </span>
              </div>
              <h3 className="text-3xl font-serif text-gray-900 font-medium leading-none tracking-tight">
                Land Cover Analysis
              </h3>
            </div>

            {/* Toggle Controls */}
            <div className="flex bg-white/40 backdrop-blur-md p-1 rounded-xl border border-white/40 shadow-sm">
              <button
                onClick={() => setCurrentVariant("doughnut")}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  currentVariant === "doughnut"
                    ? "bg-white shadow-sm text-emerald-600 scale-105 ring-1 ring-black/5"
                    : "text-gray-400 hover:text-gray-600 hover:bg-white/30"
                }`}
              >
                <PieChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentVariant("bar")}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  currentVariant === "bar"
                    ? "bg-white shadow-sm text-emerald-600 scale-105 ring-1 ring-black/5"
                    : "text-gray-400 hover:text-gray-600 hover:bg-white/30"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Analysis Area - Improved Grid Layout */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Chart View */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[300px]">
            {loading ? (
              <ChartSkeleton variant={currentVariant} />
            ) : !chartData ? (
              <EmptyState />
            ) : (
              <div className="w-full h-72 relative">
                {currentVariant === "doughnut" ? (
                  <>
                    <Doughnut 
                        data={chartData} 
                        options={{
                            ...doughnutOptions,
                            cutout: '75%',
                            plugins: {
                                ...doughnutOptions.plugins,
                                legend: { display: false }
                            }
                        }} 
                    />
                    {/* Center Metric */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-center p-4 rounded-full bg-white/30 backdrop-blur-sm border border-white/50 shadow-sm"
                       >
                           <p className="text-3xl font-serif font-bold text-gray-900 leading-none">
                             {dominantCover?.value.toFixed(1)}<span className="text-lg align-top text-gray-500">%</span>
                           </p>
                           <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 mt-1 max-w-[80px] break-words">
                             {dominantCover?.label}
                           </p>
                       </motion.div>
                    </div>
                  </>
                ) : (
                  <Bar data={chartData} options={horizontalBarOptions} />
                )}
              </div>
            )}
          </div>

          {/* Clean Legend */}
          <div className="lg:col-span-5 flex flex-col justify-center h-full">
            <div className="space-y-3">
               {chartData?.raw.slice(0, 5).map((item, idx) => (
                  <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/60 transition-colors border border-transparent hover:border-white/50"
                  >
                      <div className="flex items-center gap-3">
                          <div 
                              className="w-2 h-8 rounded-full shadow-sm"
                              style={{ backgroundColor: item.color }}
                          />
                          <div>
                              <p className="text-xs font-bold text-gray-900 leading-none mb-1">{item.label}</p>
                              <div className="h-1 w-12 bg-gray-200/50 rounded-full overflow-hidden">
                                <div className="h-full bg-gray-400/30" style={{ width: `${item.value}%` }} />
                              </div>
                          </div>
                      </div>
                      <span className="text-sm font-serif font-medium text-gray-600 group-hover:text-emerald-700 transition-colors">
                        {item.value.toFixed(1)}%
                      </span>
                  </motion.div>
               ))}
               {chartData?.raw && chartData.raw.length > 5 && (
                 <div className="text-center pt-2">
                   <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">+ {chartData.raw.length - 5} More Categories</span>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Footer Metrics - Glass Pills */}
        {metrics && !loading && (
          <div className="mt-8 pt-6 border-t border-gray-100/30 grid grid-cols-3 gap-4">
            {[
              { 
                icon: TrendingUp, 
                value: (metrics.treeCanopy || 0) + (metrics.greenArea || 0), 
                label: "Vegetation", 
                color: "text-emerald-600",
                bg: "bg-emerald-50/50" 
              },
              { 
                icon: Mountain, 
                value: metrics.barrenLand || 0, 
                label: "Barren", 
                color: "text-amber-600",
                bg: "bg-amber-50/50" 
              },
              { 
                icon: Droplets, 
                value: metrics.water || 0, 
                label: "Water", 
                color: "text-blue-600",
                bg: "bg-blue-50/50" 
              }
            ].map((stat, i) => (
              <div key={i} className={`p-3 rounded-2xl ${stat.bg} border border-white/40 flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform`}>
                <p className={`text-lg font-serif font-bold ${stat.color}`}>
                  {stat.value.toFixed(1)}%
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
