"use client";

import { BoundaryWorkspace } from "./BoundaryWorkspace";

type MapPanelProps = {
  polygonData: any;
  setPolygonData: (data: any) => void;
  onMapReady: (map: any, draw: any) => void;
  vectorFeatures: any[];
  rasterFootprints: any[];
  showVectors: boolean;
  showRasters: boolean;
  rasterOpacity: number;  
  loadingLayers: boolean;
  mapRef: any;
  drawRef: any;
  selectedSiteId: number | null;
};

export function MapPanel({
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
}: MapPanelProps) {
  return (
    <div className="flex-1 min-h-0 flex overflow-hidden h-full">
      <BoundaryWorkspace
        polygonData={polygonData}
        setPolygonData={setPolygonData}
        onMapReady={onMapReady}
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
    </div>
  );
}
