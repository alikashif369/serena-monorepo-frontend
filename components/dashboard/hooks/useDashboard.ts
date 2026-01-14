"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  DashboardFilters,
  HierarchyTree,
  Site,
  YearlyMetrics,
  SiteBoundary,
  Photo,
  SiteSpecies,
  CategoryType,
} from "../types";
import {
  getHierarchyTree,
  getSite,
  getSiteMetrics,
  getPhotos,
  getSiteSpecies,
  getRasterTileUrl,
  getCategorySummaries,
  type CategorySummary,
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
  categorySummaries: false,
};

export interface UseDashboardReturn {
  // State
  filters: DashboardFilters;
  hierarchy: HierarchyTree | null;
  selectedSite: Site | null;
  yearlyMetrics: YearlyMetrics | null;
  categorySummaries: CategorySummary[];
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
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
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
  
  // Refresh trigger for boundaries
  const [boundariesRefreshKey, setBoundariesRefreshKey] = useState(0);

  // Derived state - Category Type
  const categoryType = useMemo<CategoryType | undefined>(() => {
    if (!hierarchy || filters.categoryId === null) return undefined;

    const org = hierarchy.organizations.find(
      (o) => o.id === filters.organizationId
    );
    const region = org?.regions?.find((r) => r.id === filters.regionId);
    const category = region?.categories?.find((c) => c.id === filters.categoryId);

    return category?.type;
  }, [hierarchy, filters]);

  // Derived state - Available Years (category-specific)
  const availableYears = useMemo(() => {
    // If no site selected, use yearly metrics (plantation data)
    if (!selectedSite) {
      return allYearlyMetrics.map((m) => m.year).sort((a, b) => a - b);
    }

    const siteCategory = selectedSite.category?.type as CategoryType | undefined;

    // Solar: Extract years from quarterly production keys
    if (siteCategory === 'SOLAR' && selectedSite.solarData?.quarterlyProduction) {
      const years = new Set<number>();
      Object.keys(selectedSite.solarData.quarterlyProduction).forEach(key => {
        const parts = key.split('_');
        const year = parts[0].startsWith('Q') ? parseInt(parts[1]) : parseInt(parts[0]);
        if (!isNaN(year)) years.add(year);
      });
      return Array.from(years).sort((a, b) => a - b);
    }

    // Waste: Extract years from wasteData
    if (siteCategory === 'WASTE' && selectedSite.wasteData) {
      return [...new Set(selectedSite.wasteData.map(d => d.year))].sort((a, b) => a - b);
    }

    // Sewage: Extract years from sewageData
    if (siteCategory === 'SEWAGE' && selectedSite.sewageData) {
      return [...new Set(selectedSite.sewageData.map(d => d.year))].sort((a, b) => a - b);
    }

    // Plantation/Restoration/Community: Use yearly metrics
    return allYearlyMetrics.map((m) => m.year).sort((a, b) => a - b);
  }, [selectedSite, allYearlyMetrics]);

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
        console.log('[useDashboard] Fetching boundaries...');
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
          console.log('[useDashboard] Loaded', siteBoundaries.length, 'boundaries');
          
          // Additional safety filter: only include boundaries where site exists and is not deleted
          const validBoundaries = siteBoundaries.filter(b => {
            if (!b.site) {
              console.warn(`[useDashboard] Boundary ${b.id} has no site data, filtering out`);
              return false;
            }
            // Check if site is soft-deleted (deletedAt is set)
            if (b.site.deletedAt) {
              console.warn(`[useDashboard] Filtering out boundary for deleted site ${b.siteId}`);
              return false;
            }
            return true;
          });
          
          console.log('[useDashboard] After filtering:', validBoundaries.length, 'valid boundaries');
          setBoundaries(validBoundaries);
        }
      } catch (err) {
        console.error("Failed to load boundaries:", err);
      } finally {
        setLoading((prev) => ({ ...prev, boundaries: false }));
      }
    }

    loadBoundaries();
  }, [boundariesRefreshKey]); // Re-run when boundariesRefreshKey changes

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

        // Load species first (gracefully handle if endpoint doesn't exist)
        let siteSpecies: SiteSpecies[] = [];
        try {
          console.log('Fetching species for site:', filters.siteId);
          siteSpecies = await getSiteSpecies(filters.siteId!);
          console.log('Species data received:', siteSpecies);
          setSpecies(siteSpecies);
        } catch (speciesError) {
          console.error("Failed to load species:", speciesError);
          setSpecies([]);
        }

        // Load photos for the site (EVENT and SITE categories)
        const sitePhotos = await getPhotos({ siteId: filters.siteId! });
        console.log('Site photos fetched from API:', sitePhotos);

        // Load photos for each species assigned to this site
        const speciesIds = siteSpecies
          .map(ss => ss.species?.id)
          .filter((id): id is number => id !== undefined && id !== null);

        console.log('Fetching photos for species IDs:', speciesIds);

        const speciesPhotosPromises = speciesIds.map(id =>
          getPhotos({ speciesId: id, category: 'SPECIES' })
        );
        const speciesPhotosArrays = await Promise.all(speciesPhotosPromises);
        const allSpeciesPhotos = speciesPhotosArrays.flat();

        console.log('Species photos fetched:', allSpeciesPhotos);

        // Combine site photos and species photos
        const allPhotos = [...sitePhotos, ...allSpeciesPhotos];
        console.log('Total photos (site + species):', allPhotos.length);
        setPhotos(allPhotos);

        setError(null);
      } catch (err: any) {
        console.error("Failed to load site data:", err);
        
        // Check if this is a "not found" error (likely soft-deleted site)
        if (err?.message?.includes('not found') || err?.message?.includes('Site with ID')) {
          console.warn(`Site ${filters.siteId} not found (possibly soft-deleted). Clearing selection.`);
          setError(`Site not found. It may have been deleted.`);
          
          // Clear the site selection to prevent repeated errors
          setFilters((prev) => ({ ...prev, siteId: null }));
        } else {
          setError("Failed to load site details");
        }
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

  // Auto-select the latest year when availableYears changes
  useEffect(() => {
    if (availableYears.length > 0) {
      const latestYear = availableYears[availableYears.length - 1];
      // Only update if selectedYear is null or not in the available years
      if (selectedYear === null || !availableYears.includes(selectedYear)) {
        setSelectedYear(latestYear);
      }
    } else {
      setSelectedYear(null);
    }
  }, [availableYears]);

  // Load category summaries when filters change
  useEffect(() => {
    async function loadCategorySummaries() {
      try {
        setLoading((prev) => ({ ...prev, categorySummaries: true }));

        const summaryFilters: {
          organizationId?: number;
          regionId?: number;
          categoryId?: number;
        } = {};

        if (filters.organizationId !== null) {
          summaryFilters.organizationId = filters.organizationId;
        }
        if (filters.regionId !== null) {
          summaryFilters.regionId = filters.regionId;
        }
        if (filters.categoryId !== null) {
          summaryFilters.categoryId = filters.categoryId;
        }

        // Only fetch if at least one filter is set
        if (Object.keys(summaryFilters).length > 0) {
          const summaries = await getCategorySummaries(summaryFilters);
          setCategorySummaries(summaries);
        } else {
          setCategorySummaries([]);
        }
      } catch (err) {
        console.error("Failed to load category summaries:", err);
        setCategorySummaries([]);
      } finally {
        setLoading((prev) => ({ ...prev, categorySummaries: false }));
      }
    }

    loadCategorySummaries();
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
    console.log('[useDashboard] Refreshing boundaries and hierarchy...');
    // Increment the refresh key to trigger boundary reload
    setBoundariesRefreshKey((prev) => prev + 1);
    
    // Reload hierarchy
    getHierarchyTree().then(setHierarchy).catch(console.error);
    
    // If a site is selected, reload its data
    if (filters.siteId) {
      getSite(filters.siteId, true)
        .then(setSelectedSite)
        .catch((err) => {
          console.error('Failed to refresh site:', err);
          // If site is deleted/not found, clear selection
          if (err?.message?.includes('not found')) {
            setFilters((prev) => ({ ...prev, siteId: null }));
          }
        });
    }
  }, [filters.siteId]);

  return {
    // State
    filters,
    hierarchy,
    selectedSite,
    yearlyMetrics,
    categorySummaries,
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
