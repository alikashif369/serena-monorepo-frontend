"use client";
import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaLeaf, FaMapMarkerAlt, FaEnvelope, FaPhone, FaPaperPlane, FaChevronRight } from "react-icons/fa";

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0D1815] text-white py-20 border-t border-white/5 font-sans">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                
                {/* Brand Column */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-serif font-bold tracking-wide">SERENA GREEN</h2>
                        <span className="text-serena-gold text-[10px] uppercase tracking-[0.3em] font-medium block mt-1">Conservation</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                        Pioneering sustainable tourism through responsible stewardship, community engagement, and environmental innovation.
                    </p>
                    <div className="flex gap-4">
                        {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                            <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:bg-serena-gold hover:text-green-950 hover:border-serena-gold transition-all duration-300">
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Explore */}
                <div>
                     <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white mb-6">Explore</h3>
                     <ul className="space-y-4 text-gray-400 text-sm">
                        {["Home", "Our Initiatives", "Impact Statistics", "Biodiversity", "Gallery"].map(item => (
                            <li key={item}>
                                <a href="#" className="hover:text-serena-gold transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 bg-serena-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {item}
                                </a>
                            </li>
                        ))}
                     </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white mb-6">Contact</h3>
                    <ul className="space-y-4 text-gray-400 text-sm">
                        <li className="flex items-start gap-3">
                            <FaMapMarkerAlt className="mt-1 text-serena-gold" />
                            <span>Serena Hotels,<br/>Islamabad, Pakistan</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <FaPhone className="text-serena-gold" />
                            <span>+92 51 287 6161</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <FaEnvelope className="text-serena-gold" />
                            <a href="mailto:green@serenahotels.com" className="hover:text-white transition-colors">green@serenahotels.com</a>
                        </li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white mb-6">Newsletter</h3>
                    <p className="text-gray-400 text-xs mb-4">
                        Join our community of eco-conscious travelers.
                    </p>
                    <form className="flex flex-col gap-3">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-serena-gold transition-colors"
                        />
                        <button className="bg-serena-gold text-green-950 px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 pt-8 text-xs text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <FaLeaf className="text-serena-gold" />
                    <span>© 2025 Serena Green. All Rights Reserved.</span>
                </div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                </div>
            </div>
        </div>
    </footer>
  );
}
