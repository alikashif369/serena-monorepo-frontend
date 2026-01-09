"use client";

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
} from "lucide-react";
import type { Site, YearlyMetrics, SiteSpecies, Photo } from "./types";
import { formatArea } from "@/lib/api/dashboardApi";
import { getCategoryColor } from "./utils/colorPalettes";

interface SiteDetailsPanelProps {
  site: Site | null;
  metrics: YearlyMetrics | null;
  species: SiteSpecies[];
  photos: Photo[];
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

export default function SiteDetailsPanel({
  site,
  metrics,
  species,
  photos,
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
        className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden h-full flex flex-col"
      >
        {/* Header with Site Identity */}
        <div className="p-8 relative overflow-hidden flex-shrink-0">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundColor: categoryColor }}
          />
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-40" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-100/50">
                  Active Site
                </span>
                {site.category && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2"
                    style={{ color: categoryColor }}
                  >
                    {site.category.name}
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-serif text-[#115e59] mb-2 font-bold leading-tight">
                {site.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>{site.city || site.district || "Location Data Pending"}</span>
                {site.subCategory && (
                  <>
                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span>{site.subCategory.name}</span>
                  </>
                )}
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-3 rounded-full bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-all duration-300 transform hover:rotate-90"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content - Fills remaining space */}
        <div className="flex-grow flex flex-col justify-end p-8 pt-0">
          {/* Quick Stats Grid - 2x2 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Area */}
            <div className="p-5 bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-2xl border border-stone-200/30 group hover:border-emerald-200 transition-all hover:shadow-md">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform">
                <Ruler className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-1">Coverage Area</p>
              <p className="text-xl font-bold text-gray-800">
                {site.area ? formatArea(site.area) : <span className="text-gray-300 text-sm font-medium italic">Pending</span>}
              </p>
            </div>

            {/* Site Type */}
            <div className="p-5 bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-2xl border border-stone-200/30 group hover:border-emerald-200 transition-all hover:shadow-md">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 mb-1">Infrastructure</p>
              <p className="text-xl font-bold text-gray-800 capitalize">
                {site.siteType ? site.siteType.replace(/_/g, " ").toLowerCase() : <span className="text-gray-300 text-sm font-medium italic">N/A</span>}
              </p>
            </div>

            {/* Species Count */}
            <div className="p-5 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl border border-emerald-200/30 group hover:border-emerald-300 transition-all hover:shadow-md">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform">
                <Trees className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-700 mb-1">Biodiversity</p>
              <p className="text-xl font-bold text-emerald-700">
                {species.length > 0 ? (
                  <>{species.length} <span className="text-sm font-medium">Species</span></>
                ) : (
                  <span className="text-gray-300 text-sm font-medium italic">Surveying</span>
                )}
              </p>
            </div>

            {/* Photos Count */}
            <div className="p-5 bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-2xl border border-amber-200/30 group hover:border-amber-300 transition-all hover:shadow-md">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-amber-700 mb-1">Field Photos</p>
              <p className="text-xl font-bold text-amber-600">
                {photos.length > 0 ? (
                  <>{photos.length} <span className="text-sm font-medium">Images</span></>
                ) : (
                  <span className="text-gray-300 text-sm font-medium italic">Pending</span>
                )}
              </p>
            </div>
          </div>

          {/* Data Year Indicator */}
          {metrics?.year && (
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Layers className="w-4 h-4" />
                <span className="font-medium">Analysis Year: <span className="text-emerald-600 font-bold">{metrics.year}</span></span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
