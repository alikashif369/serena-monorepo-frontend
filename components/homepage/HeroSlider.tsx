"use client";

import { motion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// Swiper core and required modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

const slides = [
  {
    id: 1,
    image: "/bg-main.jpg", 
    title: "Preserving Nature for Future Generations",
    subtitle: "Serena Hotels' unwavering commitment to environmental stewardship through reforestation, renewable energy, and community engagement.",
    cta: "Explore Our Impact",
    link: "#impact"
  },
  {
    id: 2,
    image: "/bg-main.jpg", 
    title: "A Greener Tomorrow, Today",
    subtitle: "Leading the way in sustainable tourism across Pakistan's most breathtaking landscapes.",
    cta: "View Our Sites",
    link: "#sites"
  }
];

export default function HeroSlider() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-white text-green-950">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={2000}
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        pagination={{
            clickable: true,
            renderBullet: (index, className) => {
              return `<span class="${className} custom-swiper-bullet"></span>`;
            }
        }}
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full overflow-hidden">
              {/* Background Image with Ken Burns Effect */}
              <div className="absolute inset-0 animate-ken-burns">
                 <Image
                    src="/top-view-people-caring-mother-nature.jpg" // User provided image, please move to public/
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority
                 />
              </div>

              {/* Cinematic Gradient Overlay - Light Mode - Increased transparency for image visibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />

              {/* Content Container */}
              <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-20 max-w-[1600px] mx-auto pt-32">
                
                <div className="max-w-4xl">
                    <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex items-center gap-4 mb-8"
                    >
                        <div className="h-[1px] w-20 bg-serena-gold" />
                        <span className="text-serena-gold text-sm md:text-base font-bold uppercase tracking-[0.4em]">
                        Serena Environmental Initiative
                        </span>
                    </motion.div>
                    
                    <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-[1.1] mb-8 text-green-950"
                    >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-yellow-800">
                        {slide.title.split(" ").slice(0, 1)}
                    </span> {slide.title.split(" ").slice(1).join(" ")}
                    </motion.h1>

                    <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="text-lg md:text-xl text-green-900 max-w-2xl mb-12 font-medium leading-relaxed tracking-wide"
                    >
                    {slide.subtitle}
                    </motion.p>
                    
                    <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="flex flex-wrap gap-6"
                    >
                        <Link 
                            href={slide.link}
                            className="group flex items-center gap-4 px-10 py-5 bg-green-950 text-white rounded-none font-bold uppercase tracking-widest hover:bg-serena-gold transition-all duration-300 shadow-xl"
                        >
                            {slide.cta}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>

                        {/* Floating Glass Card (Live Stat) */}
                        <div className="hidden md:flex items-center gap-4 px-8 py-4 bg-white/60 backdrop-blur-md border border-green-950/10 rounded-none shadow-sm">
                            <div className="text-3xl font-serif text-green-950">45+</div>
                            <div className="text-xs text-green-900 uppercase tracking-widest leading-tight">
                                Active <br/> Sites
                            </div>
                        </div>
                    </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce"
      >
        <ChevronDown className="w-8 h-8 text-white/70" />
      </motion.div>
    </section>
  );
}
