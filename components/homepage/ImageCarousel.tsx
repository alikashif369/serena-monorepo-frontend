"use client";

import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';

const photos = [
  "/map.webp", // Placeholder
  "/map.webp", // Placeholder
  "/map.webp", // Placeholder
  "/map.webp", // Placeholder
];

export default function ImageCarousel() {
  return (
    <section className="py-24 bg-serena-sand text-green-950 overflow-hidden">
      <div className="text-center mb-16 px-6">
        <span className="text-serena-gold text-sm font-bold uppercase tracking-[0.3em] mb-4 block">Visual Journey</span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold">Conservation in Action</h2>
      </div>

      <Swiper
        modules={[Autoplay, FreeMode]}
        spaceBetween={30}
        slidesPerView={1.5}
        centeredSlides={true}
        loop={true}
        freeMode={true}
        speed={5000} // Smooth continuous scroll
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        breakpoints={{
            640: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.5 },
        }}
        className="linear-swiper-wrapper" 
      >
        {photos.map((src, i) => (
          <SwiperSlide key={i} className="transition-opacity duration-300 hover:opacity-100 opacity-60">
             <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-700 shadow-md hover:shadow-xl">
                <img 
                    src={src} 
                    alt="Gallery Image" 
                    className="w-full h-full object-cover"
                />
             </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      <div className="mt-12 text-center">
        <a href="#gallery" className="inline-block text-serena-gold border-b border-serena-gold/30 pb-1 text-sm uppercase tracking-widest hover:text-green-950 hover:border-green-950 transition-colors">
            View Full Gallery
        </a>
      </div>
    </section>
  );
}
