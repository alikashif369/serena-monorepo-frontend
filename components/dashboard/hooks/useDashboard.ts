"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  DashboardFilters,
  DashboardState,
  HierarchyTree,
  Site,
  YearlyMetrics,
  AggregateMetrics,
  SiteBoundary,
  Photo,
  SiteSpecies,
  CategoryType,
} from "../types";
import {
  getHierarchyTree,
  getSite,
  getSiteMetrics,
  getAggregateMetrics,
  getPhotos,
  getSiteSpecies,
  getRasterTileUrl,
  listRasters,
} from "@/lib/api/dashboardApi";
import { fetchAllVectorLayers } from "@/lib/utils/vectorLayerService";

// Initial state
const initialFilters: DashboardFilters = {
  organizationId: null,
  regionId: null,
  categoryId: null,
  subCategoryId: null,
  siteId: null,
};

const initialLoadingState = {
  hierarchy: true,
  metrics: false,
  boundaries: true,
  rasters: false,
  photos: false,
  species: false,
  aggregateMetrics: false,
};

export interface UseDashboardReturn {
  // State
  filters: DashboardFilters;
  hierarchy: HierarchyTree | null;
  selectedSite: Site | null;
  yearlyMetrics: YearlyMetrics | null;
  aggregateMetrics: AggregateMetrics[];
  boundaries: SiteBoundary[];
  photos: Photo[];
  species: SiteSpecies[];
  categoryType: CategoryType | undefined;

  // Map state
  showVectors: boolean;
  showImagery: boolean;
  showClassified: boolean;
  selectedYear: number | null;
  availableYears: number[];
  baseLayer: "osm" | "satellite";
  baseRasterTileUrl: string | undefined;
  classifiedRasterTileUrl: string | undefined;

  // Loading states
  loading: typeof initialLoadingState;
  error: string | null;

  // Actions
  setFilter: (level: keyof DashboardFilters, value: number | null) => void;
  setYear: (year: number) => void;
  toggleVectors: () => void;
  toggleImagery: () => void;
  toggleClassified: () => void;
  toggleBaseLayer: () => void;
  selectSiteFromMap: (siteId: number, hierarchy: HierarchyTree | null) => void;
  selectSite: (siteId: number) => void;
  clearSiteSelection: () => void;
  refresh: () => void;
}

export function useDashboard(): UseDashboardReturn {
  // Core state
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [hierarchy, setHierarchy] = useState<HierarchyTree | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [yearlyMetrics, setYearlyMetrics] = useState<YearlyMetrics | null>(null);
  const [allYearlyMetrics, setAllYearlyMetrics] = useState<YearlyMetrics[]>([]);
  const [aggregateMetrics, setAggregateMetrics] = useState<AggregateMetrics[]>([]);
  const [boundaries, setBoundaries] = useState<SiteBoundary[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [species, setSpecies] = useState<SiteSpecies[]>([]);

  // Map state
  const [showVectors, setShowVectors] = useState(true);
  const [showImagery, setShowImagery] = useState(false);
  const [showClassified, setShowClassified] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [baseLayer, setBaseLayer] = useState<"osm" | "satellite">("satellite");
  const [baseRasterTileUrl, setBaseRasterTileUrl] = useState<string | undefined>();
  const [classifiedRasterTileUrl, setClassifiedRasterTileUrl] = useState<string | undefined>();

  // Loading and error states
  const [loading, setLoading] = useState(initialLoadingState);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const availableYears = useMemo(() => {
    return allYearlyMetrics.map((m) => m.year).sort((a, b) => a - b);
  }, [allYearlyMetrics]);

  const categoryType = useMemo<CategoryType | undefined>(() => {
    if (!hierarchy || filters.categoryId === null) return undefined;

    const org = hierarchy.organizations.find(
      (o) => o.id === filters.organizationId
    );
    const region = org?.regions?.find((r) => r.id === filters.regionId);
    const category = region?.categories?.find((c) => c.id === filters.categoryId);

    return category?.type;
  }, [hierarchy, filters]);

  // Load hierarchy on mount
  useEffect(() => {
    async function loadHierarchy() {
      try {
        setLoading((prev) => ({ ...prev, hierarchy: true }));
        console.log("[useDashboard] Fetching hierarchy...");
        const data = await getHierarchyTree();
        console.log("[useDashboard] Hierarchy response:", data);
        console.log("[useDashboard] Organizations:", data?.organizations);
        setHierarchy(data);
        setError(null);
      } catch (err) {
        console.error("[useDashboard] Failed to load hierarchy:", err);
        setError("Failed to load organization hierarchy");
      } finally {
        setLoading((prev) => ({ ...prev, hierarchy: false }));
      }
    }

    loadHierarchy();
  }, []);

  // Load all boundaries on mount
  useEffect(() => {
    async function loadBoundaries() {
      try {
        setLoading((prev) => ({ ...prev, boundaries: true }));
        const response = await fetchAllVectorLayers();
        if (response.success && response.data) {
          // Convert to SiteBoundary format
          const siteBoundaries: SiteBoundary[] = response.data.map((layer: any) => ({
            id: layer.id,
            siteId: layer.siteId,
            year: layer.year,
            geometry: layer.geometry,
            properties: layer.properties,
            site: layer.site,
          }));
          setBoundaries(siteBoundaries);
        }
      } catch (err) {
        console.error("Failed to load boundaries:", err);
      } finally {
        setLoading((prev) => ({ ...prev, boundaries: false }));
      }
    }

    loadBoundaries();
  }, []);

  // Load site details when siteId changes
  useEffect(() => {
    if (filters.siteId === null) {
      setSelectedSite(null);
      setYearlyMetrics(null);
      setAllYearlyMetrics([]);
      setPhotos([]);
      setSpecies([]);
      setSelectedYear(null);
      setBaseRasterTileUrl(undefined);
      setClassifiedRasterTileUrl(undefined);
      return;
    }

    async function loadSiteData() {
      console.log('=== loadSiteData called for siteId:', filters.siteId);
      try {
        setLoading((prev) => ({
          ...prev,
          metrics: true,
          photos: true,
          species: true,
        }));

        // Load site details
        const site = await getSite(filters.siteId!, true);
        setSelectedSite(site);

        // Load all yearly metrics for this site
        const metrics = await getSiteMetrics(filters.siteId!);
        setAllYearlyMetrics(metrics);

        // Set the most recent year as default
        if (metrics.length > 0) {
          const latestYear = Math.max(...metrics.map((m) => m.year));
          setSelectedYear(latestYear);
          setYearlyMetrics(metrics.find((m) => m.year === latestYear) || null);
        }

        // Load photos
        const sitePhotos = await getPhotos({ siteId: filters.siteId! });
        console.log('Photos fetched from API:', sitePhotos);
        console.log('Species photos:', sitePhotos.filter(p => p.category === 'SPECIES'));
        setPhotos(sitePhotos);

        // Load species (gracefully handle if endpoint doesn't exist)
        try {
          console.log('Fetching species for site:', filters.siteId);
          const siteSpecies = await getSiteSpecies(filters.siteId!);
          console.log('Species data received:', siteSpecies);
          setSpecies(siteSpecies);
        } catch (speciesError) {
          console.error("Failed to load species:", speciesError);
          setSpecies([]);
        }

        setError(null);
      } catch (err) {
        console.error("Failed to load site data:", err);
        setError("Failed to load site details");
      } finally {
        setLoading((prev) => ({
          ...prev,
          metrics: false,
          photos: false,
          species: false,
        }));
      }
    }

    loadSiteData();
  }, [filters.siteId]);

  // Load raster URLs when year changes (and site is selected)
  useEffect(() => {
    if (filters.siteId === null || selectedYear === null) {
      setBaseRasterTileUrl(undefined);
      setClassifiedRasterTileUrl(undefined);
      return;
    }

    async function loadRasters() {
      try {
        setLoading((prev) => ({ ...prev, rasters: true }));

        // Find metrics for selected year to get raster IDs
        const yearMetrics = allYearlyMetrics.find((m) => m.year === selectedYear);
        if (yearMetrics) {
          if (yearMetrics.baseRasterId) {
            setBaseRasterTileUrl(getRasterTileUrl(yearMetrics.baseRasterId));
          } else {
            setBaseRasterTileUrl(undefined);
          }

          if (yearMetrics.classifiedRasterId) {
            setClassifiedRasterTileUrl(
              getRasterTileUrl(yearMetrics.classifiedRasterId)
            );
          } else {
            setClassifiedRasterTileUrl(undefined);
          }

          // Update current metrics
          setYearlyMetrics(yearMetrics);
        }
      } catch (err) {
        console.error("Failed to load rasters:", err);
      } finally {
        setLoading((prev) => ({ ...prev, rasters: false }));
      }
    }

    loadRasters();
  }, [filters.siteId, selectedYear, allYearlyMetrics]);

  // Load aggregate metrics when filters change
  useEffect(() => {
    async function loadAggregateMetrics() {
      try {
        setLoading((prev) => ({ ...prev, aggregateMetrics: true }));

        let entityType: "ORGANIZATION" | "REGION" | "CATEGORY" | undefined;
        let entityId: number | undefined;

        if (filters.categoryId !== null) {
          entityType = "CATEGORY";
          entityId = filters.categoryId;
        } else if (filters.regionId !== null) {
          entityType = "REGION";
          entityId = filters.regionId;
        } else if (filters.organizationId !== null) {
          entityType = "ORGANIZATION";
          entityId = filters.organizationId;
        }

        if (entityType && entityId) {
          const metrics = await getAggregateMetrics({
            entityType,
            [entityType === "ORGANIZATION"
              ? "organizationId"
              : entityType === "REGION"
              ? "regionId"
              : "categoryId"]: entityId,
          });
          setAggregateMetrics(metrics);
        } else {
          // Load organization-level metrics if no filter is set
          const metrics = await getAggregateMetrics({ entityType: "ORGANIZATION" });
          setAggregateMetrics(metrics);
        }
      } catch (err) {
        console.error("Failed to load aggregate metrics:", err);
      } finally {
        setLoading((prev) => ({ ...prev, aggregateMetrics: false }));
      }
    }

    loadAggregateMetrics();
  }, [filters.organizationId, filters.regionId, filters.categoryId]);

  // Actions
  const setFilter = useCallback(
    (level: keyof DashboardFilters, value: number | null) => {
      setFilters((prev) => ({ ...prev, [level]: value }));
    },
    []
  );

  const setYear = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  const toggleVectors = useCallback(() => {
    setShowVectors((prev) => !prev);
  }, []);

  const toggleImagery = useCallback(() => {
    setShowImagery((prev) => !prev);
    // Turn off classified when turning on base imagery
    if (!showImagery) {
      setShowClassified(false);
    }
  }, [showImagery]);

  const toggleClassified = useCallback(() => {
    setShowClassified((prev) => !prev);
    // Turn off base imagery when turning on classified
    if (!showClassified) {
      setShowImagery(false);
    }
  }, [showClassified]);

  const toggleBaseLayer = useCallback(() => {
    setBaseLayer((prev) => (prev === "osm" ? "satellite" : "osm"));
  }, []);

  const selectSite = useCallback((siteId: number) => {
    setFilters((prev) => ({ ...prev, siteId }));
  }, []);

  // Select site from map click - updates all parent filters
  const selectSiteFromMap = useCallback(
    (siteId: number, hierarchyData: HierarchyTree | null) => {
      if (!hierarchyData) {
        // Just set siteId if no hierarchy available
        setFilters((prev) => ({ ...prev, siteId }));
        return;
      }

      // Find the site in hierarchy and set all parent filters
      for (const org of hierarchyData.organizations) {
        for (const region of org.regions || []) {
          for (const category of region.categories || []) {
            // Check direct sites under category
            const directSite = category.sites?.find((s) => s.id === siteId);
            if (directSite) {
              setFilters({
                organizationId: org.id,
                regionId: region.id,
                categoryId: category.id,
                subCategoryId: null,
                siteId: siteId,
              });
              return;
            }

            // Check sites under subcategories
            for (const subCategory of category.subCategories || []) {
              const subSite = subCategory.sites?.find((s) => s.id === siteId);
              if (subSite) {
                setFilters({
                  organizationId: org.id,
                  regionId: region.id,
                  categoryId: category.id,
                  subCategoryId: subCategory.id,
                  siteId: siteId,
                });
                return;
              }
            }
          }
        }
      }

      // Fallback: just set siteId
      setFilters((prev) => ({ ...prev, siteId }));
    },
    []
  );

  const clearSiteSelection = useCallback(() => {
    setFilters((prev) => ({ ...prev, siteId: null }));
  }, []);

  const refresh = useCallback(() => {
    // Trigger reload by resetting relevant state
    setLoading(initialLoadingState);
    // The useEffects will re-run on state change
  }, []);

  return {
    // State
    filters,
    hierarchy,
    selectedSite,
    yearlyMetrics,
    aggregateMetrics,
    boundaries,
    photos,
    species,
    categoryType,

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
    selectSite,
    clearSiteSelection,
    refresh,
  };
}
