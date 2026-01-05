"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastProvider, useToast } from "@/components/ToastContext";
import { ToastList } from "@/components/ToastList";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HierarchySkeleton } from "@/components/Skeletons/HierarchySkeleton";
import * as turf from "@turf/turf";
import { useHierarchy } from "@/components/vector-draw/useHierarchy";
import { HierarchySite, BoundaryResponse, RasterResponse } from "@/components/vector-draw/types";
import { VectorDrawSidebar } from "@/components/vector-draw/Sidebar";
import { MapPanel } from "@/components/vector-draw/MapPanel";
import { CreateHierarchyModal } from "@/components/vector-draw/CreateHierarchyModal";
import { CreateSiteModal } from "@/components/vector-draw/CreateSiteModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

type CreateLevel = "org" | "region" | "category" | "subCategory" | null;
type SiteContext = { categoryId: number | null; subCategoryId: number | null };

export default function VectorDrawPage() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ToastListWrapper />
        <VectorDrawPageInner />
      </ToastProvider>
    </ErrorBoundary>
  );
}

function ToastListWrapper() {
  const { toasts } = useToast();
  return <ToastList toasts={toasts} />;
}

function VectorDrawPageInner() {
  // Debug: Track component lifecycle
  useEffect(() => {
    console.log("[VECTOR_DRAW_PAGE] ========== PAGE MOUNTED ==========");
    console.log("[VECTOR_DRAW_PAGE] Window location:", window.location.href);
    return () => {
      console.log("[VECTOR_DRAW_PAGE] ========== PAGE UNMOUNTING ==========");
    };
  }, []);

  const { showToast } = useToast();
  const {
    sites,
    orgs,
    regionsByOrg,
    categoriesByRegion,
    subCatsByCategory,
    sitesByCategory,
    sitesBySubCategory,
    refresh: refreshHierarchy,
    loading: hierarchyLoading,
    error: hierarchyError,
  } = useHierarchy();

  // Selection state
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Modal state
  const [createLevel, setCreateLevel] = useState<CreateLevel>(null);
  const [createSiteModalOpen, setCreateSiteModalOpen] = useState(false);

  // Drawing state
  const [polygonData, setPolygonData] = useState<any>(null);
  const [uploadedGeoJSON, setUploadedGeoJSON] = useState<any>(null);

  // Map state
  const mapRef = useRef<any>(null);
  const drawRef = useRef<any>(null);
  const [vectorFeatures, setVectorFeatures] = useState<BoundaryResponse[]>([]);
  const [existingVectorId, setExistingVectorId] = useState<string | null>(null);
  const [rasterFootprints, setRasterFootprints] = useState<RasterResponse[]>([]);
  const [showVectors, setShowVectors] = useState(true);
  const [showRasters, setShowRasters] = useState(true);
  const [rasterOpacity, setRasterOpacity] = useState(0.35);
  const [loadingLayers, setLoadingLayers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Log hierarchy data when it changes
  useEffect(() => {
    console.log("[HIERARCHY_DATA] Hierarchy state changed:");
    console.log("[HIERARCHY_DATA] - Sites loaded:", sites.length);
    console.log("[HIERARCHY_DATA] - Orgs loaded:", orgs.length);
    console.log("[HIERARCHY_DATA] - Hierarchy loading:", hierarchyLoading);
    console.log("[HIERARCHY_DATA] - Hierarchy error:", hierarchyError);
    if (sites.length > 0) {
      console.log("[HIERARCHY_DATA] - First 3 sites:", sites.slice(0, 3).map(s => ({ id: s.id, name: s.name })));
    }
    const catSummary = Object.entries(sitesByCategory).map(([catId, catSites]) => `cat${catId}:${catSites.length}sites`).join(", ");
    console.log("[HIERARCHY_DATA] - Sites by category:", catSummary || "none");
  }, [sites, orgs, hierarchyLoading, hierarchyError, sitesByCategory]);

  const selectedSite = useMemo(() => sites.find((s) => s.id === selectedSiteId) || null, [sites, selectedSiteId]);

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => y - i).sort((a, b) => a - b);
  }, []);

  // Called by Sidebar after an upload is saved to the API
  const handleUploadSaved = useCallback((saved: any) => {
    console.log('[UPLOAD_SAVED] Received saved boundary from Sidebar:', saved);
    setVectorFeatures((prev) => {
      const toAdd = Array.isArray(saved) ? saved : [saved];
      const merged = [...prev];
      for (const item of toAdd) {
        const exists = merged.find((m) => m.id === item.id);
        if (exists) {
          // replace
          for (let i = 0; i < merged.length; i++) if (merged[i].id === item.id) merged[i] = item;
        } else {
          merged.push(item);
        }
      }
      console.log('[UPLOAD_SAVED] vectorFeatures now has', merged.length, 'items');
      return merged;
    });
  }, []);

  // Get sites that DO NOT have boundaries for the selected year
  const availableSitesForUpload = useMemo(() => {
    console.log("[FILTER] All sites count:", sites.length);
    console.log("[FILTER] Vector features (boundaries) count:", vectorFeatures.length);
    console.log("[FILTER] Current year:", year);

    // Sites without boundaries for this year
    const filtered = sites.filter((site) => {
      const hasBoundary = vectorFeatures.some((vf) => vf.siteId === site.id);
      console.log(`[FILTER] Site ${site.id} (${site.name}): hasBoundary=${hasBoundary}`);
      return !hasBoundary;
    });

    console.log("[FILTER] Available sites (no boundary):", filtered.length, filtered.map(s => s.id));
    return filtered;
  }, [sites, vectorFeatures, year]);

  // Sites that have boundaries for this year (disabled in selector)
  const siteIdsWithBoundaries = useMemo(() => {
    const disabled = new Set(vectorFeatures.map((vf) => vf.siteId));
    console.log("[DISABLED] Sites with boundaries:", Array.from(disabled));
    return disabled;
  }, [vectorFeatures]);

  // Fetch features for selected site and year
  useEffect(() => {
    if (!selectedSiteId) {
      console.log("[FETCH] No site selected, clearing features");
      setVectorFeatures([]);
      setRasterFootprints([]);
      return;
    }

    const loadFeatures = async () => {
      setLoadingLayers(true);
      try {
        const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
        const boundariesUrl = `${API_BASE}/vectors?siteId=${selectedSiteId}&year=${year}`;
        const rastersUrl = `${API_BASE}/rasters?siteId=${selectedSiteId}&year=${year}`;

        console.log("[FETCH] Loading features for site:", selectedSiteId, "year:", year);
        console.log("[FETCH] Vectors URL:", boundariesUrl);
        console.log("[FETCH] Rasters URL:", rastersUrl);

        const [boundRes, rasterRes] = await Promise.all([
          fetch(boundariesUrl, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(rastersUrl, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("[FETCH] Vectors response status:", boundRes.status, boundRes.statusText);
        console.log("[FETCH] Rasters response status:", rasterRes.status, rasterRes.statusText);

        // Note: We no longer load existing vectors into the blue editing layer
        // All saved vectors are shown in the yellow background layer
        // The blue layer is only for active drawing
        if (boundRes.ok) {
          const data = await boundRes.json();
          console.log("[FETCH] Vectors data received (not loading to blue layer):", data);
          // Store the existing vector ID for PATCH detection, but don't render in blue layer
          const vectorsArray = Array.isArray(data) ? data : [];
          if (vectorsArray.length > 0) {
            setExistingVectorId(vectorsArray[0].id);
            console.log("[FETCH] Found existing vector ID:", vectorsArray[0].id);
          } else {
            setExistingVectorId(null);
          }
          // Keep vectorFeatures empty so blue layer stays clear
          setVectorFeatures([]);
        } else {
          const errText = await boundRes.text();
          console.error("[FETCH] Vectors error response:", errText);
          setVectorFeatures([]);
          setExistingVectorId(null);
        }

        if (rasterRes.ok) {
          const data = await rasterRes.json();
          console.log("[FETCH] Rasters data received:", data);
          setRasterFootprints(Array.isArray(data) ? data : []);
        } else {
          const errText = await rasterRes.text();
          console.error("[FETCH] Rasters error response:", errText);
          setRasterFootprints([]);
        }
      } catch (err) {
        console.error("[FETCH] Error loading features:", err);
      } finally {
        setLoadingLayers(false);
      }
    };

    loadFeatures();
  }, [selectedSiteId, year]);

  const handleHierarchyChange = useCallback(
    (level: "org" | "region" | "category" | "subCategory" | "site", id: number | null) => {
      console.log("[HIERARCHY_CHANGE]", level, "=>", id);
      if (level === "org") setSelectedOrgId(id);
      if (level === "region") setSelectedRegionId(id);
      if (level === "category") setSelectedCategoryId(id);
      if (level === "subCategory") setSelectedSubCategoryId(id);
      if (level === "site") {
        console.log("[SITE_SELECTED]", id);
        setSelectedSiteId(id);
      }
    },
    []
  );

  const handleCreate = (level: CreateLevel | "site") => {
    if (level === "site") {
      setCreateSiteModalOpen(true);
    } else if (level) {
      setCreateLevel(level);
    }
  };

  const handleHierarchyCreated = async (payload: { level: CreateLevel; id: number; name: string }) => {
    setCreateLevel(null);

    // Refresh hierarchy
    await refreshHierarchy();

    // Auto-select the newly created item
    if (payload.level === "org") setSelectedOrgId(payload.id);
    else if (payload.level === "region") setSelectedRegionId(payload.id);
    else if (payload.level === "category") setSelectedCategoryId(payload.id);
    else if (payload.level === "subCategory") setSelectedSubCategoryId(payload.id);

    showToast(`${payload.name} created successfully!`, "success");
  };

  const handleSiteCreated = async (site: HierarchySite) => {
    console.log("[SITE_CREATED_CALLBACK] Received site:", site);
    setCreateSiteModalOpen(false);

    // Refresh hierarchy
    console.log("[SITE_CREATED_CALLBACK] Starting hierarchy refresh...");
    try {
      await refreshHierarchy();
      console.log("[SITE_CREATED_CALLBACK] Hierarchy refreshed successfully");
    } catch (err) {
      console.error("[SITE_CREATED_CALLBACK] Error refreshing hierarchy:", err);
    }

    // Auto-select the newly created site
    console.log("[SITE_CREATED_CALLBACK] Selecting newly created site:", site.id);
    setSelectedSiteId(site.id);

    showToast(`${site.name} created successfully!`, "success");
  };

  const handleSave = useCallback(async () => {
    if (!polygonData || !selectedSiteId || selectedCategoryId === null) return;

    setSaving(true);
    setStatus(null);
    try {
      const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

      // If there is already a boundary for this site/year, PATCH the existing one
      if (existingVectorId) {
        console.log("[SAVE] Existing boundary found, updating id:", existingVectorId);
        const res = await fetch(`${API_BASE}/vectors/${existingVectorId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ geometry: polygonData.feature.geometry, properties: { source: "drawing" } }),
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Failed to update boundary");
        }
        const updated = await res.json();
        console.log("[SAVE] Boundary updated:", updated);

        // Refresh the yellow background layer to show the updated polygon
        console.log("[SAVE] Refreshing background layer after update...");
        if (drawRef.current?.refreshBackgroundLayer) {
          try {
            await drawRef.current.refreshBackgroundLayer();
            console.log("[SAVE] Background layer refreshed successfully");
          } catch (error) {
            console.error("[SAVE] Error refreshing background layer:", error);
          }
        }

        // Clear the blue drawing layer since polygon is now in yellow background
        console.log("[SAVE] Clearing blue drawing layer after update");
        drawRef.current?.deleteAll?.();
        setVectorFeatures([]);
        // Keep the existing ID since we just updated it
        setExistingVectorId(updated.id);
      } else {
        console.log("[SAVE] No existing boundary, creating new one. POST URL:", `${API_BASE}/vectors`);
        const res = await fetch(`${API_BASE}/vectors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            siteId: selectedSiteId,
            year,
            geometry: polygonData.feature.geometry,
            properties: { source: "drawing" },
          }),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || "Failed to save");
        }
        const created = await res.json();
        console.log("[SAVE] Boundary saved:", created);
        // Store the new vector ID for future updates
        const createdId = Array.isArray(created) ? created[0]?.id : created.id;
        if (createdId) {
          setExistingVectorId(createdId);
          console.log("[SAVE] Stored new vector ID:", createdId);
        }
      }

      // Refresh the yellow background layer to show the newly saved polygon
      console.log("[SAVE] Refreshing background layer...");
      if (drawRef.current?.refreshBackgroundLayer) {
        try {
          await drawRef.current.refreshBackgroundLayer();
          console.log("[SAVE] Background layer refreshed successfully");
        } catch (error) {
          console.error("[SAVE] Error refreshing background layer:", error);
        }
      }

      // Clear the blue drawing layer since polygon is now in yellow background
      console.log("[SAVE] Clearing blue drawing layer and vectorFeatures");
      drawRef.current?.deleteAll?.();
      setVectorFeatures([]);

      // Clear drawing state
      setPolygonData(null);
      setStatus(null);
      showToast("Boundary saved successfully!", "success");

      // Auto-select next available site
      const nextAvailableSite = sites.find(
        (s) => s.id !== selectedSiteId && !siteIdsWithBoundaries.has(s.id)
      );
      if (nextAvailableSite) {
        console.log("[SAVE] Auto-selecting next site:", nextAvailableSite.id);
        setSelectedSiteId(nextAvailableSite.id);
      } else {
        console.log("[SAVE] No more available sites");
        setSelectedSiteId(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error saving boundary";
      // Provide extra hint for network errors
      if (err instanceof TypeError && /failed to fetch/i.test(err.message)) {
        const hint = "Network error: could not reach the API. Is the backend running at the configured API URL?";
        setStatus(hint + " — " + msg);
        showToast(hint, "error");
        console.error("[SAVE] Network error (Failed to fetch). Check backend server. Error:", err);
      } else {
        setStatus(msg);
        showToast(msg, "error");
        console.error("[SAVE] Error:", err);
      }
    } finally {
      setSaving(false);
    }
  }, [polygonData, selectedSiteId, selectedCategoryId, year, showToast, sites, siteIdsWithBoundaries]);

  const handleUploadSuccess = useCallback((geojson: any) => {
    setUploadedGeoJSON(geojson);
    console.log("[UPLOAD] GeoJSON loaded on map:", geojson);

    // Also set polygonData so Save button enables
    // Use the first feature as the boundary polygon and compute areas
    if (geojson.features && geojson.features.length > 0) {
      const firstFeature = geojson.features[0];
      console.log("[UPLOAD] Setting polygonData from uploaded file, feature type:", firstFeature.geometry?.type);

      // Compute area in square meters using turf (geojson must be in lon/lat)
      let areaSqMeters = 0;
      try {
        areaSqMeters = turf.area(firstFeature as any) || 0;
      } catch (e) {
        console.warn('[UPLOAD] Failed to compute area for uploaded feature:', e);
        areaSqMeters = 0;
      }

      const areaAcres = areaSqMeters / 4046.8564224;

      setPolygonData({
        feature: firstFeature,
        areaSqMeters,
        areaAcres,
        source: "upload",
      });

      // Zoom map to uploaded feature if map is ready
      try {
        const bbox = turf.bbox(firstFeature as any); // [minX, minY, maxX, maxY] in lon/lat
        const olProj = require('ol/proj');
        const min = olProj.fromLonLat([bbox[0], bbox[1]]);
        const max = olProj.fromLonLat([bbox[2], bbox[3]]);
        const extent = [min[0], min[1], max[0], max[1]];
        if (mapRef.current) {
          mapRef.current.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 400 });
        }
      } catch (e) {
        console.warn('[UPLOAD] Failed to fit view to uploaded feature:', e);
      }
      // Also add uploaded features to the draw vector source so they are visible and editable
      try {
        if (drawRef.current?.getSource) {
          const GeoJSONFmt = require('ol/format/GeoJSON');
          const geojsonFmt = new GeoJSONFmt();
          const features = geojsonFmt.readFeatures(
            {
              type: 'FeatureCollection',
              features: geojson.features,
            },
            { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' }
          );
          const src = drawRef.current.getSource();
          if (src) {
            src.clear();
            src.addFeatures(features as any);
          }
        }
      } catch (e) {
        console.warn('[UPLOAD] Failed to add uploaded features to draw source:', e);
      }
    }
  }, []);

  const handleClearUpload = useCallback(() => {
    setUploadedGeoJSON(null);
  }, []);

  const handleFitView = useCallback(() => {
    if (!mapRef.current || !polygonData) return;
    const bbox = turf.bbox(polygonData.feature);
    const view = mapRef.current.getView();
    const extent = [bbox[0], bbox[1], bbox[2], bbox[3]];
    view.fit(extent, { padding: [50, 50, 50, 50] });
  }, [polygonData]);

  const handleClearDrawing = useCallback(() => {
    setPolygonData(null);
    if (drawRef.current?.deleteAll) drawRef.current.deleteAll();
  }, []);

  const handleMapReady = useCallback((map: any, draw: any) => {
    mapRef.current = map;
    drawRef.current = draw;
  }, []);

  console.log("[PAGE_RENDER] Page component rendering with state:", {
    selectedSiteId,
    year,
    vectorFeaturesCount: vectorFeatures.length,
    rasterFootprintsCount: rasterFootprints.length,
    loadingLayers,
    hierarchyLoading,
  });

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      {hierarchyLoading ? (
        <aside className="w-96 border-r border-gray-200 bg-white p-4 space-y-4 overflow-y-auto min-h-0 max-h-full">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <HierarchySkeleton />
        </aside>
      ) : (
        <VectorDrawSidebar
          orgs={orgs}
          regionsByOrg={regionsByOrg}
          categoriesByRegion={categoriesByRegion}
          subCatsByCategory={subCatsByCategory}
          sitesByCategory={sitesByCategory}
          sitesBySubCategory={sitesBySubCategory}
          selectedOrgId={selectedOrgId}
          selectedRegionId={selectedRegionId}
          selectedCategoryId={selectedCategoryId}
          selectedSubCategoryId={selectedSubCategoryId}
          selectedSiteId={selectedSiteId}
          onHierarchyChange={handleHierarchyChange}
          loadingHierarchy={hierarchyLoading}
          onCreate={handleCreate}
          year={year}
          onYearChange={setYear}
          selectedSite={selectedSite}
          polygonData={polygonData}
          onSave={handleSave}
          saving={saving}
          onFitView={handleFitView}
          onClearDrawing={handleClearDrawing}
          onUploadSuccess={handleUploadSuccess}
          onClearUpload={handleClearUpload}
          onUploadSaved={handleUploadSaved}
          status={status}
          years={years}
          disabledSiteIds={siteIdsWithBoundaries}
        />
      )}

      <MapPanel
        polygonData={polygonData}
        setPolygonData={setPolygonData}
        onMapReady={handleMapReady}
        vectorFeatures={vectorFeatures}
        rasterFootprints={rasterFootprints}
        showVectors={showVectors}
        showRasters={showRasters}
        rasterOpacity={rasterOpacity}
        loadingLayers={loadingLayers}
        mapRef={mapRef}
        drawRef={drawRef}
        selectedSiteId={selectedSiteId}
      />

      <CreateHierarchyModal
        level={createLevel}
        context={{
          orgId: selectedOrgId,
          regionId: selectedRegionId,
          categoryId: selectedCategoryId,
        }}
        onClose={() => setCreateLevel(null)}
        onCreated={handleHierarchyCreated}
      />

      <CreateSiteModal
        open={createSiteModalOpen}
        context={{
          categoryId: selectedCategoryId,
          subCategoryId: selectedSubCategoryId,
        }}
        onClose={() => setCreateSiteModalOpen(false)}
        onCreated={handleSiteCreated}
      />
    </div>
  );
}
