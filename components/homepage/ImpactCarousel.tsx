"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import Image from "next/image";

const impactItems = [
  {
    id: 1,
    title: "Conservation",
    description: "Protecting biodiversity and restoring ecosystems across our regions.",
    image: "/carousal_image_01.jpg"
  },
  {
    id: 2,
    title: "Community",
    description: "Empowering local communities through sustainable livelihoods and education.",
    image: "/carousal_image_01.jpg" 
  },
  {
    id: 3,
    title: "Flora",
    description: "Nurturing indigenous plant species for a greener, more resilient future.",
    image: "/carousal_image_01.jpg"
  },
  {
    id: 4,
    title: "Culture",
    description: "Preserving heritage and promoting cultural understanding through tourism.",
    image: "/carousal_image_01.jpg"
  },
  {
    id: 5,
    title: "Sustainability",
    description: "Reducing our carbon footprint through renewable energy and waste reduction.",
    image: "/carousal_image_01.jpg"
  }
];

export default function ImpactCarousel() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="mb-12 px-6 max-w-[1400px] mx-auto">
        <span className="text-serena-gold text-sm font-bold uppercase tracking-[0.3em] mb-4 block">
          Our Pillars of Impact
        </span>
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-green-950 max-w-2xl">
          Driving Positive Change
        </h2>
      </div>

      <Swiper
        modules={[Autoplay, FreeMode]}
        spaceBetween={30}
        slidesPerView={1.2}
        loop={true}
        freeMode={true}
        speed={6000} // Slow constant speed for marquee effect
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        breakpoints={{
            640: { slidesPerView: 2.2 },
            1024: { slidesPerView: 3.5 },
        }}
        className="w-full linear-swiper-wrapper pb-12"
      >
        {impactItems.map((item) => (
          <SwiperSlide key={item.id} className="cursor-pointer group">
             <div className="flex flex-col h-full pl-6 md:pl-0">
                {/* Text Content - Top */}
                <div className="mb-6 pr-8">
                    <h3 className="text-2xl font-serif font-bold text-green-950 mb-3 group-hover:text-serena-gold transition-colors duration-300">
                        {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        {item.description}
                    </p>
                </div>

                {/* Image Content - Bottom */}
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-sm bg-gray-100">
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Optional Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
             </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
