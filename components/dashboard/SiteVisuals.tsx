"use client";

import React from "react";
import { Trees, Leaf, Camera, Calendar, ChevronLeft, ChevronRight, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { motion } from "framer-motion";

import type { SiteSpecies, Photo } from "./types";
import { formatNumber } from "@/lib/api/dashboardApi";

// Species card component
function SpeciesCarouselCard({
  siteSpecies,
  speciesPhotos,
}: {
  siteSpecies: SiteSpecies;
  speciesPhotos: Photo[];
}) {
  const species = siteSpecies.species;
  if (!species) return null;

  const photos = speciesPhotos.filter((p) => p.speciesId === species.id);
  const displayImage = photos[0]?.minioUrl || species.image1Url;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 h-[340px] flex flex-col">
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

      <div className="relative h-48 overflow-hidden">
        {displayImage ? (
          <img
            src={displayImage}
            alt={species.englishName || species.scientificName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
            <Leaf className="w-12 h-12 text-emerald-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {siteSpecies.plantedCount && (
          <div className="absolute top-3 left-3 z-30">
            <span className="inline-flex items-center bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
              {formatNumber(siteSpecies.plantedCount)} Planted
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-emerald-700 transition-colors leading-tight">
            {species.englishName || species.localName || species.scientificName}
          </h4>
          <p className="text-[11px] text-gray-400 italic truncate mt-1">
            {species.scientificName}
          </p>
          
          {/* Detailed Hover Info */}
          <div className="mt-3 space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            {species.description && (
              <p className="text-[10px] text-gray-600 line-clamp-3 leading-relaxed border-l-2 border-emerald-100 pl-2">
                {species.description}
              </p>
            )}
            {species.uses && (
              <div className="flex flex-wrap gap-1">
                {species.uses.split(',').slice(0, 3).map((use, i) => (
                   <span key={i} className="text-[9px] bg-stone-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100">
                     {use.trim()}
                   </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
           <Leaf className="w-3 h-3 text-emerald-500" />
           <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Details</span>
        </div>
      </div>
    </div>
  );
}

// Event Imagery Component
function EventImageCard({ photo }: { photo: Photo }) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md flex flex-col lg:flex-row h-auto lg:h-[300px]">
      <div className="relative w-full lg:w-2/5 h-[200px] lg:h-full overflow-hidden">
        <img
          src={photo.minioUrl}
          alt={photo.caption || "Event photo"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-1.5">
            <Camera className="w-3 h-3" />
            Field Event
          </div>
        </div>
      </div>
      
      <div className="w-full lg:w-3/5 p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
             {photo.year && (
               <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100/50 uppercase tracking-widest">
                 Recorded in {photo.year}
               </span>
             )}
             {photo.tags && photo.tags.length > 0 && (
               <div className="flex gap-2">
                 {photo.tags.slice(0, 2).map((tag, i) => (
                   <span key={i} className="text-[10px] font-medium text-gray-400">
                     #{tag}
                   </span>
                 ))}
               </div>
             )}
          </div>
          <h4 className="text-2xl font-serif font-bold text-gray-800 mb-3 group-hover:text-emerald-700 transition-colors">
            {photo.caption || "Event Highlight"}
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 lg:line-clamp-4">
            {photo.description || "Captured during conservation activities at the site. These events represent our direct community impact and field successes."}
          </p>
        </div>
        
        <div className="pt-6 border-t border-gray-50 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mt-4">
          Explore Impact Story <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

// Site Imagery Component
function SiteImageCard({ photo }: { photo: Photo }) {
  return (
    <div className="relative group rounded-2xl overflow-hidden aspect-[16/10] bg-gray-100 shadow-sm border border-gray-100">
      <img
        src={photo.minioUrl}
        alt={photo.caption || "Site view"}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <p className="text-xs text-white font-bold mb-1">
          {photo.caption || "Site Perspective"}
        </p>
        {photo.year && (
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.15em] flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Area View • {photo.year}
          </p>
        )}
      </div>
    </div>
  );
}

interface SiteVisualsProps {
  species: SiteSpecies[];
  photos: Photo[];
  siteName: string;
  loading?: boolean;
}

export default function SiteVisuals({ species, photos, siteName, loading = false }: SiteVisualsProps) {
  const sitePhotos = photos.filter((p) => p.category === "SITE");
  const eventPhotos = photos.filter((p) => p.category === "EVENT");
  const speciesDataPhotos = photos.filter((p) => p.category === "SPECIES");

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-64 bg-gray-50 rounded-3xl" />
        <div className="h-96 bg-gray-50 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-20">
      {/* Species Section */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Trees className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Biodiversity Selection</span>
            </div>
            <h3 className="text-3xl font-serif font-bold text-gray-900">Species Database</h3>
          </div>
          {species.length > 0 && (
            <div className="flex gap-3">
              <button className="species-prev p-2 rounded-full border border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="species-next p-2 rounded-full border border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {species.length > 0 ? (
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1.2}
            navigation={{
              nextEl: ".species-next",
              prevEl: ".species-prev",
            }}
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
            }}
            className="!pb-4"
          >
            {species.map((sp) => (
              <SwiperSlide key={sp.speciesId}>
                <SpeciesCarouselCard siteSpecies={sp} speciesPhotos={speciesDataPhotos} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="bg-stone-50 rounded-[2rem] border border-dashed border-stone-200 p-12 text-center">
            <Leaf className="w-10 h-10 text-stone-300 mx-auto mb-4" />
            <h4 className="text-lg font-serif font-bold text-stone-800 mb-2">Field Inventory in Progress</h4>
            <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
              Our conservationists are currently documenting the indigenous flora at {siteName}. 
              Detailed species data will be synchronized upon verification.
            </p>
          </div>
        )}
      </section>

      {/* Event Imagery Section */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <Camera className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Field Documentation</span>
            </div>
            <h3 className="text-3xl font-serif font-bold text-gray-900">Events & Impact</h3>
          </div>
        </div>

        {eventPhotos.length > 0 ? (
          <>
            <Swiper
              modules={[Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ clickable: true, el: '.event-pagination' }}
              autoplay={{ delay: 6000 }}
              className="!pb-12"
            >
              {eventPhotos.map((photo) => (
                <SwiperSlide key={photo.id}>
                  <EventImageCard photo={photo} />
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="event-pagination flex justify-center gap-2 mt-2" />
          </>
        ) : (
          <div className="bg-amber-50/30 rounded-[2rem] border border-dashed border-amber-100 p-12 text-center">
            <Calendar className="w-10 h-10 text-amber-200 mx-auto mb-4" />
            <h4 className="text-lg font-serif font-bold text-amber-900 mb-2">Impact Stories Pending</h4>
            <p className="text-sm text-amber-800/60 max-w-sm mx-auto leading-relaxed">
              New community engagement events and conservation milestones for {siteName} are being compiled. 
              Check back soon for the latest field reports.
            </p>
          </div>
        )}
      </section>

      {/* Site Imagery Section */}
      {sitePhotos.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 mb-2">
                <ImageIcon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Geographic Records</span>
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-900">Site Perspectives</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sitePhotos.map((photo) => (
              <SiteImageCard key={photo.id} photo={photo} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
