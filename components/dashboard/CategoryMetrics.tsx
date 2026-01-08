"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Trees,
  Sun,
  Users,
  Recycle,
  Droplets,
  Leaf,
  Target,
  TrendingUp,
  Zap,
  Factory,
} from "lucide-react";
import type { AggregateMetrics, CategoryType, MetricType } from "./types";
import { categoryColors } from "./utils/colorPalettes";
import { formatNumber } from "@/lib/api/dashboardApi";

interface CategoryMetricsProps {
  metrics: AggregateMetrics[];
  categoryType?: CategoryType;
  loading?: boolean;
  compact?: boolean;
}

// Get icon for metric type
function getMetricIcon(metricType: MetricType): React.ReactNode {
  const iconClass = "w-5 h-5";

  if (metricType.startsWith("PLANTATION")) {
    return <Trees className={iconClass} />;
  }
  if (metricType.startsWith("SOLAR")) {
    return <Sun className={iconClass} />;
  }
  if (metricType.startsWith("COMMUNITY")) {
    return <Users className={iconClass} />;
  }
  if (metricType.startsWith("WASTE")) {
    return <Recycle className={iconClass} />;
  }
  if (metricType.startsWith("SEWAGE")) {
    return <Droplets className={iconClass} />;
  }

  return <TrendingUp className={iconClass} />;
}

// Get color for category
function getCategoryColor(type?: CategoryType): string {
  if (!type) return "#22c55e";
  return categoryColors[type] || "#22c55e";
}

// Format metric label
function formatMetricLabel(metricType: MetricType): string {
  const labels: Record<string, string> = {
    PLANTATION_TARGET: "Target Trees",
    PLANTATION_ACHIEVED: "Trees Planted",
    PLANTATION_STEWARDSHIP_TOTAL: "Total Stewardship",
    PLANTATION_STEWARDSHIP_ACTIVE: "Active Stewardship",
    SOLAR_CAPACITY_TOTAL: "Solar Capacity",
    SOLAR_PRODUCTION_YEARLY: "Yearly Production",
    SOLAR_PRODUCTION_QUARTERLY: "Quarterly Production",
    COMMUNITY_STOVES: "Clean Stoves",
    COMMUNITY_SEEDS_DISTRIBUTED: "Seeds Distributed",
    COMMUNITY_SEEDS_SOLD: "Seeds Sold",
    COMMUNITY_SOLAR_GEYSERS: "Solar Geysers",
    WASTE_ORGANIC_COLLECTED: "Organic Waste",
    WASTE_COMPOST_PRODUCED: "Compost Produced",
    WASTE_METHANE_RECOVERED: "Methane Recovered",
    SEWAGE_RECOVERY_RATIO: "Recovery Ratio",
    SEWAGE_METHANE_SAVED: "Methane Saved",
  };

  return labels[metricType] || metricType.replace(/_/g, " ").toLowerCase();
}

// Stat card component
function StatCard({
  metric,
  categoryType,
  index,
}: {
  metric: AggregateMetrics;
  categoryType?: CategoryType;
  index: number;
}) {
  const color = getCategoryColor(categoryType);
  const hasTarget = metric.targetValue !== undefined && metric.targetValue > 0;
  const progress = hasTarget
    ? Math.min(100, ((metric.achievedValue || 0) / metric.targetValue!) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-[#b08d4b]/30 transition-all duration-300 group"
    >
      {/* Icon and label */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="p-3 rounded-lg transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${color}10` }}
        >
          <span style={{ color }}>{getMetricIcon(metric.metricType)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] truncate">
            {metric.label || formatMetricLabel(metric.metricType)}
          </p>
          {metric.year && (
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">{metric.year}</p>
          )}
        </div>
      </div>

      {/* Value */}
      <div className="mb-4">
        <p className="text-3xl font-serif text-[#115e59] leading-none">
          {formatNumber(metric.achievedValue || 0)}
          {metric.unit && (
            <span className="text-sm font-sans font-medium text-gray-400 ml-1.5 align-middle">
              {metric.unit}
            </span>
          )}
        </p>
      </div>

      {/* Progress bar (if target exists) */}
      {hasTarget && progress !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            <span>Progress</span>
            <span style={{ color }}>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">
            Goal: <span className="font-mono">{formatNumber(metric.targetValue!)}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}

// Skeleton loader
function MetricsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-stone-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-stone-200 rounded w-3/4" />
            </div>
          </div>
          <div className="h-8 bg-stone-200 rounded w-1/2 mb-2" />
          <div className="h-2 bg-stone-200 rounded" />
        </div>
      ))}
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 text-center">
      <Target className="w-10 h-10 mx-auto mb-3 text-stone-300" />
      <p className="text-sm text-stone-500">No metrics available</p>
      <p className="text-xs text-stone-400 mt-1">
        Select a category to view performance metrics
      </p>
    </div>
  );
}

export default function CategoryMetrics({
  metrics,
  categoryType,
  loading = false,
  compact = false,
}: CategoryMetricsProps) {
  // Sort metrics by display order
  const sortedMetrics = [...metrics].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  if (loading) {
    return <MetricsSkeleton count={compact ? 2 : 4} />;
  }

  if (metrics.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-serif text-[#115e59]">
          Performance Metrics
        </h3>
        {categoryType && (
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border"
            style={{
              backgroundColor: `${getCategoryColor(categoryType)}10`,
              color: getCategoryColor(categoryType),
              borderColor: `${getCategoryColor(categoryType)}30`,
            }}
          >
            {categoryType.charAt(0) + categoryType.slice(1).toLowerCase()}
          </span>
        )}
      </div>

      {/* Metrics grid */}
      <div
        className={`grid gap-5 ${
          compact
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {sortedMetrics.slice(0, compact ? 4 : 8).map((metric, index) => (
          <StatCard
            key={metric.id}
            metric={metric}
            categoryType={categoryType}
            index={index}
          />
        ))}
      </div>

      {/* Show more indicator */}
      {metrics.length > (compact ? 4 : 8) && (
        <div className="text-center pt-2">
           <span className="inline-block px-4 py-1.5 rounded-full bg-[#f8f6f1] text-[10px] font-bold uppercase tracking-widest text-gray-500 border border-gray-100">
            +{metrics.length - (compact ? 4 : 8)} more metrics available
          </span>
        </div>
      )}
    </div>
  );
}
