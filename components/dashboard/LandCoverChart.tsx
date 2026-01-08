"use client";

import React, { useMemo } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { PieChart, BarChart3 } from "lucide-react";
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
      <div className="flex items-center justify-center gap-6 animate-pulse">
        <div className="w-32 h-32 rounded-full bg-gray-100" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <div className="w-24 h-2.5 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 h-32 animate-pulse">
      {[60, 80, 40, 70, 50, 30, 20, 15, 10].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-100 rounded-t-sm"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <div className="p-4 bg-gray-50 rounded-full mb-3">
        <PieChart className="w-8 h-8 opacity-40 text-gray-500" />
      </div>
      <p className="text-sm font-medium uppercase tracking-wide">No land cover data</p>
      <p className="text-xs mt-1 opacity-70">Select a site to view metrics</p>
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

    // Filter out zero values for cleaner display
    const filteredData = values
      .map((value, index) => ({
        value,
        label: landCoverLabels[index],
        color: landCoverChartColors[index],
      }))
      .filter((item) => item.value > 0.1); // Filter out very small values

    return {
      labels: filteredData.map((d) => d.label),
      datasets: [
        {
          data: filteredData.map((d) => d.value),
          backgroundColor: filteredData.map((d) => d.color),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  }, [metrics]);

  // Calculate total coverage percentage
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

  // Get dominant land cover
  const dominantCover = useMemo(() => {
    if (!metrics) return null;
    const covers = [
      { label: "Tree Canopy", value: metrics.treeCanopy || 0 },
      { label: "Green Area", value: metrics.greenArea || 0 },
      { label: "Barren Land", value: metrics.barrenLand || 0 },
      { label: "Wetland", value: metrics.wetLand || 0 },
      { label: "Water", value: metrics.water || 0 },
      { label: "Built-up", value: metrics.buildup || 0 },
    ];
    return covers.reduce((max, c) => (c.value > max.value ? c : max), covers[0]);
  }, [metrics]);

  const [currentVariant, setCurrentVariant] = React.useState(variant);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-stone-200 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-stone-800">
              Land Cover Analysis
            </h3>
            {metrics?.year && (
              <p className="text-sm text-stone-500">Year: {metrics.year}</p>
            )}
          </div>

          {/* Variant toggle */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => setCurrentVariant("doughnut")}
              className={`p-2 rounded-md transition-colors ${
                currentVariant === "doughnut"
                  ? "bg-white shadow-sm text-green-700"
                  : "text-stone-500 hover:text-stone-700"
              }`}
              title="Doughnut chart"
            >
              <PieChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentVariant("bar")}
              className={`p-2 rounded-md transition-colors ${
                currentVariant === "bar"
                  ? "bg-white shadow-sm text-green-700"
                  : "text-stone-500 hover:text-stone-700"
              }`}
              title="Bar chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className={compact ? "h-48" : "h-64"}>
        {loading ? (
          <ChartSkeleton variant={currentVariant} />
        ) : !chartData ? (
          <EmptyState />
        ) : currentVariant === "doughnut" ? (
          <div className="relative h-full">
            <Doughnut data={chartData} options={doughnutOptions} />
            {/* Center text */}
            {dominantCover && totalCoverage > 0 && (
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-2xl font-bold text-stone-800">
                  {dominantCover.value.toFixed(1)}%
                </p>
                <p className="text-xs text-stone-500">{dominantCover.label}</p>
              </div>
            )}
          </div>
        ) : (
          <Bar data={chartData} options={horizontalBarOptions} />
        )}
      </div>

      {/* Quick stats */}
      {metrics && !loading && (
        <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-green-700">
              {((metrics.treeCanopy || 0) + (metrics.greenArea || 0)).toFixed(1)}%
            </p>
            <p className="text-xs text-stone-500">Vegetation</p>
          </div>
          <div>
            <p className="text-xl font-bold text-amber-600">
              {(metrics.barrenLand || 0).toFixed(1)}%
            </p>
            <p className="text-xs text-stone-500">Barren</p>
          </div>
          <div>
            <p className="text-xl font-bold text-blue-600">
              {(metrics.water || 0).toFixed(1)}%
            </p>
            <p className="text-xs text-stone-500">Water</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
