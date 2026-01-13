"use client";

import React, { useMemo } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { 
  Recycle, 
  Droplets, 
  Leaf, 
  Factory, 
  TrendingUp, 
  Wind, 
  Scale 
} from "lucide-react";
import type { Site, CategoryType } from "./types";
import "./utils/chartConfig";

interface WasteSewageMetricsProps {
  site: Site;
  selectedYear: number | null;
  loading?: boolean;
}

// ----------------------------------------------------------------------------
// Helper Components
// ----------------------------------------------------------------------------

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  subtext,
  colorClass = "text-emerald-600",
  bgClass = "bg-emerald-50",
}: {
  icon: any;
  label: string;
  value: string | number;
  unit: string;
  subtext?: string;
  colorClass?: string;
  bgClass?: string;
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${bgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-stone-800">{value}</span>
          <span className="text-xs font-medium text-stone-500">{unit}</span>
        </div>
        {subtext && <p className="text-xs text-stone-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-stone-100 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="h-64 bg-stone-100 rounded-xl" />
        <div className="h-64 bg-stone-100 rounded-xl" />
      </div>
    </div>
  );
}

function EmptyState({ type }: { type: "WASTE" | "SEWAGE" }) {
  const isWaste = type === "WASTE";
  return (
    <div className="flex flex-col items-center justify-center py-20 text-stone-400 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
      <div
        className={`p-6 ${
          isWaste ? "bg-emerald-50" : "bg-cyan-50"
        } rounded-full mb-4`}
      >
        {isWaste ? (
          <Recycle className="w-10 h-10 text-emerald-400" />
        ) : (
          <Droplets className="w-10 h-10 text-cyan-400" />
        )}
      </div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-2">
        {isWaste ? "Waste Data Pending" : "Sewage Data Pending"}
      </h3>
      <p className="text-xs text-stone-400 text-center max-w-[250px]">
        {isWaste
          ? "Detailed waste composition and recovery metrics are being compiled."
          : "Water treatment and recovery statistics are currently unavailable."}
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export default function WasteSewageMetrics({
  site,
  selectedYear,
  loading = false,
}: WasteSewageMetricsProps) {
  const categoryType = site.category?.type as CategoryType;
  const isWaste = categoryType === "WASTE";
  const isSewage = categoryType === "SEWAGE";

  // Filter data for selected year (if any) or use most recent
  const currentWasteData = useMemo(() => {
    if (!site.wasteData || site.wasteData.length === 0) return null;
    if (selectedYear) {
      return site.wasteData.find((d) => d.year === selectedYear) || null;
    }
    // Default to latest year
    return site.wasteData.reduce((prev, current) => 
      (prev.year > current.year) ? prev : current
    );
  }, [site.wasteData, selectedYear]);

  // Waste Composition Chart (Doughnut)
  const compositionData = useMemo(() => {
    if (!currentWasteData) return null;
    
    // Extract values with defaults
    const organic = currentWasteData.organicWaste || 0;
    const inorganic = currentWasteData.inorganicWaste || 0;
    const rawMeat = currentWasteData.rawMeatWaste || 0;
    
    // Only show if we have meaningful breakdown data
    const total = organic + inorganic + rawMeat;
    if (total === 0) return null;

    return {
      labels: ["Organic", "Inorganic", "Raw Meat / Other"],
      datasets: [
        {
          data: [organic, inorganic, rawMeat],
          backgroundColor: [
            "rgba(34, 197, 94, 0.85)",  // Organic - Green
            "rgba(20, 184, 166, 0.85)", // Inorganic - Teal
            "rgba(244, 63, 94, 0.85)",  // Raw Meat - Rose
          ],
          borderColor: ['#fff', '#fff', '#fff'],
          borderWidth: 3,
          hoverOffset: 8,
          hoverBorderWidth: 4,
        },
      ],
    };
  }, [currentWasteData]);

  // Historical Trend Chart (Line/Bar Hybrid)
  const trendData = useMemo(() => {
    if (!site.wasteData || site.wasteData.length === 0) return null;
    
    // Sort data chronologically
    const sorted = [...site.wasteData].sort((a, b) => a.year - b.year);
    
    return {
      labels: sorted.map(d => d.year.toString()),
      datasets: [
        {
          type: 'line' as const,
          label: 'Methane Saved',
          data: sorted.map(d => d.methaneSaved || 0),
          borderColor: 'rgb(244, 114, 182)', // Pink
          backgroundColor: 'rgba(244, 114, 182, 0.1)',
          borderWidth: 3,
          yAxisID: 'y1',
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: 'rgb(244, 114, 182)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: true,
        },
        {
          type: 'bar' as const,
          label: 'Compost Received',
          data: sorted.map(d => d.compostReceived || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald
          hoverBackgroundColor: 'rgba(16, 185, 129, 0.95)',
          borderRadius: 8,
          yAxisID: 'y',
          barThickness: 40,
        }
      ]
    };
  }, [site.wasteData]);

  if (loading) return <ChartSkeleton />;
  if ((isWaste && !site.wasteData?.length) || (isSewage && !site.sewageData?.length)) {
    return <EmptyState type={isWaste ? "WASTE" : "SEWAGE"} />;
  }

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------------
          WASTE MANAGEMENT DASHBOARD
         ---------------------------------------------------------------------- */}
      {isWaste && currentWasteData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 1. Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Leaf}
              label="Organic Waste"
              value={currentWasteData.organicWaste?.toLocaleString() || "0"}
              unit="Tonnes"
              subtext="Processed annually"
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
            />
            <MetricCard
              icon={Factory}
              label="Compost Received"
              value={currentWasteData.compostReceived?.toLocaleString() || "0"}
              unit="Tonnes"
              subtext={`Quality: ${currentWasteData.compostQuality || "Standard"}`}
              colorClass="text-amber-600"
              bgClass="bg-amber-50"
            />
            <MetricCard
              icon={Recycle}
              label="Recovery Ratio"
              value={currentWasteData.recoveryRatio?.toFixed(1) || "0"}
              unit="%"
              colorClass="text-blue-600"
              bgClass="bg-blue-50"
            />
            <MetricCard
              icon={Wind}
              label="Methane Saved"
              value={currentWasteData.methaneSaved?.toLocaleString() || "0"}
              unit="kg CH₄"
              subtext="Equivalent emissions avoided"
              colorClass="text-rose-500"
              bgClass="bg-rose-50"
            />
          </div>

          {/* 2. Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Composition Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm lg:col-span-1 flex flex-col items-center justify-center relative min-h-[320px]">
              <h4 className="absolute top-6 left-6 text-sm font-bold text-stone-700 uppercase tracking-wide flex items-center gap-2">
                <Scale className="w-4 h-4 text-stone-400" />
                Waste Composition
              </h4>
              {compositionData ? (
                <div className="w-full max-w-[240px] mt-8 relative">
                  <Doughnut
                    data={compositionData}
                    options={{
                      plugins: {
                        legend: { 
                          position: 'bottom', 
                          labels: { 
                            usePointStyle: true, 
                            padding: 16,
                            font: { size: 11, weight: '600' },
                            color: '#57534e',
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleFont: { size: 12, weight: 'bold' },
                          bodyFont: { size: 11 },
                          padding: 12,
                          callbacks: {
                            label: function(context: any) {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${label}: ${value.toLocaleString()} tonnes (${percentage}%)`;
                            }
                          }
                        }
                      },
                      cutout: '68%',
                    }}
                  />
                  {/* Center Label */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ marginTop: '-8px' }}>
                    <span className="block text-3xl font-bold text-stone-700">
                      {currentWasteData.year}
                    </span>
                    <span className="text-[9px] text-stone-400 uppercase tracking-[0.15em] font-semibold">
                      Year
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-stone-300 text-sm italic">
                  No breakdown data available
                </div>
              )}
            </div>

            {/* Historical Trend Chart */}
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm lg:col-span-2 min-h-[320px]">
              <h4 className="text-sm font-bold text-stone-700 uppercase tracking-wide flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-stone-400" />
                Annual Trends
              </h4>
              <div className="h-[240px] w-full">
                {trendData && (
                  <Bar
                    data={trendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: { 
                            display: true, 
                            text: 'Compost (Tonnes)',
                            font: { weight: 'bold', size: 11 },
                            color: 'rgb(16, 185, 129)',
                          },
                          grid: { 
                            color: 'rgba(0,0,0,0.03)',
                            drawBorder: false,
                          },
                          ticks: {
                            font: { size: 10 },
                            padding: 8,
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: { 
                            display: true, 
                            text: 'Methane Saved (kg CH₄)',
                            font: { weight: 'bold', size: 11 },
                            color: 'rgb(244, 114, 182)',
                          },
                          grid: { drawOnChartArea: false },
                          ticks: {
                            font: { size: 10 },
                            padding: 8,
                          }
                        },
                        x: {
                          grid: { display: false },
                          ticks: {
                            font: { size: 11, weight: 'bold' },
                            color: '#57534e',
                          }
                        }
                      },
                      plugins: {
                        legend: { 
                          position: 'top', 
                          align: 'end',
                          labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 11, weight: '600' },
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleFont: { size: 12, weight: 'bold' },
                          bodyFont: { size: 11 },
                          padding: 12,
                          displayColors: true,
                          callbacks: {
                            label: function(context: any) {
                              let label = context.dataset.label || '';
                              if (label) {
                                label += ': ';
                              }
                              if (context.parsed.y !== null) {
                                if (context.datasetIndex === 0) {
                                  // Methane (line chart)
                                  label += context.parsed.y.toLocaleString() + ' kg CH₄';
                                } else {
                                  // Compost (bar chart)
                                  label += context.parsed.y.toLocaleString() + ' Tonnes';
                                }
                              }
                              return label;
                            }
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ----------------------------------------------------------------------
          SEWAGE MANAGEMENT DASHBOARD (Placeholder for parity)
         ---------------------------------------------------------------------- */}
      {isSewage && site.sewageData && site.sewageData.length > 0 && (
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm text-center"
        >
          {/* Simple Sewage View (Can be expanded similarly if needed) */}
          <div className="flex flex-col items-center">
            <div className="p-4 bg-cyan-50 rounded-full mb-4">
               <Droplets className="w-8 h-8 text-cyan-500" />
            </div>
            <h3 className="text-lg font-bold text-stone-700">Sewage Processing Data</h3>
            <p className="text-stone-500 mt-2 max-w-md">
              Water recovery and treatment metrics are available. 
              {selectedYear ? ` Showing data for ${selectedYear}.` : " Select a year to view details."}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
