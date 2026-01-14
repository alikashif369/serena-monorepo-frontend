"use client";

import React, { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { Draw, Modify, Snap } from "ol/interaction";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Fill, Text } from "ol/style";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import "ol/ol.css";
import * as turf from "@turf/turf";
import { fetchAllVectorLayers, convertToGeoJSONFeatures } from "@/lib/utils/vectorLayerService";

// Basemap definitions
export type BasemapType = "osm" | "satellite";

const BASEMAP_SOURCES: Record<BasemapType, () => OSM | XYZ> = {
  osm: () => new OSM(),
  satellite: () => new XYZ({
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    maxZoom: 20,
    attributions: "&copy; Google",
    crossOrigin: "anonymous",
  }),
};

// Polygon styles for different basemaps
export const POLYGON_STYLES = {
  osm: {
    fill: "rgba(16, 185, 129, 0.2)",      // Emerald green, 20% opacity
    stroke: "#059669",                     // Dark emerald
    selectedFill: "rgba(16, 185, 129, 0.4)",
    selectedStroke: "#10b981",
  },
  satellite: {
    fill: "rgba(6, 182, 212, 0.25)",       // Cyan, 25% opacity
    stroke: "#06b6d4",                      // Bright cyan
    selectedFill: "rgba(251, 191, 36, 0.35)",
    selectedStroke: "#fbbf24",              // Amber for selection
  },
};

interface DrawMapProps {
  onPolygonChange?: (data: any) => void;
  existingVectors?: any[];
  rasterFootprints?: any[];
  showVectors?: boolean;
  showRasters?: boolean;
  rasterOpacity?: number;
  onMapReady?: (map: Map, drawApi: any) => void;
  canDraw?: boolean;
  currentBasemap?: BasemapType;
}

export default function DrawMap({
  onPolygonChange,
  existingVectors = [],
  rasterFootprints = [],
  showVectors = true,
  showRasters = false,
  rasterOpacity = 0.35,
  onMapReady,
  canDraw = false,
  currentBasemap = "osm",
}: DrawMapProps) {
  console.log("[MAP] >>>>>> DrawMap RENDER <<<<<<");

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  // Log ref states on every render
  console.log("[MAP] Render - mapRef.current exists:", !!mapRef.current);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const rasterSourceRef = useRef<VectorSource | null>(null);
  const allPolygonsSourceRef = useRef<VectorSource | null>(null);
  const drawInteractionRef = useRef<Draw | null>(null);
  const modifyInteractionRef = useRef<Modify | null>(null);
  const snapInteractionRef = useRef<Snap | null>(null);
  const baseLayerRef = useRef<TileLayer<OSM | XYZ> | null>(null);
  const vectorLayerRef = useRef<VectorLayer<Feature<Geometry>> | null>(null);
  const allPolygonsLayerRef = useRef<VectorLayer<Feature<Geometry>> | null>(null);

  // Function to refresh background polygons (can be called externally)
  const refreshBackgroundPolygons = useRef<(() => Promise<void>) | null>(null);

  // Initial map + draw setup
  useEffect(() => {
    console.log("[MAP] ========== MAP INIT EFFECT RUNNING ==========");
    console.log("[MAP] mapContainer.current:", mapContainer.current);
    console.log("[MAP] mapRef.current:", mapRef.current);

    if (mapContainer.current) {
      const rect = mapContainer.current.getBoundingClientRect();
      console.log("[MAP] Container dimensions:", { width: rect.width, height: rect.height, top: rect.top, left: rect.left });
    }

    if (!mapContainer.current) {
      console.log("[MAP] Container NOT ready, skipping init");
      return;
    }

    if (mapRef.current) {
      console.log("[MAP] Map already exists, skipping init");
      return;
    }

    console.log("[MAP] Container ready, starting initialization");
    // Vector source for drawn polygons
    const vectorSource = new VectorSource();
    vectorSourceRef.current = vectorSource;
    console.log("[MAP] Vector source created");
    // Vector layer for drawn polygons (blue drawing layer)
    const styles = POLYGON_STYLES[currentBasemap] || POLYGON_STYLES.osm;
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({ color: styles.fill }),
        stroke: new Stroke({ color: styles.stroke, width: 2.5 }),
      }),
    });
    vectorLayerRef.current = vectorLayer;
    // Raster footprints source/layer
    const rasterSource = new VectorSource();
    rasterSourceRef.current = rasterSource;
    const rasterLayer = new VectorLayer({
      source: rasterSource,
      style: new Style({
        fill: new Fill({ color: "rgba(251, 146, 60, 0.18)" }),
        stroke: new Stroke({ color: "#ea580c", width: 1.5 }),
      }),
      visible: showRasters,
      opacity: rasterOpacity,
    });
    
    // All polygons layer (background layer for visualization - no interaction)
    const allPolygonsSource = new VectorSource();
    allPolygonsSourceRef.current = allPolygonsSource;
    const bgStyles = POLYGON_STYLES[currentBasemap] || POLYGON_STYLES.osm;
    
    // Style function for background polygons with text labels
    const getBackgroundPolygonStyle = (feature: any) => {
      const siteName = feature.get("siteName") || feature.get("name") || "";
      const isSatellite = currentBasemap === "satellite";
      
      const colors = isSatellite
        ? {
            fill: bgStyles.fill,
            stroke: bgStyles.stroke,
            textFill: "#ffffff",
            textStroke: "#000000",
          }
        : {
            fill: bgStyles.fill,
            stroke: bgStyles.stroke,
            textFill: "#1f2937",
            textStroke: "#ffffff",
          };
      
      return new Style({
        fill: new Fill({ color: colors.fill }),
        stroke: new Stroke({ 
          color: colors.stroke, 
          width: 2.5,
          lineCap: "round",
          lineJoin: "round",
        }),
        text: new Text({
          text: siteName,
          font: "600 12px Inter, system-ui, sans-serif",
          fill: new Fill({ color: colors.textFill }),
          stroke: new Stroke({ color: colors.textStroke, width: 3 }),
          overflow: true,
          offsetY: -12,
        }),
      });
    };
    
    const allPolygonsLayer = new VectorLayer({
      source: allPolygonsSource,
      style: getBackgroundPolygonStyle,
      visible: true,
      opacity: 0.8,
      properties: {
        name: 'background-polygons',
        interactive: false, // No interaction with these polygons
      },
    });
    allPolygonsLayerRef.current = allPolygonsLayer;
    
    // OSM base layer (default)
    const baseLayer = new TileLayer({
      source: BASEMAP_SOURCES.osm(),
      opacity: 1,
      zIndex: 0,
    });
    baseLayerRef.current = baseLayer;

    // Map instance - disable default zoom controls
    console.log("[MAP] Creating map with layers: base, allPolygons, raster, vector");
    const map = new Map({
      target: mapContainer.current,
      layers: [baseLayer, allPolygonsLayer, rasterLayer, vectorLayer],
      controls: defaultControls({ zoom: false, attribution: false, rotate: false }),
      view: new View({
        center: fromLonLat([73.0479, 33.6844]),
        zoom: 12,
      }),
    });
    mapRef.current = map;

    // Ensure explicit layer stacking to avoid base map being hidden
    baseLayer.setZIndex(0);
    allPolygonsLayer.setZIndex(1);
    rasterLayer.setZIndex(2);
    vectorLayer.setZIndex(3);
    console.log("[MAP] Map instance created and mounted to container");
    console.log("[MAP] Map size:", map.getSize());
    console.log("[MAP] Map layers count:", map.getLayers().getLength());
    // Draw interaction
    console.log("[MAP] Adding draw interaction");
    const draw = new Draw({
      source: vectorSource,
      type: "Polygon",
    });
    drawInteractionRef.current = draw;
    map.addInteraction(draw);
    // Modify interaction
    console.log("[MAP] Adding modify interaction");
    const modify = new Modify({ source: vectorSource });
    modifyInteractionRef.current = modify;
    map.addInteraction(modify);
    // Snap interaction
    console.log("[MAP] Adding snap interaction");
    const snap = new Snap({ source: vectorSource });
    snapInteractionRef.current = snap;
    map.addInteraction(snap);
    console.log("[MAP] All interactions added");
    // Respect canDraw flag so drawing is disabled until allowed
    draw.setActive(!!canDraw);
    modify.setActive(!!canDraw);
    snap.setActive(!!canDraw);
    // On draw end, emit GeoJSON (use event.feature for reliability)
    draw.on("drawend", (evt: any) => {
      try {
        const feat = evt.feature;
        if (!feat) return;
        // Ensure GeoJSON is in EPSG:4326 for server
        const feature = new GeoJSON().writeFeatureObject(feat, {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        });
        const areaSqMeters = turf.area(feature as any);
        onPolygonChange &&
          onPolygonChange({
            feature,
            areaSqMeters,
            areaAcres: areaSqMeters / 4046.8564224,
            source: "draw",
          });
      } catch (err) {
        console.error("[MAP] Error handling drawend:", err);
      }
    });

    // On modify end, emit GeoJSON (use event features collection)
    modify.on("modifyend", (evt: any) => {
      try {
        const feats = evt.features;
        let feat = null;
        if (feats && typeof feats.getArray === 'function') {
          const arr = feats.getArray();
          feat = arr[0];
        } else if (feats && typeof feats.item === 'function') {
          feat = feats.item(0);
        }
        if (!feat) {
          // fallback: use first feature from source
          const features = vectorSource.getFeatures();
          if (features.length === 0) return;
          feat = features[0];
        }
        const feature = new GeoJSON().writeFeatureObject(feat, {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        });
        const areaSqMeters = turf.area(feature as any);
        onPolygonChange &&
          onPolygonChange({
            feature,
            areaSqMeters,
            areaAcres: areaSqMeters / 4046.8564224,
            source: "modify",
          });
      } catch (err) {
        console.error("[MAP] Error handling modifyend:", err);
      }
    });
    if (onMapReady) {
      const drawApi = {
        changeMode: (mode: string) => draw.setActive(mode === "draw_polygon"),
        trash: () => vectorSource.clear(),
        deleteAll: () => vectorSource.clear(),
        setActive: (active: boolean) => {
          draw.setActive(active);
          modify.setActive(active);
          snap.setActive(active);
        },
        getSource: () => vectorSource,
        refreshBackgroundLayer: () => {
          console.log("[MAP] External call to refresh background layer");
          if (refreshBackgroundPolygons.current) {
            return refreshBackgroundPolygons.current();
          }
          return Promise.resolve();
        },
        setBasemap: (type: BasemapType) => {
          console.log("[MAP] Switching basemap to:", type);
          if (baseLayerRef.current && BASEMAP_SOURCES[type]) {
            baseLayerRef.current.setSource(BASEMAP_SOURCES[type]());
          }
        },
      };
      onMapReady(map, drawApi);
    }
    console.log("[MAP] Map initialization complete");

    // Fix for client-side navigation: update map size after container is properly sized
    const updateMapSize = () => {
      if (mapContainer.current) {
        const rect = mapContainer.current.getBoundingClientRect();
        console.log("[MAP] updateMapSize called - Container rect:", { width: rect.width, height: rect.height });
      }
      map.updateSize();
      const size = map.getSize();
      console.log("[MAP] Map size after updateSize:", size);
      if (size && (size[0] === 0 || size[1] === 0)) {
        console.warn("[MAP] WARNING: Map has zero dimensions!");
      }
    };

    // Multiple delayed updates to handle client-side navigation timing issues
    const timeoutIds = [
      setTimeout(updateMapSize, 0),
      setTimeout(updateMapSize, 50),
      setTimeout(updateMapSize, 100),
      setTimeout(updateMapSize, 200),
      setTimeout(updateMapSize, 500),
    ];

    // ResizeObserver for container size changes
    let resizeObserver: ResizeObserver | null = null;
    if (mapContainer.current) {
      resizeObserver = new ResizeObserver(() => {
        map.updateSize();
        console.log("[MAP] ResizeObserver triggered updateSize");
      });
      resizeObserver.observe(mapContainer.current);
    }

    // Window resize listener
    window.addEventListener('resize', updateMapSize);

    // requestAnimationFrame for immediate update
    const rafId = requestAnimationFrame(updateMapSize);

    return () => {
      console.log("[MAP] ========== CLEANUP: Unmounting map ==========");
      timeoutIds.forEach(id => clearTimeout(id));
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateMapSize);
      resizeObserver?.disconnect();
      map.setTarget(undefined);
      // CRITICAL: Clear the ref so map can be re-initialized on next mount
      mapRef.current = null;
      vectorSourceRef.current = null;
      rasterSourceRef.current = null;
      allPolygonsSourceRef.current = null;
      drawInteractionRef.current = null;
      modifyInteractionRef.current = null;
      snapInteractionRef.current = null;
      baseLayerRef.current = null;
      vectorLayerRef.current = null;
      allPolygonsLayerRef.current = null;
      console.log("[MAP] All refs cleared");
    };
  }, [onPolygonChange, showVectors, showRasters, rasterOpacity]);

  // Fetch all polygons for background visualization (yellow layer)
  // Wait a bit to avoid simultaneous API calls on page load
  useEffect(() => {
    // Add delay to stagger API call and prevent rate limiting
    const loadTimer = setTimeout(() => {
      const loadBackgroundPolygons = async () => {
        console.log("[MAP] Loading background polygons for visualization...");
        
        const source = allPolygonsSourceRef.current;
        if (!source) {
          console.log("[MAP] All polygons source not ready, skipping");
          return;
        }

        // Clear existing features first
        source.clear();
        console.log("[MAP] Cleared existing background polygons");

        // Fetch all vector layers using the service
        const response = await fetchAllVectorLayers();
        
        if (!response.success) {
          // Log error but don't break the UI - gracefully degrade
          console.warn("[MAP] Could not load background polygons:", response.error);
          
          // Provide context-specific messaging
          if (response.error?.includes('unavailable') || response.error?.includes('Network error')) {
            console.warn('[MAP] Backend service is not available - map will work without background polygons');
            console.warn('[MAP] Drawing and uploading features will still work normally');
          } else if (response.error?.includes('circuit breaker')) {
            console.warn('[MAP] Service temporarily disabled - will retry automatically');
          }
          
          // Don't throw - allow map to continue functioning
          return;
        }

      console.log("[MAP] Fetched", response.data.length, "vector layers for background");

      if (response.data.length === 0) {
        console.log("[MAP] No vector layers to display");
        return;
      }

      // Convert to GeoJSON features
      const geojsonFeatures = convertToGeoJSONFeatures(response.data);
      console.log("[MAP] Converted to", geojsonFeatures.length, "GeoJSON features");

      if (geojsonFeatures.length === 0) {
        console.log("[MAP] No valid features after conversion");
        return;
      }

      try {
        // Parse and add features to the map
        const features = new GeoJSON().readFeatures(
          {
            type: "FeatureCollection",
            features: geojsonFeatures,
          },
          {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
          }
        );

        source.addFeatures(features);
        console.log("[MAP] Successfully added", features.length, "background polygons to map (yellow layer)");
        
        // Log sample feature for debugging
        if (features.length > 0) {
          const sampleFeature = features[0];
          console.log("[MAP] Sample feature properties:", sampleFeature.getProperties());
        }
      } catch (error) {
        console.error("[MAP] Error adding features to map:", error);
      }
    };

    // Store the function so it can be called externally
    refreshBackgroundPolygons.current = loadBackgroundPolygons;

    // Initial load with delay to prevent rate limiting
    loadBackgroundPolygons();
    }, 600); // 600ms delay - load after other components initialize

    // Cleanup timer
    return () => clearTimeout(loadTimer);
  }, []);

  // Update existing vectors when prop changes
  useEffect(() => {
    console.log("[MAP] existingVectors prop changed, count:", existingVectors?.length || 0);
    if (!vectorSourceRef.current) {
      console.log("[MAP] Vector source not ready, skipping update");
      return;
    }
    const source = vectorSourceRef.current;
    const prevFeatureCount = source.getFeatures().length;
    source.clear();
    console.log("[MAP] Cleared", prevFeatureCount, "existing features");
    if (existingVectors && existingVectors.length > 0) {
      try {
        // Map API response to proper GeoJSON Feature format
        // Handle both direct geometry and nested structures, and accidentally stored FeatureCollections
        const geojsonFeatures = existingVectors
          .filter((v: any) => {
            // Skip if no geometry at all
            if (!v.geometry && !v.geom) return false;
            // Skip if geometry is null or undefined
            if (v.geometry === null || v.geometry === undefined) return false;
            // Ensure geometry has a type
            const geom = v.geometry || v.geom;
            return geom && geom.type;
          })
          .map((v: any) => {
            // Extract geometry - could be direct or nested
            let geometry = v.geometry || v.geom;
            
            // Handle case where geometry is accidentally a FeatureCollection (fix for old uploads)
            if (geometry.type === 'FeatureCollection' && geometry.features && geometry.features.length > 0) {
              console.warn('[MAP] Found FeatureCollection in geometry field, extracting first feature geometry');
              geometry = geometry.features[0].geometry;
            }
            
            if (!geometry || !geometry.type) {
              console.warn("[MAP] Invalid geometry structure:", v);
              return null;
            }
            return {
              type: "Feature",
              geometry,
              properties: v.properties || { id: v.id, siteId: v.siteId, year: v.year },
            };
          })
          .filter((f: any) => f !== null);

        if (geojsonFeatures.length === 0) {
          console.log("[MAP] No valid vector features to add after filtering");
          return;
        }

        const features = new GeoJSON().readFeatures(
          {
            type: "FeatureCollection",
            features: geojsonFeatures,
          },
          {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
          }
        );
        source.addFeatures(features);
        console.log("[MAP] Added", features.length, "vector features to source");
      } catch (err) {
        console.error("[MAP] Error parsing GeoJSON vectors:", err);
        console.error("[MAP] Problematic data:", existingVectors);
      }
    } else {
      console.log("[MAP] No vector features to add");
    }
  }, [existingVectors]);

  // Update raster footprints when prop changes
  useEffect(() => {
    console.log("[MAP] rasterFootprints prop changed, count:", rasterFootprints?.length || 0);
    if (!rasterSourceRef.current) {
      console.log("[MAP] Raster source not ready, skipping update");
      return;
    }
    const source = rasterSourceRef.current;
    const prevFeatureCount = source.getFeatures().length;
    source.clear();
    console.log("[MAP] Cleared", prevFeatureCount, "existing raster features");
    if (rasterFootprints && rasterFootprints.length > 0) {
      try {
        // Map API response to proper GeoJSON Feature format
        // Handle both direct geometry and nested structures
        const geojsonFeatures = rasterFootprints
          .filter((r: any) => {
            // Skip if no geometry at all
            if (!r.geometry && !r.geom) return false;
            // Skip if geometry is null or undefined
            if (r.geometry === null || r.geometry === undefined) return false;
            // Ensure geometry has a type
            const geom = r.geometry || r.geom;
            return geom && geom.type;
          })
          .map((r: any) => {
            // Extract geometry - could be direct or nested
            const geometry = r.geometry || r.geom;
            if (!geometry || !geometry.type) {
              console.warn("[MAP] Invalid raster geometry structure:", r);
              return null;
            }
            return {
              type: "Feature",
              geometry,
              properties: r.properties || { id: r.id, siteId: r.siteId, year: r.year },
            };
          })
          .filter((f: any) => f !== null);

        if (geojsonFeatures.length === 0) {
          console.log("[MAP] No valid raster features to add after filtering");
          return;
        }

        const features = new GeoJSON().readFeatures(
          {
            type: "FeatureCollection",
            features: geojsonFeatures,
          },
          {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
          }
        );
        source.addFeatures(features);
        console.log("[MAP] Added", features.length, "raster features to source");
      } catch (err) {
        console.error("[MAP] Error parsing GeoJSON rasters:", err);
        console.error("[MAP] Problematic data:", rasterFootprints);
      }
    } else {
      console.log("[MAP] No raster features to add");
    }
  }, [rasterFootprints]);

  // Layer visibility and opacity
  useEffect(() => {
    console.log("[MAP] Layer visibility changed - vectors:", showVectors, "rasters:", showRasters, "opacity:", rasterOpacity);
    if (!mapRef.current) {
      console.log("[MAP] Map not ready, skipping layer update");
      return;
    }
    const map = mapRef.current;
    const layers = map.getLayers().getArray();
    console.log("[MAP] Total layers in map:", layers.length);

    // Base layer is index 0 - always keep visible
    if (layers[0]) {
      layers[0].setVisible(true);
      layers[0].setOpacity(1);
      console.log("[MAP] Base layer ensured visible");
    }

    // All polygons layer is index 1 - always visible for background context
    if (layers[1]) {
      layers[1].setVisible(true);
      console.log("[MAP] All polygons layer ensured visible");
    }

    // Raster layer is index 2
    if (layers[2]) {
      const rasterLayer = layers[2];
      rasterLayer.setVisible(showRasters);
      rasterLayer.setOpacity(rasterOpacity);
      console.log("[MAP] Raster layer - visible:", showRasters, "opacity:", rasterOpacity);
    }
    // Vector layer is index 3
    if (layers[3]) {
      const vectorLayer = layers[3];
      vectorLayer.setVisible(showVectors);
      console.log("[MAP] Vector layer - visible:", showVectors);
    }
  }, [showVectors, showRasters, rasterOpacity]);

  // Update polygon styles when basemap changes
  useEffect(() => {
    const styles = POLYGON_STYLES[currentBasemap] || POLYGON_STYLES.osm;
    console.log("[MAP] Updating polygon styles for basemap:", currentBasemap);

    const isSatellite = currentBasemap === "satellite";
    const textColors = isSatellite
      ? { textFill: "#ffffff", textStroke: "#000000" }
      : { textFill: "#1f2937", textStroke: "#ffffff" };

    // Update vector layer (drawing layer) style
    if (vectorLayerRef.current) {
      vectorLayerRef.current.setStyle(new Style({
        fill: new Fill({ color: styles.fill }),
        stroke: new Stroke({ color: styles.stroke, width: 2.5 }),
      }));
    }

    // Update background polygons layer style with text labels
    if (allPolygonsLayerRef.current) {
      allPolygonsLayerRef.current.setStyle((feature: any) => {
        const siteName = feature.get("siteName") || feature.get("name") || "";
        
        return new Style({
          fill: new Fill({ color: styles.fill }),
          stroke: new Stroke({ 
            color: styles.stroke, 
            width: 2.5,
            lineCap: "round",
            lineJoin: "round",
          }),
          text: new Text({
            text: siteName,
            font: "600 12px Inter, system-ui, sans-serif",
            fill: new Fill({ color: textColors.textFill }),
            stroke: new Stroke({ color: textColors.textStroke, width: 3 }),
            overflow: true,
            offsetY: -12,
          }),
        });
      });
    }
  }, [currentBasemap]);

  // Toggle drawing availability when site selection changes
  useEffect(() => {
    const draw = drawInteractionRef.current;
    const modify = modifyInteractionRef.current;
    const snap = snapInteractionRef.current;
    if (!draw || !modify || !snap) return;
    const active = !!canDraw;
    draw.setActive(active);
    modify.setActive(active);
    snap.setActive(active);
    console.log("[MAP] Drawing active state updated:", active);
  }, [canDraw]);

  return <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '400px', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />;
}