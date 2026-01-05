"use client";

import DrawMap, { BasemapType } from "../DrawMap";
import { PenLine, RefreshCw, Trash2, ZoomIn, ZoomOut, Crosshair, Loader, Map, Satellite } from "lucide-react";
import { useState } from "react";
import { useToast } from "../ToastContext";

export function BoundaryWorkspace({
  polygonData,
  setPolygonData,
  onMapReady,
  vectorFeatures,
  rasterFootprints,
  showVectors,
  showRasters,
  rasterOpacity,
  loadingLayers,
  mapRef,
  drawRef,
  selectedSiteId,
}: any) {
  const [geoLocating, setGeoLocating] = useState(false);
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>("osm");
  const { showToast } = useToast();

  const handleBasemapToggle = () => {
    const newBasemap = currentBasemap === "osm" ? "satellite" : "osm";
    setCurrentBasemap(newBasemap);
    drawRef.current?.setBasemap?.(newBasemap);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation || !mapRef.current) {
      showToast("Geolocation is not available in your browser", "error");
      return;
    }

    setGeoLocating(true);
    
    const timeoutId = setTimeout(() => {
      setGeoLocating(false);
      showToast("Geolocation timed out. Please check your browser permissions.", "error");
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId);
        setGeoLocating(false);
        
        const { longitude, latitude } = pos.coords;
        const olProj = require('ol/proj');
        
        mapRef.current.getView().animate({
          center: olProj.fromLonLat([longitude, latitude]),
          zoom: 16,
          duration: 800,
        });
        
        showToast(`Located at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, "success");
      },
      (error) => {
        clearTimeout(timeoutId);
        setGeoLocating(false);
        
        let message = "Geolocation error";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Geolocation permission denied. Enable location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your location is currently unavailable. Please try again.";
        } else if (error.code === error.TIMEOUT) {
          message = "Geolocation request timed out.";
        }
        
        showToast(message, "error");
      }
    );
  };
  return (
    <div className="flex-1 relative bg-gray-50 h-full">
      <DrawMap
        onPolygonChange={setPolygonData}
        onMapReady={onMapReady}
        existingVectors={vectorFeatures as any}
        rasterFootprints={rasterFootprints as any}
        showVectors={showVectors}
        showRasters={showRasters}
        rasterOpacity={rasterOpacity}
        canDraw={!!selectedSiteId}
        currentBasemap={currentBasemap}
      />

      {/* Map Controls - Top Right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="flex flex-col gap-1 bg-white rounded-lg shadow-lg border-2 border-gray-300 p-1">
          <button
            onClick={() => mapRef.current?.getView().setZoom(mapRef.current?.getView().getZoom() + 1)}
            className="h-8 w-8 rounded-md bg-white flex items-center justify-center hover:bg-gray-100 transition text-gray-700"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-gray-200" />
          <button
            onClick={() => mapRef.current?.getView().setZoom(mapRef.current?.getView().getZoom() - 1)}
            className="h-8 w-8 rounded-md bg-white flex items-center justify-center hover:bg-gray-100 transition text-gray-700"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Geolocation */}
        <button
          onClick={handleGeolocation}
          disabled={geoLocating}
          className="h-10 w-10 rounded-lg bg-white shadow-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
          aria-label="Geolocate"
          title={geoLocating ? "Acquiring location..." : "Center map on my location"}
        >
          {geoLocating ? (
            <Loader className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <Crosshair className="w-4 h-4" />
          )}
        </button>

        {/* Draw Polygon */}
        <button
          onClick={() => drawRef.current?.changeMode?.("draw_polygon")}
          disabled={!selectedSiteId}
          className="h-10 w-10 rounded-lg bg-blue-600 text-white shadow-lg border-2 border-blue-700 flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Draw polygon"
          title={selectedSiteId ? "Draw polygon for the selected site" : "Select a site before drawing"}
        >
          <PenLine className="w-4 h-4" />
        </button>

        {/* Clear Drawing */}
        <button
          onClick={() => {
            drawRef.current?.trash?.();
            drawRef.current?.deleteAll?.();
            setPolygonData?.(null);
          }}
          className="h-10 w-10 rounded-lg bg-white shadow-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition text-gray-700"
          aria-label="Clear drawing"
          title="Clear drawing"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Basemap Toggle */}
        <button
          onClick={handleBasemapToggle}
          className="h-10 w-10 rounded-lg bg-white shadow-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition text-gray-700"
          aria-label="Toggle basemap"
          title={currentBasemap === "osm" ? "Switch to Satellite" : "Switch to Streets"}
        >
          {currentBasemap === "osm" ? (
            <Satellite className="w-4 h-4" />
          ) : (
            <Map className="w-4 h-4" />
          )}
        </button>
      </div>

      {loadingLayers && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 text-gray-700 text-sm rounded-lg">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading...
        </div>
      )}
    </div>
  );
}
