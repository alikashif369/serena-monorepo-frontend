// app/page.tsx
"use client";

import PremiumNavbar from "@/components/homepage/PremiumNavbar";
import HeroSlider from "@/components/homepage/HeroSlider";
import ImpactCarousel from "@/components/homepage/ImpactCarousel";
import ImpactStats from "@/components/homepage/ImpactStats";
import MissionSection from "@/components/homepage/MissionSection";
import SpeciesShowcase from "@/components/homepage/SpeciesShowcase";
import ImageCarousel from "@/components/homepage/ImageCarousel";
import Footer from "@/components/Footer"; 
import CountryGrid from "@/components/CountryGrid"; 
import PartnersSlider from "@/components/PartnersSlider";

const PartnersSliderComponent: any = PartnersSlider;

// Mock data (keep or fetch from API)
const mockStats = {
  treesPlanted: "1.2M+",
  energyGenerated: "5.6 GWh",
  wasteRecycled: "850 Tons",
  livesImpacted: "45,000+",
};

const mockPartners = [
  { id: 1, name: "WWF", logoUrl: "/logos/logo1.png" }, // Placeholders
  { id: 2, name: "AKDN", logoUrl: "/logos/logo2.png" },
  { id: 3, name: "Ministry of Climate Change", logoUrl: "/logos/logo3.png" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white selection:bg-serena-green selection:text-white font-sans">
      <PremiumNavbar />
      
      <HeroSlider />

      <ImpactCarousel />
      
      <MissionSection />
      
      <ImpactStats stats={mockStats} />

      <SpeciesShowcase />

      <ImageCarousel />

      {/* Partners Section (Reusing existing components with wrappers for consistency) */}
      <div className="py-24 bg-white">
         <div className="text-center mb-16">
            <span className="text-serena-gold text-sm font-bold uppercase tracking-[0.3em] block mb-4">Collaborations</span>
            <h2 className="text-4xl font-serif font-bold text-green-950">Partnerships</h2>
        </div>
         <PartnersSliderComponent partners={mockPartners} />
      </div>

       {/* Map Section */}
      <div className="py-24 bg-[#F9F8F6]">
        <div className="text-center mb-16 px-6">
            <span className="text-serena-gold text-sm font-bold uppercase tracking-[0.3em] block mb-4">Our Footprint</span>
            <h2 className="text-4xl font-serif font-bold text-green-950">Regional Presence</h2>
        </div>
        <CountryGrid />
      </div>

       <Footer />
    </main>
  );
}
