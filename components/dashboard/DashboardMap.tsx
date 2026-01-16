"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Fill, Text } from "ol/style";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import { Zoom } from "ol/control";
import { click } from "ol/events/condition";
import Select from "ol/interaction/Select";
import "ol/ol.css";
import { Feature } from "ol";
import { Geometry } from "ol/geom";

import type { SiteBoundary } from "./types";
import { OverlayButtons, BasemapToggle } from "./MapControls";
import TimelineControl from "./TimelineControl";

interface DashboardMapProps {
  boundaries: SiteBoundary[];
  selectedSiteId: number | null;
  showVectors: boolean;
  showImagery: boolean;
  showClassified: boolean;
  baseLayer: "osm" | "satellite";
  selectedYear: number | null;
  availableYears: number[];
  baseRasterTileUrl?: string;
  classifiedRasterTileUrl?: string;
  onSiteClick?: (siteId: number) => void;
  onToggleVectors: () => void;
  onToggleImagery: () => void;
  onToggleClassified: () => void;
  onToggleBaseLayer: () => void;
  onYearChange: (year: number) => void;
  loading?: boolean;
}

export default function DashboardMap({
  boundaries,
  selectedSiteId,
  showVectors,
  showImagery,
  showClassified,
  baseLayer,
  selectedYear,
  availableYears,
  baseRasterTileUrl,
  classifiedRasterTileUrl,
  onSiteClick,
  onToggleVectors,
  onToggleImagery,
  onToggleClassified,
  onToggleBaseLayer,
  onYearChange,
  loading = false,
}: DashboardMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const vectorLayerRef = useRef<VectorLayer<Feature<Geometry>> | null>(null);
  const osmLayerRef = useRef<TileLayer<OSM> | null>(null);
  const satelliteLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const baseRasterLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const classifiedRasterLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const selectInteractionRef = useRef<Select | null>(null);

  // Ref to always have the latest onSiteClick callback (avoids stale closure)
  const onSiteClickRef = useRef(onSiteClick);
  useEffect(() => {
    onSiteClickRef.current = onSiteClick;
  }, [onSiteClick]);

  // Ref to always have the latest getVectorStyle (avoids stale closure in Select interaction)
  const getVectorStyleRef = useRef<((feature: Feature<Geometry>, selected?: boolean) => Style) | null>(null);

  // Style for vector features
  const getVectorStyle = useCallback(
    (feature: Feature<Geometry>, selected: boolean = false) => {
      const siteId = feature.get("siteId");
      const siteName = feature.get("siteName") || feature.get("name") || "";
      const isSelected = siteId === selectedSiteId || selected;
      const isSatellite = baseLayer === "satellite";

      const colors = isSatellite
        ? {
            fill: isSelected
              ? "rgba(176, 141, 75, 0.4)" // Serena Gold
              : "rgba(255, 255, 255, 0.15)", // Subtle white
            stroke: isSelected ? "#b08d4b" : "#ffffff",
            textFill: "#ffffff",
            textStroke: "#000000",
          }
        : {
            fill: isSelected
              ? "rgba(17, 94, 89, 0.5)" // Serena Green
              : "rgba(17, 94, 89, 0.2)",
            stroke: isSelected ? "#115e59" : "#0f3f3c",
            textFill: "#115e59",
            textStroke: "#ffffff",
          };

      return new Style({
        fill: new Fill({
          color: colors.fill,
        }),
        stroke: new Stroke({
          color: colors.stroke,
          width: isSelected ? 3 : 2,
          lineCap: "round",
          lineJoin: "round",
        }),
        text: new Text({
          text: siteName,
          font: "bold 11px Inter, system-ui, sans-serif",
          fill: new Fill({ color: colors.textFill }),
          stroke: new Stroke({ color: colors.textStroke, width: 3 }),
          overflow: true,
          offsetY: -12,
        }),
      });
    },
    [selectedSiteId, baseLayer]
  );

  // Keep the ref updated with the latest getVectorStyle
  useEffect(() => {
    getVectorStyleRef.current = getVectorStyle;
  }, [getVectorStyle]);

  // Initialize map (no scale, no attribution visible)
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => getVectorStyle(feature as Feature<Geometry>, false),
      zIndex: 10,
    });
    vectorLayerRef.current = vectorLayer;

    const baseRasterLayer = new TileLayer({
      source: new XYZ({ url: "" }),
      visible: false,
      opacity: 0.9,
      zIndex: 5,
    });
    baseRasterLayerRef.current = baseRasterLayer;

    const classifiedRasterLayer = new TileLayer({
      source: new XYZ({ url: "" }),
      visible: false,
      opacity: 0.85,
      zIndex: 6,
    });
    classifiedRasterLayerRef.current = classifiedRasterLayer;

    const osmLayer = new TileLayer({
      source: new OSM(),
      zIndex: 0,
      visible: true,
    });
    osmLayerRef.current = osmLayer;

    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        maxZoom: 20,
        crossOrigin: "anonymous",
      }),
      zIndex: 0,
      visible: false,
    });
    satelliteLayerRef.current = satelliteLayer;

    const map = new Map({
      target: mapContainer.current,
      layers: [
        osmLayer,
        satelliteLayer,
        baseRasterLayer,
        classifiedRasterLayer,
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([73.0, 33.5]),
        zoom: 6,
        minZoom: 4,
        maxZoom: 19,
      }),
      controls: defaultControls({ attribution: false, zoom: false }).extend([
        new Zoom({ className: "ol-zoom custom-zoom" }),
      ]),
    });
    mapRef.current = map;

    const selectInteraction = new Select({
      condition: click,
      layers: [vectorLayer],
      // Use ref to always get the latest style function (avoids stale closure)
      style: (feature) => getVectorStyleRef.current?.(feature as Feature<Geometry>, true) || undefined,
    });
    selectInteractionRef.current = selectInteraction;
    map.addInteraction(selectInteraction);

    selectInteraction.on("select", (e) => {
      if (e.selected.length > 0) {
        const feature = e.selected[0];
        const siteId = feature.get("siteId");
        if (siteId && onSiteClickRef.current) {
          onSiteClickRef.current(siteId);
        }
      }
    });

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  // Update styles when selection or base layer changes
  useEffect(() => {
    if (vectorLayerRef.current) {
      vectorLayerRef.current.setStyle((feature) =>
        getVectorStyle(feature as Feature<Geometry>, false)
      );
      // Force re-render to ensure text labels are displayed correctly
      vectorLayerRef.current.changed();
    }
    if (selectInteractionRef.current) {
      // Clear selected features so they re-render with updated layer style
      // The Select interaction's style uses getVectorStyleRef which is already updated
      selectInteractionRef.current.getFeatures().clear();
    }
  }, [selectedSiteId, baseLayer, getVectorStyle]);

  useEffect(() => {
    if (!vectorLayerRef.current) return;

    const source = vectorLayerRef.current.getSource();
    if (!source) return;

    // Always update the layer style before modifying features
    vectorLayerRef.current.setStyle((feature) =>
      getVectorStyle(feature as Feature<Geometry>, false)
    );

    source.clear();

    if (boundaries.length === 0) {
      vectorLayerRef.current.changed();
      return;
    }

    try {
      const features: Feature<Geometry>[] = [];

      boundaries.forEach((boundary) => {
        if (!boundary.geometry) return;

        let geometry: any = boundary.geometry;

        if (
          geometry.type === "FeatureCollection" &&
          geometry.features?.length > 0
        ) {
          geometry = geometry.features[0].geometry;
        }

        if (geometry.type === "Feature" && geometry.geometry) {
          geometry = geometry.geometry;
        }

        if (!geometry.type || !geometry.coordinates) return;

        const geojsonFeature = {
          type: "Feature" as const,
          geometry,
          properties: {
            id: boundary.id,
            siteId: boundary.siteId,
            year: boundary.year,
            siteName: boundary.site?.name || "",
            ...boundary.properties,
          },
        };

        const olFeatures = new GeoJSON().readFeatures(
          { type: "FeatureCollection", features: [geojsonFeature] },
          { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" }
        );

        features.push(...(olFeatures as Feature<Geometry>[]));
      });

      source.addFeatures(features);

      if (features.length > 0 && mapRef.current) {
        const extent = source.getExtent();
        mapRef.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          maxZoom: 16,
          duration: 500,
        });
      }

      // Force layer re-render to ensure text labels are displayed correctly
      // This is needed after adding features, especially when styles have been updated
      vectorLayerRef.current.changed();
    } catch (error) {
      console.error("[DashboardMap] Error adding boundaries:", error);
    }
  }, [boundaries, getVectorStyle]);

  useEffect(() => {
    if (vectorLayerRef.current) {
      vectorLayerRef.current.setVisible(showVectors);
    }
  }, [showVectors]);

  useEffect(() => {
    if (osmLayerRef.current && satelliteLayerRef.current) {
      osmLayerRef.current.setVisible(baseLayer === "osm");
      satelliteLayerRef.current.setVisible(baseLayer === "satellite");
    }
  }, [baseLayer]);

  useEffect(() => {
    if (!baseRasterLayerRef.current) return;

    if (baseRasterTileUrl && showImagery) {
      baseRasterLayerRef.current.setSource(
        new XYZ({
          url: baseRasterTileUrl,
          crossOrigin: "anonymous",
        })
      );
      baseRasterLayerRef.current.setVisible(true);
    } else {
      baseRasterLayerRef.current.setVisible(false);
    }
  }, [baseRasterTileUrl, showImagery]);

  useEffect(() => {
    if (!classifiedRasterLayerRef.current) return;

    if (classifiedRasterTileUrl && showClassified) {
      classifiedRasterLayerRef.current.setSource(
        new XYZ({
          url: classifiedRasterTileUrl,
          crossOrigin: "anonymous",
        })
      );
      classifiedRasterLayerRef.current.setVisible(true);
    } else {
      classifiedRasterLayerRef.current.setVisible(false);
    }
  }, [classifiedRasterTileUrl, showClassified]);

  const singleSiteSelected = selectedSiteId !== null;

  return (
    <div className="relative w-full h-[65vh] min-h-[450px] bg-stone-100 rounded-xl overflow-hidden shadow-lg border border-stone-200">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-lg border border-stone-200">
            <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span className="text-sm font-medium text-stone-600">
              Loading...
            </span>
          </div>
        </div>
      )}

      {/* Overlay buttons - top right */}
      <div className="absolute top-4 right-4 z-10">
        <OverlayButtons
          showVectors={showVectors}
          showImagery={showImagery}
          showClassified={showClassified}
          onToggleVectors={onToggleVectors}
          onToggleImagery={onToggleImagery}
          onToggleClassified={onToggleClassified}
          singleSiteSelected={singleSiteSelected}
          loading={loading}
        />
      </div>

      {/* Basemap toggle - fixed position under zoom controls */}
      <div className="absolute top-28 left-4 z-10">
        <BasemapToggle baseLayer={baseLayer} onToggleBaseLayer={onToggleBaseLayer} />
      </div>

      {/* Year selector - bottom center */}
      {singleSiteSelected && availableYears.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <TimelineControl
            years={availableYears}
            selectedYear={selectedYear}
            onChange={onYearChange}
            disabled={loading}
            loading={loading}
          />
        </div>
      )}

      {/* Legend - bottom right */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 px-3 py-2.5">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
            Legend
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-3 rounded-sm border-2"
                style={{
                  backgroundColor:
                    baseLayer === "satellite"
                      ? "rgba(6, 182, 212, 0.25)"
                      : "rgba(16, 185, 129, 0.2)",
                  borderColor:
                    baseLayer === "satellite" ? "#06b6d4" : "#059669",
                }}
              />
              <span className="text-xs text-stone-600">Site</span>
            </div>
            {selectedSiteId && (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-3 rounded-sm border-2"
                  style={{
                    backgroundColor:
                      baseLayer === "satellite"
                        ? "rgba(251, 191, 36, 0.35)"
                        : "rgba(16, 185, 129, 0.4)",
                    borderColor:
                      baseLayer === "satellite" ? "#fbbf24" : "#10b981",
                  }}
                />
                <span className="text-xs text-stone-600">Selected</span>
              </div>
            )}
            {showClassified && (
              <>
                <div className="h-px bg-stone-200 my-1.5" />
                <div className="text-[10px] font-medium text-stone-500 mb-1">
                  Classification
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {[
                    { color: "#006e33", label: "Tree Canopy" },
                    { color: "#996000", label: "Wet Land" },
                    { color: "#f5deb3", label: "Barren Land" },
                    { color: "#009a17", label: "Green Area" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[10px] text-stone-500">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom zoom styles - light theme */}
      <style jsx global>{`
        .ol-scale-line {
          display: none !important;
        }
        .custom-zoom {
          position: absolute;
          top: 16px;
          left: 16px;
          right: auto;
          bottom: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .custom-zoom button {
          background: white;
          border: 1px solid #e7e5e4;
          border-radius: 10px;
          width: 40px;
          height: 40px;
          font-size: 20px;
          color: #57534e;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .custom-zoom button:hover {
          background: #f0fdf4;
          border-color: #10b981;
          color: #059669;
        }
        .custom-zoom button:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
