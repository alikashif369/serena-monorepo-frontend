"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import FilterRow from "./FilterRow";
import DashboardMap from "./DashboardMap";
import SummarySection from "./SummarySection";
import { useDashboard } from "./hooks/useDashboard";

export default function DashboardPage() {
  const {
    // State
    filters,
    hierarchy,
    selectedSite,
    yearlyMetrics,
    categorySummaries,
    boundaries,
    photos,
    species,

    // Map state
    showVectors,
    showImagery,
    showClassified,
    selectedYear,
    availableYears,
    baseLayer,
    baseRasterTileUrl,
    classifiedRasterTileUrl,

    // Loading states
    loading,
    error,

    // Actions
    setFilter,
    setYear,
    toggleVectors,
    toggleImagery,
    toggleClassified,
    toggleBaseLayer,
    selectSiteFromMap,
    clearSiteSelection,
    refresh,
  } = useDashboard();

  // Debug logging
  console.log('>>> DashboardPage - photos from useDashboard:', photos);
  console.log('>>> DashboardPage - photos length:', photos.length);

  // Handle site click on map - updates all parent filters
  const handleSiteClick = React.useCallback(
    (siteId: number) => {
      selectSiteFromMap(siteId, hierarchy);
    },
    [selectSiteFromMap, hierarchy]
  );

  // Filter boundaries based on current filter selection
  const filteredBoundaries = React.useMemo(() => {
    if (!boundaries.length) return [];

    // If a specific site is selected, only show that site's boundary
    if (filters.siteId !== null) {
      return boundaries.filter((b) => b.siteId === filters.siteId);
    }

    // Otherwise, filter by hierarchy if filters are set
    // For now, show all boundaries (filtering can be enhanced with category/region data)
    return boundaries;
  }, [boundaries, filters]);

  return (
    <div className="min-h-screen bg-[var(--color-serena-sand)] font-sans text-stone-800">
      {/* Error banner - Styled to match premium aesthetic */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-red-100 px-6 py-4 shadow-sm relative z-50"
        >
          <div className="max-w-[1920px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium tracking-wide">{error}</span>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-red-700 hover:text-red-900 transition-colors border-b border-red-200 hover:border-red-900 pb-0.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter row */}
      <FilterRow
        filters={filters}
        hierarchy={hierarchy}
        loading={loading.hierarchy}
        onFilterChange={setFilter}
      />

      {/* Map section */}
      <div id="map" className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardMap
          boundaries={filteredBoundaries}
          selectedSiteId={filters.siteId}
          showVectors={showVectors}
          showImagery={showImagery}
          showClassified={showClassified}
          baseLayer={baseLayer}
          selectedYear={selectedYear}
          availableYears={availableYears}
          baseRasterTileUrl={baseRasterTileUrl}
          classifiedRasterTileUrl={classifiedRasterTileUrl}
          onSiteClick={handleSiteClick}
          onToggleVectors={toggleVectors}
          onToggleImagery={toggleImagery}
          onToggleClassified={toggleClassified}
          onToggleBaseLayer={toggleBaseLayer}
          onYearChange={setYear}
          loading={loading.boundaries || loading.rasters}
        />
      </div>

      {/* Summary section */}
      <SummarySection
        selectedSite={selectedSite}
        yearlyMetrics={yearlyMetrics}
        siteSpecies={species}
        sitePhotos={photos}
        categorySummaries={categorySummaries}
        filters={filters}
        selectedYear={selectedYear}
        availableYears={availableYears}
        loading={{
          metrics: loading.metrics,
          categorySummaries: loading.categorySummaries,
          species: loading.species,
          photos: loading.photos,
        }}
        onSiteClose={clearSiteSelection}
      />

      {/* Footer spacer */}
      <div className="h-8" />
    </div>
  );
}
