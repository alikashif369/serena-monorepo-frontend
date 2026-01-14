"use client";

import React, { useState } from "react";
import { Trees, Camera, Leaf, Calendar, Image as ImageIcon, ZoomIn, Info, ChevronLeft, ChevronRight, Flower2, Sprout, ArrowUpRight } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
// Optional plugins for better experience
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

import type { SiteSpecies, Photo } from "./types";
import { formatNumber } from "@/lib/api/dashboardApi";
import { motion } from "framer-motion";

// ----------------------------------------------------------------------------
// Types & Helpers
// ----------------------------------------------------------------------------

interface GallerySlide {
  src: string;
  title?: string;
  description?: React.ReactNode;
  alt?: string;
  id?: string;
}

// ----------------------------------------------------------------------------
// Component: Species Card (Carousel Item)
// ----------------------------------------------------------------------------

function SpeciesHeroCard({
  siteSpecies,
  photos,
  onClick,
}: {
  siteSpecies: SiteSpecies;
  photos: Photo[];
  onClick: () => void;
}) {
  const species = siteSpecies.species;
  if (!species) return null;

  const [hoveredImage, setHoveredImage] = useState<number>(0);

  const referenceImages = [
    { url: species.image1Url, label: 'Habitat', icon: Trees },
    { url: species.image2Url, label: 'Leaf', icon: Leaf },
    { url: species.image3Url, label: 'Bark', icon: Info },
    { url: species.image4Url, label: 'Flower', icon: Flower2 },
  ].filter(img => img.url); // Ensure valid URLs

  const additionalPhotos = photos
    .filter(p => p.speciesId === species.id)
    .map(p => ({
      url: p.minioUrl,
      label: p.caption || 'Field Photo',
      icon: Camera,
      type: 'uploaded'
    }));

  const allImages = [...referenceImages, ...additionalPhotos];

  return (
    <div
      onClick={onClick}
      className="group relative h-[500px] w-full bg-black rounded-[2.5rem] overflow-hidden cursor-pointer shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
    >
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0">
        <img
          src={allImages[hoveredImage]?.url}
          alt={species.englishName}
          className="w-full h-full object-cover opacity-80 transition-all duration-700 group-hover:scale-110 group-hover:opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 p-10 flex flex-col justify-between">
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
             <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
               <Sprout className="w-3 h-3 text-emerald-400" />
               Native Flora
             </span>
             {siteSpecies.plantedCount && (
               <span className="bg-emerald-500/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                 {formatNumber(siteSpecies.plantedCount)} Planted
               </span>
             )}
          </div>
          
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
             <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Bottom Content */}
        <div className="space-y-6">
          <div>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2 leading-tight">
              {species.englishName}
            </h3>
            <p className="text-xl text-emerald-200 font-serif italic opacity-90">
              {species.scientificName}
            </p>
          </div>

          <p className="text-gray-300 line-clamp-3 max-w-2xl text-lg font-light leading-relaxed">
            {species.description}
          </p>

          <div className="flex items-end justify-between border-t border-white/10 pt-6">
            <div className="flex gap-3">
              {allImages.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  onMouseEnter={(e) => { e.stopPropagation(); setHoveredImage(idx); }}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${hoveredImage === idx ? 'border-emerald-400 scale-110 ring-2 ring-emerald-400/30' : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white'}`}
                >
                  <img src={img.url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-emerald-400 group-hover:translate-x-2 transition-transform">
               <span>Explore Gallery</span>
               <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Component: Photo Grid Item
// ----------------------------------------------------------------------------

function PhotoGridItem({
  photo,
  onClick,
  isLarge = false
}: {
  photo: Photo;
  onClick: () => void;
  isLarge?: boolean;
}) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClick}
      className={`group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-900 ${isLarge ? 'md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto' : 'aspect-square'}`}
    >
      <img
        src={photo.minioUrl}
        alt={photo.caption || "Gallery Image"}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 group-hover:translate-y-0 text-white transition-transform duration-300">
        <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${photo.category === 'EVENT' ? 'bg-amber-500/80' : 'bg-blue-500/80'}`}>
            {photo.category === 'EVENT' ? 'Event' : 'Site View'}
          </span>
          {photo.year && <span className="text-white/60 text-xs font-medium">{photo.year}</span>}
        </div>
        <h4 className="font-serif text-xl font-bold leading-tight mb-1">
          {photo.caption || "Untitled"}
        </h4>
        {photo.description && (
          <p className="text-gray-300 text-xs line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity delay-200">
            {photo.description}
          </p>
        )}
      </div>

      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-black">
        <ZoomIn className="w-5 h-5" />
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export default function SiteVisuals({ species, photos, siteName, loading = false }: { species: SiteSpecies[]; photos: Photo[]; siteName: string; loading?: boolean; }) {
  // State for Lightbox
  const [open, setOpen] = useState(false);
  const [slides, setSlides] = useState<GallerySlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // State for Photo Filter
  const [photoFilter, setPhotoFilter] = useState<'ALL' | 'EVENT' | 'SITE'>('ALL');

  const sitePhotos = photos.filter((p) => p.category === "SITE");
  const eventPhotos = photos.filter((p) => p.category === "EVENT");
  const speciesDataPhotos = photos.filter((p) => p.category === "SPECIES");

  const displayPhotos = photoFilter === 'ALL'
    ? [...eventPhotos, ...sitePhotos]
    : photoFilter === 'EVENT' ? eventPhotos : sitePhotos;

  const openBox = (newSlides: GallerySlide[], index: number) => {
    setSlides(newSlides);
    setCurrentIndex(index);
    setOpen(true);
  };

  const getSpeciesSlides = (): GallerySlide[] => {
    const slides: GallerySlide[] = [];
    species.forEach(sp => {
      if (!sp.species) return;
      const staticImages = [
        { url: sp.species.image1Url, label: 'Habitat' },
        { url: sp.species.image2Url, label: 'Leaf' },
        { url: sp.species.image3Url, label: 'Bark' },
        { url: sp.species.image4Url, label: 'Flower' },
      ].filter(i => i.url);

      staticImages.forEach(img => {
        slides.push({
          src: img.url,
          title: sp.species!.englishName,
          description: sp.species!.description
        });
      });

      const uploaded = speciesDataPhotos.filter(p => p.speciesId === sp.species!.id);
      uploaded.forEach(p => {
        slides.push({
          src: p.minioUrl,
          title: p.caption || sp.species!.englishName,
          description: p.description
        });
      });
    });
    return slides;
  };

  if (loading) {
    return <div className="h-96 w-full bg-gray-100 animate-pulse rounded-[2.5rem]" />;
  }

  return (
    <div className="space-y-24 w-full">
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={currentIndex}
        slides={slides}
        plugins={[Captions, Zoom]}
      />

      {/* 1. Species Catalog */}
      {species.length > 0 && (
        <section>
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-emerald-800 text-[10px] font-extrabold uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-full">
                     Biodiversity Index
                   </span>
                </div>
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Species Catalog</h3>
              </div>
              
              <div className="flex gap-4">
                 <button className="swiper-prev-custom w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all duration-300 group">
                    <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                 </button>
                 <button className="swiper-next-custom w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all duration-300 group">
                    <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                 </button>
              </div>
           </div>

           <Swiper
             modules={[Pagination, Navigation, EffectFade]}
             spaceBetween={40}
             slidesPerView={1}
             navigation={{
               nextEl: '.swiper-next-custom',
               prevEl: '.swiper-prev-custom',
             }}
             pagination={{ clickable: true, dynamicBullets: true }}
             className="pb-16 px-2"
           >
             {species.map((sp, idx) => (
               <SwiperSlide key={sp.speciesId}>
                 <SpeciesHeroCard
                   siteSpecies={sp}
                   photos={speciesDataPhotos}
                   onClick={() => openBox(getSpeciesSlides(), idx * 4)} // Approximation
                 />
               </SwiperSlide>
             ))}
           </Swiper>
        </section>
      )}

      {/* 2. Visual Documentation */}
      {(eventPhotos.length > 0 || sitePhotos.length > 0) && (
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
             <div>
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                   <span className="text-amber-800 text-[10px] font-extrabold uppercase tracking-[0.2em] bg-amber-50 px-3 py-1 rounded-full">
                     Field Updates
                   </span>
                </div>
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Visual Documentation</h3>
             </div>

             {/* Modern Filter Tabs */}
             <div className="bg-gray-100/50 p-1.5 rounded-2xl flex gap-1">
               {['ALL', 'EVENT', 'SITE'].map((filter) => (
                 <button
                   key={filter}
                   onClick={() => setPhotoFilter(filter as any)}
                   className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                     photoFilter === filter
                       ? 'bg-white text-emerald-800 shadow-md transform scale-105'
                       : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                   }`}
                 >
                   {filter === 'ALL' ? 'All Views' : filter}
                 </button>
               ))}
             </div>
          </div>

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {displayPhotos.map((photo, idx) => (
                <PhotoGridItem
                  key={photo.id}
                  photo={photo}
                  isLarge={false} // Force uniform size
                  onClick={() => openBox(displayPhotos.map(p => ({
                    src: p.minioUrl,
                    title: p.caption,
                    description: p.description
                  })), idx)}
                />
             ))}
          </motion.div>

          {displayPhotos.length === 0 && (
             <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">No visual records found for this category.</p>
             </div>
          )}
        </section>
      )}
    </div>
  );
}
