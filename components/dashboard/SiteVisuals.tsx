"use client";

import React, { useState } from "react";
import { Trees, Camera, Leaf, Calendar, Image as ImageIcon, ZoomIn, Info, ChevronLeft, ChevronRight } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
// Optional plugins for better experience
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/plugins/captions.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import type { SiteSpecies, Photo } from "./types";
import { formatNumber } from "@/lib/api/dashboardApi";

// ----------------------------------------------------------------------------
// Types & Helpers
// ----------------------------------------------------------------------------

interface GallerySlide {
  src: string;
  title?: string;
  description?: React.ReactNode;
  alt?: string;
  // Custom props for identification if needed
  id?: string;
}

// ----------------------------------------------------------------------------
// Component: Species Gallery Item
// ----------------------------------------------------------------------------

function SpeciesGridItem({
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

  // All 4 reference images with labels and icons - now guaranteed to exist
  const referenceImages = [
    { url: species.image1Url, label: 'Habitat', icon: Trees, type: 'reference' },
    { url: species.image2Url, label: 'Leaf', icon: Leaf, type: 'reference' },
    { url: species.image3Url, label: 'Bark', icon: Info, type: 'reference' },
    { url: species.image4Url, label: 'Seed/Flower', icon: Camera, type: 'reference' },
  ];

  // Get additional uploaded SPECIES photos for this species
  const additionalPhotos = photos
    .filter(p => p.speciesId === species.id)
    .map(p => ({
      url: p.minioUrl,
      label: p.caption || 'Photo',
      icon: ImageIcon,
      type: 'uploaded'
    }));

  // Combine reference images with additional photos
  const allImages = [...referenceImages, ...additionalPhotos];

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full cursor-pointer hover:-translate-y-2"
    >
      {/* Main Image Container - Shows hovered or first image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50">
        <img
          src={allImages[hoveredImage]?.url}
          alt={`${species.englishName} - ${allImages[hoveredImage]?.label}`}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

        {/* Image Type Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ring-2 ring-emerald-500/30">
          {allImages[hoveredImage]?.label}
        </div>

        {/* Planted Count Badge */}
        {siteSpecies.plantedCount && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-emerald-600/95 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ring-2 ring-white/30">
              {formatNumber(siteSpecies.plantedCount)} planted
            </div>
          </div>
        )}

        {/* Photo Count Badge (if there are additional uploaded photos) */}
        {additionalPhotos.length > 0 && (
          <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-blue-600/95 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg ring-2 ring-blue-400/30 flex items-center gap-1.5">
              <ImageIcon className="w-3 h-3" />
              {allImages.length} photos
            </div>
          </div>
        )}

        {/* Dynamic Thumbnail Grid Overlay (Bottom) - Shows all images */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`grid gap-1.5 ${allImages.length <= 4 ? 'grid-cols-4' : allImages.length <= 6 ? 'grid-cols-6' : 'grid-cols-8'}`}>
            {allImages.slice(0, 8).map((img, idx) => {
              const IconComponent = img.icon;
              return (
                <button
                  key={idx}
                  onMouseEnter={() => setHoveredImage(idx)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setHoveredImage(idx);
                  }}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    hoveredImage === idx
                      ? 'border-emerald-400 ring-2 ring-emerald-400/50 scale-105'
                      : 'border-white/40 hover:border-white/80'
                  }`}
                  title={img.label}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <IconComponent className="w-3 h-3 text-white drop-shadow-md" />
                  </div>
                  {/* Show badge for uploaded photos */}
                  {img.type === 'uploaded' && (
                    <div className="absolute top-0.5 right-0.5 bg-emerald-500 rounded-full w-2 h-2" />
                  )}
                </button>
              );
            })}
            {allImages.length > 8 && (
              <div className="aspect-square rounded-lg bg-white/20 flex items-center justify-center text-white text-[10px] font-bold">
                +{allImages.length - 8}
              </div>
            )}
          </div>
        </div>

        {/* Zoom Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl ring-2 ring-emerald-500/50">
            <ZoomIn className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50/50">
        <h4 className="font-bold text-gray-900 text-base mb-1.5 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {species.englishName || species.localName || species.scientificName}
        </h4>
        <p className="text-xs text-gray-500 italic mb-3 font-serif line-clamp-1">{species.scientificName}</p>

        {species.uses && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-gray-100">
            {species.uses.split(',').slice(0, 2).map((use, i) => (
              <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 font-medium">
                {use.trim()}
              </span>
            ))}
            {species.uses.split(',').length > 2 && (
              <span className="text-[10px] text-gray-400 px-1 py-1">+{species.uses.split(',').length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Component: Single Species Feature Card
// ----------------------------------------------------------------------------

function SingleSpeciesFeature({
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

  // All 4 reference images with labels and icons - now guaranteed to exist
  const referenceImages = [
    { url: species.image1Url, label: 'Habitat', icon: Trees, type: 'reference' },
    { url: species.image2Url, label: 'Leaf', icon: Leaf, type: 'reference' },
    { url: species.image3Url, label: 'Bark', icon: Info, type: 'reference' },
    { url: species.image4Url, label: 'Seed/Flower', icon: Camera, type: 'reference' },
  ];

  // Get additional uploaded SPECIES photos for this species
  const additionalPhotos = photos
    .filter(p => p.speciesId === species.id)
    .map(p => ({
      url: p.minioUrl,
      label: p.caption || 'Photo',
      icon: ImageIcon,
      type: 'uploaded'
    }));

  // Combine reference images with additional photos
  const allImages = [...referenceImages, ...additionalPhotos];

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-3xl overflow-hidden shadow-xl border border-emerald-100 max-w-5xl mx-auto cursor-pointer hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row h-auto md:h-[420px]"
    >
      {/* LEFT: Image Gallery */}
      <div className="w-full md:w-[45%] lg:w-[40%] relative bg-gray-100 flex flex-col">
        {/* Main Image */}
        <div className="flex-grow relative overflow-hidden">
          <img
            src={allImages[hoveredImage]?.url}
            alt={allImages[hoveredImage]?.label}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          
          {/* Label Badge */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-emerald-800 shadow-lg flex items-center gap-2">
             {(() => {
                const Icon = allImages[hoveredImage]?.icon || ImageIcon;
                return <Icon className="w-3.5 h-3.5" />;
             })()}
             {allImages[hoveredImage]?.label}
          </div>

          {/* Planted Count */}
           {siteSpecies.plantedCount && (
            <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg">
               {formatNumber(siteSpecies.plantedCount)} planted
            </div>
           )}
        </div>

        {/* Thumbnail Strip */}
        <div className="h-20 bg-emerald-950 p-2 flex gap-2 overflow-x-auto scrollbar-hide">
           {allImages.map((img, idx) => (
             <button
               key={idx}
               onMouseEnter={() => setHoveredImage(idx)}
               onClick={(e) => { e.stopPropagation(); setHoveredImage(idx); }}
               className={`relative aspect-square rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${hoveredImage === idx ? 'border-emerald-400 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
             >
               <img src={img.url} className="w-full h-full object-cover" alt="" />
             </button>
           ))}
        </div>
      </div>

      {/* RIGHT: Content Details */}
      <div className="flex-1 p-8 md:p-10 flex flex-col relative bg-gradient-to-br from-white to-emerald-50/30">
        <div className="flex-grow">
           <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2 leading-tight">
                  {species.englishName || species.localName || species.scientificName}
                </h3>
                <p className="text-lg text-emerald-700 font-medium italic font-serif">
                  {species.scientificName}
                </p>
              </div>
              <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-full">
                <Leaf className="w-6 h-6" />
              </div>
           </div>
           
           <p className="text-gray-600 leading-relaxed mb-8 line-clamp-4 md:line-clamp-6 text-sm md:text-base">
             {species.description || "A valuable species chosen for its ecological benefits and adaptability to the local environment. This species plays a crucial role in our conservation efforts."}
           </p>

           {species.uses && (
             <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ecological Benefits</p>
               <div className="flex flex-wrap gap-2">
                 {species.uses.split(',').map((use, i) => (
                   <span key={i} className="bg-white border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                     {use.trim()}
                   </span>
                 ))}
               </div>
             </div>
           )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
           <span className="flex items-center gap-2">
             <Camera className="w-4 h-4 text-emerald-500" />
             {allImages.length} Photos Available
           </span>
           <span className="flex items-center gap-2 group-hover:text-emerald-600 transition-colors font-medium">
             View Gallery <ChevronRight className="w-4 h-4" />
           </span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Component: Event / Photo Grid Item
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
    <div 
      onClick={onClick}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 bg-gray-100 border border-gray-200 hover:-translate-y-1 ${isLarge ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : 'aspect-square'}`}
    >
      <img
        src={photo.minioUrl}
        alt={photo.caption || "Gallery Image"}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:brightness-110"
      />
      
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Hover Content */}
      <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="flex items-center gap-2 mb-3">
          {photo.category === 'EVENT' ? (
             <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">Event</span>
          ) : (
             <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">Site View</span>
          )}
          {photo.year && <span className="text-white/90 text-xs bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full font-medium">{photo.year}</span>}
        </div>
        <h4 className="text-white font-bold text-base leading-tight mb-2 drop-shadow-lg line-clamp-2">
          {photo.caption || "Untitled Photo"}
        </h4>
        {photo.description && (
          <p className="text-gray-200 text-xs line-clamp-2 leading-relaxed drop-shadow-md">
            {photo.description}
          </p>
        )}
      </div>

      {/* Enhanced Zoom Icon */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 backdrop-blur-md p-2 rounded-full shadow-xl group-hover:scale-110 ring-2 ring-white/50">
        <ZoomIn className="w-5 h-5 text-gray-700" />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

interface SiteVisualsProps {
  species: SiteSpecies[];
  photos: Photo[];
  siteName: string;
  loading?: boolean;
}

export default function SiteVisuals({ species, photos, siteName, loading = false }: SiteVisualsProps) {
  // State for Lightbox
  const [open, setOpen] = useState(false);
  const [slides, setSlides] = useState<GallerySlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // State for Photo Filter
  const [photoFilter, setPhotoFilter] = useState<'ALL' | 'EVENT' | 'SITE'>('ALL');

  // Filter Data
  const sitePhotos = photos.filter((p) => p.category === "SITE");
  const eventPhotos = photos.filter((p) => p.category === "EVENT");
  const speciesDataPhotos = photos.filter((p) => p.category === "SPECIES");

  // Filtered photos based on selection
  const displayPhotos = photoFilter === 'ALL'
    ? [...eventPhotos, ...sitePhotos]
    : photoFilter === 'EVENT'
      ? eventPhotos
      : sitePhotos;

  // Handlers
  const openBox = (newSlides: GallerySlide[], index: number) => {
    setSlides(newSlides);
    setCurrentIndex(index);
    setOpen(true);
  };

  // Prepare Slides Generators - Shows all images (reference + uploaded) per species
  const getSpeciesSlides = (): GallerySlide[] => {
    const slides: GallerySlide[] = [];

    species.forEach(sp => {
      if (!sp.species) return;

      // 4 Reference images
      const imageTypes = [
        { url: sp.species.image1Url, label: 'Habitat View', icon: '🌳', type: 'Reference' },
        { url: sp.species.image2Url, label: 'Leaf Detail', icon: '🍃', type: 'Reference' },
        { url: sp.species.image3Url, label: 'Bark Texture', icon: '🌲', type: 'Reference' },
        { url: sp.species.image4Url, label: 'Seed/Flower', icon: '🌸', type: 'Reference' },
      ];

      imageTypes.forEach((img) => {
        slides.push({
          src: img.url,
          title: `${sp.species.englishName || sp.species.scientificName} - ${img.label}`,
          description: (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{img.icon}</span>
                <p className="text-sm font-semibold text-emerald-400">{img.label}</p>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">{img.type}</span>
              </div>
              <p className="italic text-gray-300 text-sm">{sp.species.scientificName}</p>
              <p className="text-gray-200 text-sm">{sp.species.description}</p>
              {sp.plantedCount && (
                <p className="text-emerald-400 font-bold text-sm">
                  {formatNumber(sp.plantedCount)} Trees Planted
                </p>
              )}
              {sp.species.uses && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Uses:</p>
                  <p className="text-gray-300 text-xs">{sp.species.uses}</p>
                </div>
              )}
            </div>
          ),
          alt: `${sp.species.englishName} ${img.label}`,
        });
      });

      // Add uploaded SPECIES photos
      const speciesPhotos = speciesDataPhotos.filter(p => p.speciesId === sp.species.id);
      speciesPhotos.forEach((photo) => {
        slides.push({
          src: photo.minioUrl,
          title: `${sp.species.englishName || sp.species.scientificName} - ${photo.caption || 'Photo'}`,
          description: (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📸</span>
                <p className="text-sm font-semibold text-blue-400">{photo.caption || 'Additional Photo'}</p>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Uploaded</span>
              </div>
              <p className="italic text-gray-300 text-sm">{sp.species.scientificName}</p>
              {photo.description && (
                <p className="text-gray-200 text-sm">{photo.description}</p>
              )}
              {photo.year && (
                <p className="text-gray-400 text-xs">Year: {photo.year}</p>
              )}
              {sp.plantedCount && (
                <p className="text-emerald-400 font-bold text-sm">
                  {formatNumber(sp.plantedCount)} Trees Planted
                </p>
              )}
            </div>
          ),
          alt: photo.caption || `${sp.species.englishName} photo`,
        });
      });
    });

    return slides;
  };

  const getEventSlides = (): GallerySlide[] => {
    return eventPhotos.map(p => ({
      src: p.minioUrl,
      title: p.caption,
      description: p.description
    }));
  };

  const getSiteSlides = (): GallerySlide[] => {
    return sitePhotos.map(p => ({
      src: p.minioUrl,
      title: p.caption,
      description: p.description
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 animate-pulse">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-gray-100 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-16 w-full">
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={currentIndex}
        slides={slides}
        plugins={[Captions, Zoom]}
        captions={{ showToggle: true, descriptionTextAlign: 'start' }}
      />

      {/* 1. Biodiversity Carousel - Redesigned for Professional Look */}
      {species.length > 0 && (
        <section className="w-full">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold text-gray-900">Species Catalog</h3>
                  <p className="text-sm text-gray-600 mt-1">Biodiversity at {siteName}</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg">
                {species.length} {species.length === 1 ? 'Species' : 'Species'}
              </div>
           </div>

           {/* Use Feature Card for 1 species, Carousel for 2-3, Grid for 4+ */}
           {species.length === 1 ? (
              // 1. Single Featured Species Mode - Premium Horizontal Card
              <div className="py-2">
                <SingleSpeciesFeature
                  siteSpecies={species[0]}
                  photos={speciesDataPhotos}
                  onClick={() => openBox(getSpeciesSlides(), 0)}
                 />
              </div>
           ) : species.length <= 3 ? (
             // 2. Carousel Mode for 2-3 Species
             <div className="relative px-6 md:px-12 max-w-7xl mx-auto">
               <Swiper
                 modules={[Autoplay, Pagination, Navigation]}
                 spaceBetween={32}
                 slidesPerView={1}
                 loop={species.length > 1}
                 autoplay={species.length > 1 ? {
                   delay: 5000,
                   disableOnInteraction: false,
                   pauseOnMouseEnter: true
                 } : false}
                 pagination={{
                   clickable: true,
                   el: '.species-pagination-dashboard'
                 }}
                 navigation={{
                   nextEl: '.species-next-dashboard',
                   prevEl: '.species-prev-dashboard'
                 }}
                 breakpoints={{
                   768: { slidesPerView: species.length >= 2 ? 2 : 1, spaceBetween: 32 },
                   1024: { slidesPerView: species.length >= 3 ? 3 : species.length, spaceBetween: 32 }
                 }}
                 className="pb-4"
               >
                 {species.map((sp, idx) => {
                   let startIndex = 0;
                   for (let i = 0; i < idx; i++) {
                     const prevSpeciesPhotos = speciesDataPhotos.filter(p => p.speciesId === species[i].species?.id);
                     startIndex += 4 + prevSpeciesPhotos.length;
                   }

                   return (
                     <SwiperSlide key={sp.speciesId} className="h-auto pb-12">
                       <SpeciesGridItem
                         siteSpecies={sp}
                         photos={speciesDataPhotos}
                         onClick={() => openBox(getSpeciesSlides(), startIndex)}
                       />
                     </SwiperSlide>
                   );
                 })}
               </Swiper>
               
               {/* Navigation Buttons */}
               <button className="species-prev-dashboard absolute left-0 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/95 backdrop-blur-md border-2 border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-600 hover:scale-110 transition-all duration-300 shadow-2xl group overflow-hidden hover:border-emerald-600">
                  <ChevronLeft strokeWidth={2.5} className="w-5 h-5 relative z-10" />
               </button>
               <button className="species-next-dashboard absolute right-0 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/95 backdrop-blur-md border-2 border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-600 hover:scale-110 transition-all duration-300 shadow-2xl group overflow-hidden hover:border-emerald-600">
                  <ChevronRight strokeWidth={2.5} className="w-5 h-5 relative z-10" />
               </button>

               <div className="species-pagination-dashboard flex justify-center gap-2 mt-8" />
             </div>
           ) : (
             // 3. Grid Mode for 4+ Species
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-fr">
               {species.map((sp, idx) => {
                 let startIndex = 0;
                 for (let i = 0; i < idx; i++) {
                   const prevSpeciesPhotos = speciesDataPhotos.filter(p => p.speciesId === species[i].species?.id);
                   startIndex += 4 + prevSpeciesPhotos.length;
                 }

                 return (
                   <SpeciesGridItem
                     key={sp.speciesId}
                     siteSpecies={sp}
                     photos={speciesDataPhotos}
                     onClick={() => openBox(getSpeciesSlides(), startIndex)}
                   />
                 );
               })}
             </div>
           )}
        </section>
      )}

      {/* 2. Events & Site Imagery - Unified Masonry Layout */}
      {(eventPhotos.length > 0 || sitePhotos.length > 0) && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold text-gray-900">Visual Documentation</h3>
                  <p className="text-sm text-gray-600 mt-1">Events, site views & progress photos</p>
                </div>
             </div>

             {/* Filter Tabs */}
             <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setPhotoFilter('ALL')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    photoFilter === 'ALL'
                      ? 'bg-white text-emerald-700 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All ({eventPhotos.length + sitePhotos.length})
                </button>
                <button
                  onClick={() => setPhotoFilter('EVENT')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    photoFilter === 'EVENT'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Events ({eventPhotos.length})
                </button>
                <button
                  onClick={() => setPhotoFilter('SITE')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    photoFilter === 'SITE'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Site Views ({sitePhotos.length})
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 auto-rows-fr">
             {/* Map Filtered Photos */}
             {displayPhotos.map((photo, idx) => (
                <PhotoGridItem
                  key={`photo-${photo.id}`}
                  photo={photo}
                  isLarge={idx === 0}
                  onClick={() => openBox(
                    displayPhotos.map(p => ({
                      src: p.minioUrl,
                      title: p.caption,
                      description: p.description
                    })),
                    idx
                  )}
                />
             ))}
          </div>

          {/* Fallback for completely empty visual section */}
          {eventPhotos.length === 0 && sitePhotos.length === 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-dashed border-gray-300 rounded-3xl p-16 text-center">
              <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                <Camera className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold text-lg mb-2">No visual documentation available yet</p>
              <p className="text-gray-500 text-sm">Photos and event images will appear here once uploaded</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
