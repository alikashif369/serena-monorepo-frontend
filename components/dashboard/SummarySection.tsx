"use client";

import React from "react";
import { motion } from "framer-motion";
import LandCoverChart from "./LandCoverChart";
import CategoryMetrics from "./CategoryMetrics";
import SiteDetailsPanel from "./SiteDetailsPanel";
import SiteVisuals from "./SiteVisuals";
import type {
  Site,
  YearlyMetrics,
  AggregateMetrics,
  SiteSpecies,
  Photo,
  CategoryType,
} from "./types";

interface SummarySectionProps {
  // Site data (when single site selected)
  selectedSite: Site | null;
  yearlyMetrics: YearlyMetrics | null;
  siteSpecies: SiteSpecies[];
  sitePhotos: Photo[];

  // Aggregate data (for org/region/category level)
  aggregateMetrics: AggregateMetrics[];
  categoryType?: CategoryType;

  // Loading states
  loading: {
    metrics: boolean;
    aggregateMetrics: boolean;
    species: boolean;
    photos: boolean;
  };

  // Callbacks
  onSiteClose?: () => void;
}

export default function SummarySection({
  selectedSite,
  yearlyMetrics,
  siteSpecies,
  sitePhotos,
  aggregateMetrics,
  categoryType,
  loading,
  onSiteClose,
}: SummarySectionProps) {
  const hasSingleSite = selectedSite !== null;

  return (
    <motion.div
      id="summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white border-t border-gray-100 shadow-[0_-1px_10px_rgba(0,0,0,0.02)] relative z-10"
    >
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Section header */}
        <div className="mb-10 text-center md:text-left border-b border-gray-100 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[#b08d4b] text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">
                {hasSingleSite ? "Deep-Dive Site Analytics" : "Ecosystem Performance Overview"}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#115e59] font-bold">
                {hasSingleSite ? selectedSite?.name : "Summary Overview"}
              </h2>
            </div>
            {hasSingleSite && (
              <p className="text-gray-400 text-sm max-w-md font-medium leading-relaxed">
                Detailed environmental metrics, biodiversity status, and field documentation for the {selectedSite?.name} conservation site.
              </p>
            )}
          </div>
        </div>

        {hasSingleSite ? (
          // Single site view - Optimized Proportional Layout
          <div className="space-y-16">
            {/* Top Row: Visual Intelligence Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Side: Land Cover Chart (7 cols) */}
              <div className="lg:col-span-7 h-full">
                <LandCoverChart
                  metrics={yearlyMetrics}
                  loading={loading.metrics}
                  showTitle={true}
                />
              </div>

              {/* Right Side: Site Details (5 cols) */}
              <div className="lg:col-span-5 h-full">
                <SiteDetailsPanel
                  site={selectedSite}
                  metrics={yearlyMetrics}
                  species={siteSpecies}
                  photos={sitePhotos}
                  loading={loading.metrics || loading.species}
                  onClose={onSiteClose}
                />
              </div>
            </div>

            {/* Middle Row: Visual Documentation & Biodiversity */}
            <div className="pt-12 border-t border-gray-50">
               <SiteVisuals 
                 species={siteSpecies} 
                 photos={sitePhotos} 
                 siteName={selectedSite.name} 
                 loading={loading.photos || loading.species}
               />
            </div>

            {/* Bottom Row: Aggregate Metrics (Optional if data exists) */}
            {aggregateMetrics.length > 0 && (
              <div className="pt-16 border-t border-gray-50">
                <CategoryMetrics
                  metrics={aggregateMetrics}
                  categoryType={categoryType}
                  loading={loading.aggregateMetrics}
                  compact={false}
                />
              </div>
            )}
          </div>
        ) : (
          // Multi-site view - show aggregate metrics
          <div className="space-y-8">
            <CategoryMetrics
              metrics={aggregateMetrics}
              categoryType={categoryType}
              loading={loading.aggregateMetrics}
              compact={false}
            />

            {!loading.aggregateMetrics && aggregateMetrics.length === 0 && (
              <div className="bg-stone-50 rounded-[2rem] border border-stone-100 p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <svg
                    className="w-10 h-10 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-800 mb-3">
                  Ecosystem Intelligence
                </h3>
                <p className="text-stone-500 max-w-md mx-auto leading-relaxed">
                  Utilize the geospatial filters above to synthesize data across organizations, 
                  regions, or impact categories. Select a specific site to unlock high-resolution imagery and field reports.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
