"use client";

import React from "react";
import { motion } from "framer-motion";
import LandCoverChart from "./LandCoverChart";
import SiteMetrics from "./SiteMetrics";
import CategorySummaryDisplay from "./CategorySummaryDisplay";
import SiteDetailsPanel from "./SiteDetailsPanel";
import SiteVisuals from "./SiteVisuals";
import SolarProductionChart from "./SolarProductionChart";
import WasteSewageMetrics from "./WasteSewageMetrics";
import CommunityMetrics from "./CommunityMetrics";
import type {
  Site,
  YearlyMetrics,
  SiteSpecies,
  Photo,
  DashboardFilters,
  CategoryType,
} from "./types";
import type { CategorySummary } from "@/lib/api/dashboardApi";

interface SummarySectionProps {
  // Site data (when single site selected)
  selectedSite: Site | null;
  yearlyMetrics: YearlyMetrics | null;
  siteSpecies: SiteSpecies[];
  sitePhotos: Photo[];

  // Category summaries (for org/region/category level text descriptions)
  categorySummaries: CategorySummary[];
  filters: DashboardFilters;

  // Year selection (passed from map timeline control)
  selectedYear: number | null;
  availableYears: number[];

  // Loading states
  loading: {
    metrics: boolean;
    categorySummaries: boolean;
    species: boolean;
    photos: boolean;
  };

  // Callbacks
  onSiteClose?: () => void;
}

// Helper function to get category-specific description
function getCategoryDescription(site: Site): string {
  const categoryType = site.category?.type as CategoryType;
  const siteName = site.name;

  switch (categoryType) {
    case "SOLAR":
      return `Solar energy production metrics and installation details for the ${siteName} solar installation.`;
    case "WASTE":
      return `Organic waste processing and composting analytics for the ${siteName} waste management facility.`;
    case "SEWAGE":
      return `Water recovery and treatment metrics for the ${siteName} sewage treatment facility.`;
    case "COMMUNITY":
      return `Community engagement and social impact metrics for the ${siteName} community initiative.`;
    case "RESTORATION":
    case "PLANTATION":
    default:
      return `Detailed environmental metrics, biodiversity status, and field documentation for the ${siteName} conservation site.`;
  }
}

// Helper to check if category type needs plantation/conservation visuals
function isPlantationType(categoryType: CategoryType | undefined): boolean {
  return categoryType === "PLANTATION" || categoryType === "RESTORATION" || !categoryType;
}

export default function SummarySection({
  selectedSite,
  yearlyMetrics,
  siteSpecies,
  sitePhotos,
  categorySummaries,
  filters,
  selectedYear,
  availableYears,
  loading,
  onSiteClose,
}: SummarySectionProps) {
  const hasSingleSite = selectedSite !== null;
  const categoryType = selectedSite?.category?.type as CategoryType | undefined;

  // Determine if we're at the top level (no filters selected)
  const isTopLevel = !filters.organizationId && !filters.regionId && !filters.categoryId;

  // Determine what type of site this is
  const isPlantation = isPlantationType(categoryType);
  const isSolar = categoryType === "SOLAR";
  const isWasteOrSewage = categoryType === "WASTE" || categoryType === "SEWAGE";
  const isCommunity = categoryType === "COMMUNITY";

  // For Solar sites, extract available years from quarterly production data (handle Q1_2023 and 2023_Q1)
  const solarYears = React.useMemo(() => {
    if (!isSolar || !selectedSite?.solarData?.quarterlyProduction) return [];

    const years = new Set<number>();
    Object.keys(selectedSite.solarData.quarterlyProduction).forEach(key => {
      const parts = key.split('_');
      // Handle both formats: 2023_Q1 or Q1_2023
      const year = parts[0].startsWith('Q') ? parseInt(parts[1]) : parseInt(parts[0]);
      if (!isNaN(year)) years.add(year);
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [isSolar, selectedSite?.solarData?.quarterlyProduction]);

  // For Waste sites, extract available years from wasteData
  const wasteYears = React.useMemo(() => {
    if (categoryType !== 'WASTE' || !selectedSite?.wasteData) return [];
    return [...new Set(selectedSite.wasteData.map(d => d.year))].sort((a, b) => a - b);
  }, [categoryType, selectedSite?.wasteData]);

  // For Sewage sites, extract available years from sewageData
  const sewageYears = React.useMemo(() => {
    if (categoryType !== 'SEWAGE' || !selectedSite?.sewageData) return [];
    return [...new Set(selectedSite.sewageData.map(d => d.year))].sort((a, b) => a - b);
  }, [categoryType, selectedSite?.sewageData]);

  // Use category-specific years if available, otherwise use available years from props
  const effectiveYears = React.useMemo(() => {
    if (isSolar && solarYears.length > 0) return solarYears;
    if (categoryType === 'WASTE' && wasteYears.length > 0) return wasteYears;
    if (categoryType === 'SEWAGE' && sewageYears.length > 0) return sewageYears;
    return availableYears;
  }, [isSolar, solarYears, categoryType, wasteYears, sewageYears, availableYears]);

  const effectiveSelectedYear = selectedYear || (effectiveYears.length > 0 ? effectiveYears[effectiveYears.length - 1] : null);

  return (
    <motion.div
      id="summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white border-t border-gray-100 shadow-[0_-1px_10px_rgba(0,0,0,0.02)] relative z-10"
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section header */}
        <div className="mb-12 text-center md:text-left pb-10 border-b border-gradient-to-r from-transparent via-gray-200 to-transparent">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-700 text-[11px] font-extrabold uppercase tracking-[0.25em] bg-emerald-50 px-3 py-1 rounded-full">
                  {hasSingleSite ? "Deep-Dive Site Analytics" : "Ecosystem Performance Overview"}
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif text-[#115e59] font-bold tracking-tight mb-3 leading-tight">
                {hasSingleSite ? selectedSite?.name : "Summary Overview"}
              </h2>
              {hasSingleSite && selectedSite && (
                <p className="text-gray-500 text-base max-w-2xl font-normal leading-relaxed">
                  {getCategoryDescription(selectedSite)}
                </p>
              )}
            </div>
          </div>
        </div>

        {hasSingleSite && selectedSite ? (
          // Single site view - Dynamic based on category type
          <div className="space-y-16">
            {/* Plantation: Show Land Cover Chart + Site Details Panel - Updated Layout for balance */}
            {isPlantation && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Left Side: Land Cover Chart (1 col) */}
                <div className="w-full">
                  <LandCoverChart
                    metrics={yearlyMetrics}
                    loading={loading.metrics}
                    showTitle={true}
                  />
                </div>

                {/* Right Side: Site Details (1 col) */ }
                {/* Fixed height to match chart somewhat or allow natural growth */}
                <div className="w-full">
                  <SiteDetailsPanel
                    site={selectedSite}
                    metrics={yearlyMetrics}
                    species={siteSpecies}
                    photos={sitePhotos}
                    selectedYear={effectiveSelectedYear}
                    loading={loading.metrics || loading.species}
                    onClose={onSiteClose}
                  />
                </div>
              </div>
            )}

            {/* Solar/Waste/Sewage/Community: Full Width Chart (NO Timeline, NO Sidebar) */}
            {(isSolar || isWasteOrSewage || isCommunity) && (
              <div>
                {isSolar && (
                  <SolarProductionChart
                    site={selectedSite}
                    selectedYear={effectiveSelectedYear}
                    loading={loading.metrics}
                  />
                )}
                {isWasteOrSewage && (
                  <WasteSewageMetrics
                    site={selectedSite}
                    selectedYear={effectiveSelectedYear}
                    loading={loading.metrics}
                  />
                )}
                {isCommunity && (
                  <CommunityMetrics
                    site={selectedSite}
                    photos={sitePhotos}
                    selectedYear={effectiveSelectedYear}
                    loading={loading.metrics || loading.photos}
                  />
                )}
              </div>
            )}

            {/* Middle Row: Visual Documentation & Biodiversity - Only for Plantation/Restoration */}
            {isPlantation && (
              <div className="pt-20 mt-16 border-t-2 border-gray-100">
                <SiteVisuals
                  species={siteSpecies}
                  photos={sitePhotos}
                  siteName={selectedSite.name}
                  loading={loading.photos || loading.species}
                />
              </div>
            )}

            {/* Bottom Row: Site Specific Metrics */}
            <div className="pt-20 mt-16 border-t-2 border-gray-100">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                  <span className="text-amber-700 text-[11px] font-extrabold uppercase tracking-[0.25em]">
                    Performance Indicators
                  </span>
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900">Key Metrics Overview</h3>
              </div>
              <SiteMetrics
                site={selectedSite}
                selectedYear={effectiveSelectedYear}
                loading={loading.metrics}
              />
            </div>
          </div>
        ) : (
          // Multi-site view - show category summaries
          <div className="space-y-8">
            {/* Category Summaries - Text descriptions for org/region/category */}
            <CategorySummaryDisplay
              summaries={categorySummaries}
              loading={loading.categorySummaries}
            />

            {/* Empty state handling */}
            {!loading.categorySummaries && categorySummaries.length === 0 && (
              <div className="bg-gradient-to-br from-white to-stone-50/30 rounded-2xl border border-gray-100 shadow-sm p-10">
                {isTopLevel ? (
                  // Default welcome text when no filters are selected
                  <div className="prose prose-stone max-w-none">
                    <h3 className="text-2xl font-serif font-bold text-[#115e59] mb-6 flex items-center gap-3">
                      <span className="w-1 h-8 bg-[#b08d4b] rounded-full"></span>
                      Serena Green Initiative
                    </h3>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                      <p>
                        Serena Hotels continue to pledge in promoting clean and green Pakistan by focusing on climate change mitigation,
                        climate adaptation, land degradation, food security, biodiversity conservation, and enhancing community resilience.
                      </p>
                      <p>
                        Serena Green Initiative unites our Asia and Africa programs to restore ecosystems and cut operational emissions.
                        We focus on native tree planting and forest stewardship, water and soil conservation, and community-led stewardship
                        backed by transparent monitoring. In parallel, we advance clean-energy upgrades—like rooftop solar and efficiency
                        improvements—to support resilient, nature-positive hospitality across both regions.
                      </p>
                      <p>
                        This is a pilot project of planting 600,000 trees, including species Populus (Poplar), Robinia pseudoacacia (Robinia),
                        Salix (Willow), Elaeagnus angustifolia (Russian Olive), Pinus roxburghii (Chir), Quercus (Oak), Cedrus deodara (Deodar),
                        Tamarix aphylla (Tamarix), Acacia nilotica (Kikar), Ziziphus mauritiana (Ber), and Melia azedarach (Bakain) in different
                        areas of Gilgit-Baltistan, Balochistan, Chitral, Punjab, and KP. With afforestation and forest stewardship as the primary
                        plantation types, this project has the potential to make a significant impact on the environment and local communities.
                        Through collaboration and community involvement, this pilot project has the potential to serve as a model for other
                        afforestation efforts around the world. The project has been completed in August, 2023.
                      </p>
                    </div>
                  </div>
                ) : (
                  // "No metrics available" when deeper in hierarchy but no data
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-stone-400"
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
                    <p className="text-sm font-medium text-stone-600">No metrics available</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Select a category to view performance metrics
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
