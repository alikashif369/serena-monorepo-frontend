"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Ruler,
  Building2,
  X,
  Info,
  Trees,
  Camera,
  Layers,
  Sun,
  Zap,
  Calendar,
  Recycle,
  Droplets,
  Users,
} from "lucide-react";
import type { Site, YearlyMetrics, SiteSpecies, Photo, CategoryType } from "./types";
import { formatArea } from "@/lib/api/dashboardApi";
import { getCategoryColor } from "./utils/colorPalettes";

interface SiteDetailsPanelProps {
  site: Site | null;
  metrics: YearlyMetrics | null;
  species: SiteSpecies[];
  photos: Photo[];
  selectedYear?: number | null;
  loading?: boolean;
  onClose?: () => void;
}

// Skeleton loader
function DetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-8 h-full">
      <div className="h-6 bg-gray-100 rounded-lg w-1/2" />
      <div className="h-10 bg-gray-100 rounded-lg w-3/4" />
      <div className="h-4 bg-gray-50 rounded w-1/2" />
      <div className="flex-grow" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-50 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-gray-300">
      <div className="p-6 bg-gray-50 rounded-full mb-5">
        <Info className="w-10 h-10 opacity-30" />
      </div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Selection Required</p>
      <p className="text-xs mt-3 text-center text-gray-400 max-w-[220px] leading-relaxed">
        Select a site from the map or use filters to explore detailed conservation metrics.
      </p>
    </div>
  );
}

// Quick Stats Card Component
function QuickStatCard({
  icon: Icon,
  label,
  value,
  iconColor,
  bgGradient,
  borderColor,
  labelColor,
  valueColor,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  iconColor: string;
  bgGradient: string;
  borderColor: string;
  labelColor: string;
  valueColor: string;
}) {
  return (
    <div className={`p-5 bg-gradient-to-br ${bgGradient} rounded-2xl border ${borderColor} group hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
      {/* Decorative element */}
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="relative z-10">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <p className={`text-[10px] uppercase font-extrabold tracking-[0.2em] ${labelColor} mb-2`}>{label}</p>
        <p className={`text-2xl font-bold ${valueColor} tracking-tight`}>{value}</p>
      </div>
    </div>
  );
}

// Render category-specific quick stats
function renderQuickStats(site: Site, species: SiteSpecies[], photos: Photo[], selectedYear?: number | null) {
  const categoryType = site.category?.type as CategoryType;

  // Solar-specific stats
  if (categoryType === "SOLAR") {
    const solarData = site.solarData;

    // Extract available years from quarterly production
    const availableYears: number[] = [];
    if (solarData?.quarterlyProduction) {
      Object.keys(solarData.quarterlyProduction).forEach(key => {
        const year = parseInt(key.split('_')[0]);
        if (!isNaN(year) && !availableYears.includes(year)) availableYears.push(year);
      });
      availableYears.sort((a, b) => a - b);
    }

    // Use selected year or default to latest
    const currentYear = selectedYear || (availableYears.length > 0 ? availableYears[availableYears.length - 1] : new Date().getFullYear());

    // Get year-specific production
    const yearProduction = solarData?.quarterlyProduction ? (
      (solarData.quarterlyProduction[`${currentYear}_Q1`] || 0) +
      (solarData.quarterlyProduction[`${currentYear}_Q2`] || 0) +
      (solarData.quarterlyProduction[`${currentYear}_Q3`] || 0) +
      (solarData.quarterlyProduction[`${currentYear}_Q4`] || 0)
    ) : 0;

    // Count quarters with data for this year
    const quartersWithData = solarData?.quarterlyProduction ? [
      solarData.quarterlyProduction[`${currentYear}_Q1`],
      solarData.quarterlyProduction[`${currentYear}_Q2`],
      solarData.quarterlyProduction[`${currentYear}_Q3`],
      solarData.quarterlyProduction[`${currentYear}_Q4`],
    ].filter(v => v && v > 0).length : 0;

    return (
      <div className="grid grid-cols-2 gap-4">
        <QuickStatCard
          icon={Sun}
          label="Capacity"
          value={solarData?.capacityKwh ? `${solarData.capacityKwh.toLocaleString()} kWh` : <span className="text-gray-300 text-sm font-medium italic">Pending</span>}
          iconColor="text-amber-600"
          bgGradient="from-amber-50/50 to-orange-50/50"
          borderColor="border-amber-200/30 hover:border-amber-300"
          labelColor="text-amber-700"
          valueColor="text-amber-700"
        />
        <QuickStatCard
          icon={Zap}
          label={`${currentYear} Production`}
          value={yearProduction > 0 ? `${yearProduction.toLocaleString()} kWh` : <span className="text-gray-300 text-sm font-medium italic">Recording</span>}
          iconColor="text-emerald-600"
          bgGradient="from-emerald-50/50 to-teal-50/50"
          borderColor="border-emerald-200/30 hover:border-emerald-300"
          labelColor="text-emerald-700"
          valueColor="text-emerald-700"
        />
        <QuickStatCard
          icon={Calendar}
          label="Installation Year"
          value={solarData?.installationYear || <span className="text-gray-300 text-sm font-medium italic">N/A</span>}
          iconColor="text-blue-600"
          bgGradient="from-blue-50/50 to-sky-50/50"
          borderColor="border-blue-200/30 hover:border-blue-300"
          labelColor="text-blue-700"
          valueColor="text-blue-700"
        />
        <QuickStatCard
          icon={Layers}
          label={`Q's in ${currentYear}`}
          value={quartersWithData > 0 ? `${quartersWithData}/4` : <span className="text-gray-300 text-sm font-medium italic">Pending</span>}
          iconColor="text-purple-600"
          bgGradient="from-purple-50/50 to-violet-50/50"
          borderColor="border-purple-200/30 hover:border-purple-300"
          labelColor="text-purple-700"
          valueColor="text-purple-700"
        />
      </div>
    );
  }

  // Waste-specific stats
  if (categoryType === "WASTE") {
    const wasteData = site.wasteData;
    const latestWaste = wasteData && wasteData.length > 0
      ? [...wasteData].sort((a, b) => b.year - a.year)[0]
      : null;
    const totalWaste = wasteData?.reduce((sum, d) => sum + d.organicWaste, 0) || 0;
    const totalCompost = wasteData?.reduce((sum, d) => sum + d.compostReceived, 0) || 0;

    return (
      <div className="grid grid-cols-2 gap-4">
        <QuickStatCard
          icon={Recycle}
          label="Latest Year"
          value={latestWaste?.year || <span className="text-gray-300 text-sm font-medium italic">N/A</span>}
          iconColor="text-green-600"
          bgGradient="from-green-50/50 to-emerald-50/50"
          borderColor="border-green-200/30 hover:border-green-300"
          labelColor="text-green-700"
          valueColor="text-green-700"
        />
        <QuickStatCard
          icon={Ruler}
          label="Total Waste"
          value={totalWaste > 0 ? `${totalWaste.toLocaleString()} kg` : <span className="text-gray-300 text-sm font-medium italic">Pending</span>}
          iconColor="text-amber-600"
          bgGradient="from-amber-50/50 to-orange-50/50"
          borderColor="border-amber-200/30 hover:border-amber-300"
          labelColor="text-amber-700"
          valueColor="text-amber-700"
        />
        <QuickStatCard
          icon={Trees}
          label="Total Compost"
          value={totalCompost > 0 ? `${totalCompost.toLocaleString()} kg` : <span className="text-gray-300 text-sm font-medium italic">Recording</span>}
          iconColor="text-lime-600"
          bgGradient="from-lime-50/50 to-green-50/50"
          borderColor="border-lime-200/30 hover:border-lime-300"
          labelColor="text-lime-700"
          valueColor="text-lime-700"
        />
        <QuickStatCard
          icon={Layers}
          label="Years Tracked"
          value={wasteData?.length || <span className="text-gray-300 text-sm font-medium italic">0</span>}
          iconColor="text-teal-600"
          bgGradient="from-teal-50/50 to-cyan-50/50"
          borderColor="border-teal-200/30 hover:border-teal-300"
          labelColor="text-teal-700"
          valueColor="text-teal-700"
        />
      </div>
    );
  }

  // Sewage-specific stats
  if (categoryType === "SEWAGE") {
    const sewageData = site.sewageData;
    const latestSewage = sewageData && sewageData.length > 0
      ? [...sewageData].sort((a, b) => b.year - a.year)[0]
      : null;
    const avgRecovery = sewageData && sewageData.length > 0
      ? sewageData.reduce((sum, d) => sum + d.recoveryRatio, 0) / sewageData.length
      : 0;
    const totalMethane = sewageData?.reduce((sum, d) => sum + d.methaneSaved, 0) || 0;

    return (
      <div className="grid grid-cols-2 gap-4">
        <QuickStatCard
          icon={Droplets}
          label="Recovery Rate"
          value={avgRecovery > 0 ? `${(avgRecovery * 100).toFixed(1)}%` : <span className="text-gray-300 text-sm font-medium italic">Pending</span>}
          iconColor="text-teal-600"
          bgGradient="from-teal-50/50 to-cyan-50/50"
          borderColor="border-teal-200/30 hover:border-teal-300"
          labelColor="text-teal-700"
          valueColor="text-teal-700"
        />
        <QuickStatCard
          icon={Calendar}
          label="Latest Year"
          value={latestSewage?.year || <span className="text-gray-300 text-sm font-medium italic">N/A</span>}
          iconColor="text-blue-600"
          bgGradient="from-blue-50/50 to-sky-50/50"
          borderColor="border-blue-200/30 hover:border-blue-300"
          labelColor="text-blue-700"
          valueColor="text-blue-700"
        />
        <QuickStatCard
          icon={Zap}
          label="Methane Saved"
          value={totalMethane > 0 ? `${totalMethane.toLocaleString()} kg` : <span className="text-gray-300 text-sm font-medium italic">Recording</span>}
          iconColor="text-emerald-600"
          bgGradient="from-emerald-50/50 to-green-50/50"
          borderColor="border-emerald-200/30 hover:border-emerald-300"
          labelColor="text-emerald-700"
          valueColor="text-emerald-700"
        />
        <QuickStatCard
          icon={Layers}
          label="Years Tracked"
          value={sewageData?.length || <span className="text-gray-300 text-sm font-medium italic">0</span>}
          iconColor="text-purple-600"
          bgGradient="from-purple-50/50 to-violet-50/50"
          borderColor="border-purple-200/30 hover:border-purple-300"
          labelColor="text-purple-700"
          valueColor="text-purple-700"
        />
      </div>
    );
  }

  // Community-specific stats
  if (categoryType === "COMMUNITY") {
    const communityData = site.communityData;
    const dataKeys = communityData?.data ? Object.keys(communityData.data) : [];

    return (
      <div className="grid grid-cols-2 gap-4">
        <QuickStatCard
          icon={Users}
          label="Initiative Type"
          value={site.siteType ? site.siteType.replace(/_/g, " ").toLowerCase() : <span className="text-gray-300 text-sm font-medium italic">Community</span>}
          iconColor="text-purple-600"
          bgGradient="from-purple-50/50 to-violet-50/50"
          borderColor="border-purple-200/30 hover:border-purple-300"
          labelColor="text-purple-700"
          valueColor="text-purple-700 capitalize"
        />
        <QuickStatCard
          icon={Calendar}
          label="Data Year"
          value={communityData?.year || <span className="text-gray-300 text-sm font-medium italic">N/A</span>}
          iconColor="text-blue-600"
          bgGradient="from-blue-50/50 to-sky-50/50"
          borderColor="border-blue-200/30 hover:border-blue-300"
          labelColor="text-blue-700"
          valueColor="text-blue-700"
        />
        <QuickStatCard
          icon={Ruler}
          label="Coverage Area"
          value={site.area ? formatArea(site.area) : <span className="text-gray-300 text-sm font-medium italic">Pending</span>}
          iconColor="text-emerald-600"
          bgGradient="from-stone-50 to-stone-100/50"
          borderColor="border-stone-200/30 hover:border-emerald-200"
          labelColor="text-gray-400"
          valueColor="text-gray-800"
        />
        <QuickStatCard
          icon={Layers}
          label="Metrics Tracked"
          value={dataKeys.length > 0 ? dataKeys.length : <span className="text-gray-300 text-sm font-medium italic">Pending</span>}
          iconColor="text-amber-600"
          bgGradient="from-amber-50/50 to-orange-50/50"
          borderColor="border-amber-200/30 hover:border-amber-300"
          labelColor="text-amber-700"
          valueColor="text-amber-700"
        />
      </div>
    );
  }

  // Default: Plantation/Restoration stats
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Area */}
      <QuickStatCard
        icon={Ruler}
        label="Coverage Area"
        value={site.area ? formatArea(site.area) : <span className="text-gray-300 text-sm font-medium italic">Pending</span>}
        iconColor="text-emerald-600"
        bgGradient="from-stone-50 to-stone-100/50"
        borderColor="border-stone-200/30 hover:border-emerald-200"
        labelColor="text-gray-400"
        valueColor="text-gray-800"
      />
      {/* Site Type */}
      <QuickStatCard
        icon={Building2}
        label="Infrastructure"
        value={site.siteType ? <span className="capitalize">{site.siteType.replace(/_/g, " ").toLowerCase()}</span> : <span className="text-gray-300 text-sm font-medium italic">N/A</span>}
        iconColor="text-emerald-600"
        bgGradient="from-stone-50 to-stone-100/50"
        borderColor="border-stone-200/30 hover:border-emerald-200"
        labelColor="text-gray-400"
        valueColor="text-gray-800"
      />
      {/* Species Count */}
      <QuickStatCard
        icon={Trees}
        label="Biodiversity"
        value={species.length > 0 ? <>{species.length} <span className="text-sm font-medium">Species</span></> : <span className="text-gray-300 text-sm font-medium italic">Surveying</span>}
        iconColor="text-emerald-600"
        bgGradient="from-emerald-50/50 to-teal-50/50"
        borderColor="border-emerald-200/30 hover:border-emerald-300"
        labelColor="text-emerald-700"
        valueColor="text-emerald-700"
      />
      {/* Photos Count */}
      <QuickStatCard
        icon={Camera}
        label="Field Photos"
        value={photos.length > 0 ? <>{photos.length} <span className="text-sm font-medium">Images</span></> : <span className="text-gray-300 text-sm font-medium italic">Pending</span>}
        iconColor="text-amber-600"
        bgGradient="from-amber-50/50 to-orange-50/50"
        borderColor="border-amber-200/30 hover:border-amber-300"
        labelColor="text-amber-700"
        valueColor="text-amber-600"
      />
    </div>
  );
}

export default function SiteDetailsPanel({
  site,
  metrics,
  species,
  photos,
  selectedYear,
  loading = false,
  onClose,
}: SiteDetailsPanelProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden h-full"
      >
        <DetailsSkeleton />
      </motion.div>
    );
  }

  if (!site) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 h-full">
        <EmptyState />
      </div>
    );
  }

  const categoryColor = site.category?.type
    ? getCategoryColor(site.category.type)
    : "#115e59";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={site.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-gradient-to-br from-white via-gray-50/30 to-white rounded-[2rem] shadow-2xl border-2 border-gray-100 overflow-hidden h-full flex flex-col"
      >
        {/* Header with Site Identity */}
        <div className="p-7 relative overflow-hidden flex-shrink-0 border-b-2 border-gray-50">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundColor: categoryColor }}
          />
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-[0.15em] rounded-xl shadow-lg flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  Active Site
                </span>
                {site.category && (
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-[0.15em] px-3 py-1.5 rounded-xl"
                    style={{ color: categoryColor, backgroundColor: `${categoryColor}10` }}
                  >
                    {site.category.name}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-serif text-[#115e59] mb-2 font-bold leading-tight tracking-tight">
                {site.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{site.city || site.district || "Location Data Pending"}</span>
                {site.subCategory && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{site.subCategory.name}</span>
                  </>
                )}
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 rounded-xl bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-300 transform hover:rotate-90 shadow-sm hover:shadow-md border border-gray-100 hover:border-red-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-7 pt-6 space-y-6">
          {/* Quick Stats Grid - 2x2 - Dynamic based on category type */}
          {renderQuickStats(site, species, photos, selectedYear)}

          {/* Data Year Indicator */}
          {metrics?.year && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2.5 text-xs bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2.5 rounded-xl border border-emerald-100">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-gray-600">Analysis Year: <span className="text-emerald-700 font-extrabold">{metrics.year}</span></span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
