"use client";

import { motion } from "framer-motion";

export default function MissionSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
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
