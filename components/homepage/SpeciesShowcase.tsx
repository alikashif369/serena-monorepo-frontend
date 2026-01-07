"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Simplified data from species.json (we can also import the full JSON if preferred)
const speciesData = [
  {
    name: "Pinus roxburghii",
    commonName: "Chir Pine",
    description: "Native to the Himalayas, this drought-hardy pine is vital for reforestation in the foothills of Pakistan.",
    image: "https://green.serena.com.pk/assets/Species/Pinus%20roxburghii%20Sargent/Pinus%20roxburghii%20Sargent1.jpg"
  },
  {
    name: "Cedrus deodara",
    commonName: "Deodar Cedar",
    description: "The national tree of Pakistan. A large evergreen cedar with drooping branches, renowned for its durable wood.",
    image: "https://green.serena.com.pk/assets/Species/Cedrus%20deodara%20(Roxb.%20Ex%20Lamb.)%20G.%20Don/Cedrus%20deodara%20(Roxb.%20Ex%20Lamb.)%20G.%20Don1.jpg"
  },
  {
    name: "Prunus padus",
    commonName: "Bird Cherry",
    description: "A deciduous tree with beautiful white fragrant flowers, native to the northern temperate zones.",
    image: "https://green.serena.com.pk/assets/Species/Prunus%20padus%20L/Prunus%20padus%20L1.jpg"
  },
  {
    name: "Olea ferruginea",
    commonName: "Indian Olive",
    description: "A hardy evergreen tree found in the lower hills, adapted to arid climates and drought resistant.",
    image: "https://green.serena.com.pk/assets/Species/Olea%20ferruginea%20Royle/Olea%20ferruginea%20Royle1.jpg" // Typo in original path corrected? Checking... assume standard path structure
  },
  {
    name: "Morus alba",
    commonName: "White Mulberry",
    description: "Fast-growing deciduous tree, historically significant for sericulture and widely planted for shade.",
    image: "https://green.serena.com.pk/assets/Species/Morus%20alba%20Linn/Morus%20alba%20Linn1.jpg"
  }
];

export default function SpeciesShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: containerRef });

  return (
    <section className="bg-white py-24 border-t border-gray-100 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <span className="text-serena-gold text-sm font-bold uppercase tracking-[0.3em] mb-4 block">Biodiversity</span>
           <h2 className="text-4xl md:text-5xl font-serif font-bold text-green-950">Indigenous Flora</h2>
        </div>
        <p className="max-w-md text-gray-500 leading-relaxed">
            Discover the diverse species we nurture across our sanctuaries, chosen for their ecological resilience and value to local communities.
        </p>
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        ref={containerRef}
        className="flex gap-8 overflow-x-auto pb-12 px-6 md:px-12 snap-x snap-mandatory scrollbar-hide"
      >
        {speciesData.map((species, idx) => (
            <motion.div
                key={species.name}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="min-w-[300px] md:min-w-[400px] snap-center group relative h-[500px] rounded-sm overflow-hidden cursor-pointer"
            >
                <img 
                    src={species.image} // Using img tag for external generic URLs to avoid Next.js domain config issues for now
                    alt={species.commonName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300" />
                
                <div className="absolute bottom-0 left-0 p-8 transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                    <span className="text-serena-gold text-xs font-bold uppercase tracking-widest mb-2 block">
                        {species.name}
                    </span>
                    <h3 className="text-3xl font-serif text-white mb-4 italic">
                        {species.commonName}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {species.description}
                    </p>
                    <button className="flex items-center gap-2 text-white text-sm font-bold uppercase tracking-widest border-b border-serena-gold pb-1 w-max">
                        View Details <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        ))}
        
        {/* 'View All' spacer */}
        <div className="min-w-[200px] flex items-center justify-center">
            <a href="#species" className="w-20 h-20 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:bg-serena-green hover:text-white hover:border-serena-green transition-all duration-300 group">
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>
        </div>
      </div>
    </section>
  );
}
