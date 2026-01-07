"use client";

import { motion } from "framer-motion";

export default function MissionSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
         <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#1B2E28" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,31.2C59,40.9,47.1,47.4,35.6,56.8C24.1,66.2,13,78.5,0.7,77.3C-11.6,76.1,-24.5,61.4,-38.3,51C-52.1,40.6,-66.8,34.5,-75.4,23.6C-84,12.7,-86.5,-3,-82.7,-17.2C-78.9,-31.4,-68.8,-44,-56.6,-51.9C-44.4,-59.8,-30.1,-63,-16.9,-65.4C-3.7,-67.8,8.4,-69.4,22.3,-74.6L44.7,-76.4Z" transform="translate(100 100)" />
         </svg>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
            <span className="text-serena-gold text-sm font-bold uppercase tracking-[0.3em] mb-6 block"> Our Mission </span>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight text-green-950 mb-12">
                "We do not inherit the earth from our ancestors; <br/>
                <span className="italic text-serena-green opacity-80">we borrow it from our children.</span>"
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                <div className="max-w-sm text-left border-l-2 border-serena-gold pl-6">
                    <p className="text-gray-600 leading-relaxed">
                        At Serena Hotels, sustainability is not just a policy—it is our heritage. We are dedicated to reducing our carbon footprint through responsible tourism.
                    </p>
                </div>
                <div className="max-w-sm text-left border-l-2 border-gray-200 pl-6">
                    <p className="text-gray-600 leading-relaxed">
                        From planting millions of trees to harnessing solar power, our initiatives are data-driven and community-focused.
                    </p>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
}
