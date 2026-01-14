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
  ArrowUpRight,
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

// Skeleton loader - Updated to match new layout
function DetailsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-8 h-full bg-white/40 backdrop-blur-md rounded-[2.5rem]">
      <div className="flex justify-between items-start">
        <div className="space-y-4 w-2/3">
           <div className="h-4 bg-gray-200/50 rounded-full w-24" />
           <div className="h-10 bg-gray-200/50 rounded-xl w-3/4" />
           <div className="h-4 bg-gray-200/50 rounded-full w-1/2" />
        </div>
        <div className="h-12 w-12 bg-gray-200/50 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100/50 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

// Empty state - Refined
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-sm text-center px-6">
      <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-full mb-6 shadow-lg ring-1 ring-gray-100">
        <Info className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Discovery Mode</p>
      <p className="text-2xl font-serif text-gray-800 font-medium mb-4">Select a Site to Begin</p>
      <p className="text-sm text-gray-500 max-w-[260px] leading-relaxed">
        Choose a location from the map to view detailed conservation metrics and species data.
      </p>
    </div>
  );
}

// Quick Stats Card Component - Completely Redesigned
function QuickStatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
  delay = 0,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="group relative bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white/80 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 hover:bg-white/80"
    >
      <div className="flex justify-between items-start mb-4">
        <div 
          className="p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100" />
      </div>
      
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1.5">{label}</p>
        <div className="flex flex-col">
          <span className="text-2xl font-medium text-gray-900 tracking-tight font-serif">{value}</span>
          {subValue && <span className="text-xs text-gray-500 font-medium mt-1">{subValue}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// Render category-specific quick stats
function renderQuickStats(site: Site, species: SiteSpecies[], photos: Photo[], selectedYear?: number | null) {
  const categoryType = site.category?.type as CategoryType;
  const categoryColor = site.category?.type ? getCategoryColor(site.category.type) : "#115e59";

  // Solar-specific stats
  if (categoryType === "SOLAR") {
    const solarData = site.solarData;

    // Extract available years
    const availableYears: number[] = [];
    if (solarData?.quarterlyProduction) {
      Object.keys(solarData.quarterlyProduction).forEach(key => {
        const year = parseInt(key.split('_')[0]);
        if (!isNaN(year) && !availableYears.includes(year)) availableYears.push(year);
      });
      availableYears.sort((a, b) => a - b);
    }

    const currentYear = selectedYear || (availableYears.length > 0 ? availableYears[availableYears.length - 1] : new Date().getFullYear());
    
    const yearProduction = solarData?.quarterlyProduction ? (
      (solarData.quarterlyProduction[`${currentYear}_Q1`] || 0) +
      (solarData.quarterlyProduction[`${currentYear}_Q2`] || 0) +
      (solarData.quarterlyProduction[`${currentYear}_Q3`] || 0) +
      (solarData.quarterlyProduction[`${currentYear}_Q4`] || 0)
    ) : 0;

    return (
      <div className="grid grid-cols-2 gap-4">
        <QuickStatCard
          icon={Sun}
          label="Design Capacity"
          value={solarData?.capacityKwh ? `${solarData.capacityKwh.toLocaleString()} kWh` : "Pending"}
          color={categoryColor}
          delay={0.1}
        />
        <QuickStatCard
          icon={Zap}
          label={`${currentYear} Production`}
          value={yearProduction > 0 ? `${yearProduction.toLocaleString()} kWh` : "Recording"}
          color={categoryColor}
          delay={0.2}
        />
        <QuickStatCard
          icon={Calendar}
          label="Installation Year"
          value={solarData?.installationYear || "N/A"}
          color={categoryColor}
          delay={0.3}
        />
         <QuickStatCard
          icon={Layers}
          label="System Status"
          value="Active"
          subValue="Grid Connected"
          color={categoryColor}
          delay={0.4}
        />
      </div>
    );
  }

  // Waste-specific stats
  if (categoryType === "WASTE") {
    const wasteData = site.wasteData;
    const totalWaste = wasteData?.reduce((sum, d) => sum + d.organicWaste, 0) || 0;
    const totalCompost = wasteData?.reduce((sum, d) => sum + d.compostReceived, 0) || 0;

    return (
      <div className="grid grid-cols-2 gap-4">
        <QuickStatCard
          icon={Ruler}
          label="Total Waste"
          value={totalWaste > 0 ? `${totalWaste.toLocaleString()}` : "Pending"}
          subValue="kg Processed"
          color={categoryColor}
          delay={0.1}
        />
        <QuickStatCard
          icon={Trees}
          label="Total Compost"
          value={totalCompost > 0 ? `${totalCompost.toLocaleString()}` : "Recording"}
          subValue="kg Generated"
          color={categoryColor}
          delay={0.2}
        />
         <QuickStatCard
          icon={Recycle}
          label="Diversion Rate"
          value={wasteData && wasteData.length > 0 ? "100%" : "N/A"}
          subValue="Estimated"
          color={categoryColor}
          delay={0.3}
        />
        <QuickStatCard
          icon={Layers}
          label="Years Active"
          value={wasteData?.length || "0"}
          subValue="Years of Data"
          color={categoryColor}
          delay={0.4}
        />
      </div>
    );
  }

  // Sewage-specific stats
  if (categoryType === "SEWAGE") {
    const sewageData = site.sewageData;
    const avgRecovery = sewageData && sewageData.length > 0
      ? sewageData.reduce((sum, d) => sum + d.recoveryRatio, 0) / sewageData.length
      : 0;
    const totalMethane = sewageData?.reduce((sum, d) => sum + d.methaneSaved, 0) || 0;

    return (
      <div className="grid grid-cols-2 gap-4">
        <QuickStatCard
          icon={Droplets}
          label="Recovery Rate"
          value={avgRecovery > 0 ? `${(avgRecovery * 100).toFixed(1)}%` : "Pending"}
          color={categoryColor}
          delay={0.1}
        />
        <QuickStatCard
          icon={Zap}
          label="Methane Saved"
          value={totalMethane > 0 ? `${totalMethane.toLocaleString()} kg` : "Recording"}
          color={categoryColor}
          delay={0.2}
        />
         <QuickStatCard
          icon={Calendar}
          label="Latest Data"
          value={sewageData && sewageData.length > 0 ? Math.max(...sewageData.map(d => d.year)) : "N/A"}
          color={categoryColor}
          delay={0.3}
        />
        <QuickStatCard
          icon={Layers}
          label="Years Tracked"
          value={sewageData?.length || "0"}
          color={categoryColor}
          delay={0.4}
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
          label="Initiative"
          value={site.siteType ? <span className="capitalize">{site.siteType.replace(/_/g, " ").toLowerCase()}</span> : "Community"}
          color={categoryColor}
          delay={0.1}
        />
        <QuickStatCard
          icon={Ruler}
          label="Impact Area"
          value={site.area ? formatArea(site.area) : "Pending"}
          color={categoryColor}
          delay={0.2}
        />
        <QuickStatCard
          icon={Calendar}
          label="Active Period"
          value={communityData?.year || "N/A"}
          color={categoryColor}
          delay={0.3}
        />
        <QuickStatCard
          icon={Layers}
          label="Key Metrics"
          value={dataKeys.length > 0 ? dataKeys.length : "Pending"}
          subValue="Tracked Indicators"
          color={categoryColor}
          delay={0.4}
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
        label="Land Coverage"
        value={site.area ? formatArea(site.area) : "Pending"}
        subValue="Total Area Managed"
        color={categoryColor}
        delay={0.1}
      />
      {/* Site Type */}
      <QuickStatCard
        icon={Building2}
        label="Site Classification"
        value={site.siteType ? <span className="capitalize">{site.siteType.replace(/_/g, " ").toLowerCase()}</span> : "N/A"}
        subValue="Infrastructure Type"
        color={categoryColor}
        delay={0.2}
      />
      {/* Species Count */}
      <QuickStatCard
        icon={Trees}
        label="Ecological Diversity"
        value={species.length > 0 ? species.length : "Surveying"}
        subValue={species.length === 1 ? "Start Species" : "Species Registered"}
        color={categoryColor}
        delay={0.3}
      />
      {/* Photos Count */}
      <QuickStatCard
        icon={Camera}
        label="Visual Records"
        value={photos.length > 0 ? photos.length : "Pending"}
        subValue="Field Images"
        color={categoryColor}
        delay={0.4}
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
    return <DetailsSkeleton />;
  }

  if (!site) {
    return <EmptyState />;
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
        className="relative group h-full flex flex-col"
      >
        {/* Glass Card Container */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl z-0" />
        
        {/* Dynamic Gradient Background Orb */}
        <div 
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[80px] opacity-40 z-0 transition-colors duration-1000"
          style={{ backgroundColor: categoryColor }}
        />

        {/* Content Wrapper */}
        <div className="relative z-10 p-8 h-full flex flex-col">
          
          {/* Header Section */}
          <div className="mb-8 border-b border-gray-100/50 pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Badges */}
                <div className="flex items-center gap-3 mb-4">
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-4 py-1.5 bg-white/60 backdrop-blur-sm border border-white/40 text-gray-800 text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-sm flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Site
                  </motion.span>
                  
                  {site.category && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-white/40 border border-white/20"
                      style={{ color: categoryColor }}
                    >
                      {site.category.name}
                    </motion.span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-3xl lg:text-4xl font-serif text-gray-900 font-medium leading-tight mb-2 tracking-tight">
                  {site.name}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium pl-1">
                  <MapPin className="w-4 h-4 text-emerald-600/80" />
                  <span>{site.city || site.district || "Location Data Pending"}</span>
                  {site.subCategory && (
                    <>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span>{site.subCategory.name}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Close Button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-3 rounded-full bg-white/40 hover:bg-white/80 text-gray-400 hover:text-gray-800 transition-all duration-300 transform hover:rotate-90 shadow-sm hover:shadow-md border border-white/40"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow space-y-6">
             {/* Stats Grid */}
             {renderQuickStats(site, species, photos, selectedYear)}

             {/* Year Indicator Footer */}
             {metrics?.year && (
               <div className="mt-auto pt-6 border-t border-gray-100/50 flex items-center justify-center">
                 <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/30 border border-white/40 text-xs font-medium text-gray-500">
                    <Layers className="w-3.5 h-3.5 opacity-60" />
                    <span>Data Source Year: <span className="text-gray-900 font-bold ml-1">{metrics.year}</span></span>
                 </div>
               </div>
             )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
