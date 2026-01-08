"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Ruler,
  Building2,
  Trees,
  Calendar,
  ExternalLink,
  X,
  Leaf,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import type { Site, YearlyMetrics, SiteSpecies, Photo } from "./types";
import { formatNumber, formatArea } from "@/lib/api/dashboardApi";
import { getCategoryColor } from "./utils/colorPalettes";

interface SiteDetailsPanelProps {
  site: Site | null;
  metrics: YearlyMetrics | null;
  species: SiteSpecies[];
  photos: Photo[];
  loading?: boolean;
  onClose?: () => void;
}

// Species card component
function SpeciesCard({ siteSpecies, speciesPhotos }: { siteSpecies: SiteSpecies; speciesPhotos: Photo[] }) {
  const species = siteSpecies.species;
  if (!species) return null;

  // Get photos for this species
  const photos = speciesPhotos.filter(p => p.speciesId === species.id);
  const displayImage = photos[0]?.minioUrl || species.image1Url;

  // Debug logging
  console.log('SpeciesCard debug:', {
    speciesId: species.id,
    scientificName: species.scientificName,
    allSpeciesPhotos: speciesPhotos,
    filteredPhotos: photos,
    displayImage,
  });

  return (
    <div className="group relative flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#b08d4b] hover:shadow-md transition-all duration-300 cursor-pointer">
      {displayImage ? (
        <div className="relative flex-shrink-0">
          <img
            src={displayImage}
            alt={species.englishName || species.scientificName}
            className="w-16 h-16 rounded-lg object-cover ring-2 ring-gray-100 group-hover:ring-[#b08d4b]/30 transition-all"
          />
          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#115e59] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <Leaf className="w-3 h-3 text-white" />
          </div>
          {photos.length > 1 && (
            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-[#b08d4b] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-[10px] font-bold text-white">{photos.length}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-[#f8f6f1] flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-[#b08d4b]/30 transition-all">
          <Leaf className="w-8 h-8 text-[#115e59]/40" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#115e59] transition-colors leading-tight">
          {species.englishName || species.localName || species.scientificName}
        </p>
        <p className="text-xs text-gray-500 italic truncate mt-1 serif">
          {species.scientificName}
        </p>
        {siteSpecies.plantedCount && (
          <div className="flex items-center gap-2 mt-2">
            <div className="px-2 py-0.5 bg-[#f0fdf4] rounded text-[#115e59] border border-[#115e59]/10">
              <p className="text-[10px] font-bold uppercase tracking-wide">
                {formatNumber(siteSpecies.plantedCount)}
              </p>
            </div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">planted</p>
          </div>
        )}
        {/* Show additional photos as small thumbnails */}
        {photos.length > 1 && (
          <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {photos.slice(1, 4).map((photo, idx) => (
              <img
                key={idx}
                src={photo.minioUrl}
                alt={photo.caption || "Species photo"}
                className="w-8 h-8 rounded-md object-cover ring-1 ring-gray-100 hover:ring-[#b08d4b] transition-all cursor-zoom-in"
                title={photo.caption}
              />
            ))}
            {photos.length > 4 && (
              <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center ring-1 ring-green-200">
                <span className="text-[10px] font-bold text-green-700">+{photos.length - 4}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Photo thumbnail component
function PhotoThumbnail({ photo }: { photo: Photo }) {
  return (
    <div className="relative group flex-shrink-0">
      <div className="relative w-28 h-28 rounded-lg overflow-hidden ring-1 ring-gray-200 group-hover:ring-[#b08d4b] transition-all duration-300 shadow-sm hover:shadow-md">
        <img
          src={photo.minioUrl}
          alt={photo.caption || "Site photo"}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {photo.caption && (
          <div className="absolute inset-0 flex items-end p-3">
            <div className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
              <p className="text-[10px] text-white font-medium line-clamp-2 leading-tight">
                {photo.caption}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#115e59] rounded-full flex items-center justify-center border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
        <ImageIcon className="w-3 h-3 text-white" />
      </div>
    </div>
  );
}

// Skeleton loader
function DetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-3/4" />
      <div className="h-4 bg-gray-50 rounded w-1/2" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-50 rounded-xl" />
        ))}
      </div>
      <div className="h-5 bg-gray-100 rounded w-1/3 mt-6" />
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-gray-50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-300">
      <div className="p-4 bg-gray-50 rounded-full mb-4">
        <Info className="w-8 h-8 opacity-50" />
      </div>
      <p className="text-sm font-bold uppercase tracking-wide text-gray-400">No site selected</p>
      <p className="text-xs mt-2 text-center text-gray-400 max-w-[200px]">
        Click on a site in the map or select from the dropdown filters
      </p>
    </div>
  );
}

export default function SiteDetailsPanel({
  site,
  metrics,
  species,
  photos,
  loading = false,
  onClose,
}: SiteDetailsPanelProps) {
  // Debug logging
  console.log('SiteDetailsPanel rendered with:', {
    siteId: site?.id,
    siteName: site?.name,
    speciesCount: species.length,
    species: species,
  });

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-8"
      >
        <DetailsSkeleton />
      </motion.div>
    );
  }

  if (!site) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <EmptyState />
      </div>
    );
  }

  const categoryColor = site.category?.type
    ? getCategoryColor(site.category.type)
    : "#115e59";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={site.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div
          className="p-6 border-b border-gray-100 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundColor: categoryColor }}
          />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-2xl font-serif text-[#115e59] mb-1">
                {site.name}
              </h3>
              {site.category && (
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500 font-medium">
                  <span style={{ color: categoryColor }}>{site.category.name}</span>
                  {site.subCategory && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span>{site.subCategory.name}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
            {(site.district || site.city) && (
              <div className="flex items-center gap-3 p-3 bg-[#f8f6f1] rounded-lg border border-transparent hover:border-[#b08d4b]/20 transition-colors">
                <MapPin className="w-5 h-5 text-[#115e59]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Location</p>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {site.city || site.district}
                  </p>
                </div>
              </div>
            )}

            {/* Area */}
            {site.area && (
              <div className="flex items-center gap-3 p-3 bg-[#f8f6f1] rounded-lg border border-transparent hover:border-[#b08d4b]/20 transition-colors">
                <Ruler className="w-5 h-5 text-[#115e59]" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Area</p>
                  <p className="text-sm font-medium text-gray-800">
                    {formatArea(site.area)}
                  </p>
                </div>
              </div>
            )}

            {/* Coordinates */}
            {site.coordinates && (
              <div className="flex items-center gap-3 p-3 bg-[#f8f6f1] rounded-lg border border-transparent hover:border-[#b08d4b]/20 transition-colors">
                <MapPin className="w-5 h-5 text-[#115e59]" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Coordinates</p>
                  <p className="text-xs font-mono font-medium text-gray-600">
                    {site.coordinates.lat.toFixed(4)}, {site.coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            )}

            {/* Site type */}
            <div className="flex items-center gap-3 p-3 bg-[#f8f6f1] rounded-lg border border-transparent hover:border-[#b08d4b]/20 transition-colors">
              <Building2 className="w-5 h-5 text-[#115e59]" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Type</p>
                <p className="text-sm font-medium text-gray-800 capitalize">
                  {site.siteType.replace(/_/g, " ").toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Infrastructure */}
          {site.infrastructure && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#115e59] mb-3">
                Infrastructure Details
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4 leading-relaxed border border-gray-100">
                {site.infrastructure}
              </p>
            </div>
          )}

          {/* Land cover summary */}
          {metrics && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#115e59] mb-3 flex items-center gap-2">
                <Trees className="w-4 h-4" />
                Land Cover ({metrics.year})
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-[#ecfdf5] rounded-xl border border-[#d1fae5]">
                  <p className="text-xl font-bold text-[#115e59]">
                    {((metrics.treeCanopy || 0) + (metrics.greenArea || 0)).toFixed(1)}%
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#059669]">Vegetation</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xl font-bold text-amber-700">
                    {(metrics.barrenLand || 0).toFixed(1)}%
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">Barren</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xl font-bold text-blue-700">
                    {(metrics.water || 0).toFixed(1)}%
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">Water</p>
                </div>
              </div>
            </div>
          )}

          {/* Species */}
          {species.length > 0 && (
            <div className="bg-[#f0fdf4]/30 rounded-xl p-5 border border-[#115e59]/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#115e59] flex items-center gap-2">
                  Species Planted
                </h4>
                <div className="px-2.5 py-0.5 bg-[#115e59] text-white text-[10px] font-bold rounded-full">
                  {species.length} total
                </div>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                {species.slice(0, 5).map((sp) => (
                  <SpeciesCard key={sp.speciesId} siteSpecies={sp} speciesPhotos={photos.filter(p => p.category === 'SPECIES')} />
                ))}
                {species.length > 5 && (
                  <div className="text-center py-3 bg-white/50 rounded-lg border border-[#115e59]/10">
                    <p className="text-xs text-[#115e59] font-bold uppercase tracking-wide">
                      +{species.length - 5} more species
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photos */}
          {photos.filter(p => p.category !== 'SPECIES').length > 0 && (
            <div className="bg-[#eff6ff]/30 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-blue-800 flex items-center gap-2">
                  Site Imagery
                </h4>
                <div className="px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                  {photos.filter(p => p.category !== 'SPECIES').length} shots
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {photos.filter(p => p.category !== 'SPECIES').slice(0, 5).map((photo) => (
                  <PhotoThumbnail key={photo.id} photo={photo} />
                ))}
              </div>
            </div>
          )}

          {/* View full details link */}
          <a
            href={`/admin/sites/${site.id}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#115e59] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#0f3f3c] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Full Site Record
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
