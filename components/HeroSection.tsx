// import MapLibreHero from "./MapLibreMap";

// export default function HeroSection({ stats }: { stats: any }) {
//   return (
//     <section id="hero" className="relative h-screen flex items-center justify-center text-white hero-gradient">
//       <MapLibreHero />

//       <div className="relative text-center px-4 z-10">
//         <h1 className="text-5xl md:text-6xl font-bold mb-4 heading-font">
//           Serena Green: Building a Sustainable Future
//         </h1>

//         {/* Counters */}
//         <div className="flex flex-wrap justify-center gap-8 my-8">
//           <div className="text-center">
//             <div className="text-4xl font-bold counter" data-target={stats?.treesPlanted}>{stats?.treesPlanted}</div>
//             <div className="text-lg">Trees Planted</div>
//           </div>
//           <div className="text-center">
//             <div className="text-4xl font-bold counter" data-target={stats?.energyGenerated}>{stats?.energyGenerated}</div>
//             <div className="text-lg">kWh Clean Energy</div>
//           </div>
//           <div className="text-center">
//             <div className="text-4xl font-bold counter" data-target={stats?.wasteRecycled}>{stats?.wasteRecycled}</div>
//             <div className="text-lg">Tonnes Waste Recycled</div>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
//           <a href="dashboard" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-bold transition shadow-lg hover:shadow-xl transform hover:scale-105">
//             <i className="fas fa-chart-line mr-2" /> Open Visualization Dashboard
//           </a>
//           <a href="#stats" className="bg-white text-serena-green hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition border-2 border-green-600">
//             View Stats Below
//           </a>
//         </div>

//         <div className="mt-8 text-sm text-gray-200">
//           <i className="fas fa-info-circle mr-2"></i>
//           Explore our interactive dashboard with real-time land cover analysis across 34 project sites
//         </div>

//         <div className="mt-12 animate-bounce">
//           <i className="fas fa-chevron-down text-3xl"></i>
//         </div>
//       </div>
//     </section>
//   );
// }
// This component should be a client component if MapLibreHero uses browser APIs, 
// otherwise, it can remain a server component. We'll assume a Server Component 
// wrapping a Client Component for the map, which is typical.

 



// src/components/HeroSection.tsx

// Mark as a client component because it imports MapLibreHero, which is client-side.
"use client"; 
import Image from "next/image";
import MapLibreHero from "./MapLibreMap"; 
// CORRECTED: Changed FaInfoCircle to FaCircleInfo
import { FaChartLine, FaChevronDown, FaCircleInfo } from 'react-icons/fa6'; 

export default function HeroSection({ stats }: { stats?: any }) {
  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center text-white hero-gradient"
    >
    
  {/* <MapLibreHero /> */}
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/map.webp" 
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#064E3B]/40" />
         {/* Optional overlay for better text contrast */}
      </div>

      <div className="relative text-center px-4 z-10 max-w-5xl mx-auto">
        
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-8 heading-font font-serif tracking-tight drop-shadow-lg leading-tight">
          Serena Green: <br/> <span className="text-green-100/90 font-light italic">Building a Sustainable Future</span>
        </h1>

        <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md">
          Monitoring environmental initiatives, tree plantations, and renewable energy across our properties.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-8">
          
          {/* Dashboard Button */}
          <a 
            href="dashboard" 
            className="
              group
              bg-gradient-to-r from-green-700 to-green-900 
              hover:from-green-600 hover:to-green-800
              text-white px-10 py-5 rounded-full 
              text-lg font-bold transition-all duration-300 
              shadow-xl hover:shadow-2xl hover:shadow-green-900/50
              transform hover:-translate-y-1
              flex items-center justify-center space-x-3
              border border-green-500/30 backdrop-blur-sm
            "
          >
            <FaChartLine className="w-6 h-6 group-hover:scale-110 transition-transform" /> 
            <span>Open Visualization Dashboard</span>
          </a>
          
          {/* Stats Button */}
          <a 
            href="#stats" 
            className="
              group
              bg-white/10 backdrop-blur-md
              text-white hover:text-white
              px-10 py-5 rounded-full text-lg font-semibold 
              border border-white/40 hover:border-white
              transition-all duration-300 
              shadow-lg hover:shadow-xl
              transform hover:-translate-y-1
              flex items-center justify-center
            "
          >
            View Stats Below
            <FaChevronDown className="ml-3 w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </a>

        </div>

        {/* Descriptive Text */}
        <div className="mt-12 text-base text-green-50 max-w-lg mx-auto flex items-center justify-center bg-black/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
          <FaCircleInfo className="w-5 h-5 mr-3 text-green-300" /> 
          Explore our interactive real-time land cover analysis
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 opacity-70 animate-bounce absolute bottom-8 left-1/2 -translate-x-1/2">
          <FaChevronDown className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
      </div>
    </section>
  );
}