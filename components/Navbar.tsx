// src/components/Navbar.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home as HomeIcon, ChevronRight } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Do not render this global navbar on the homepage, because the homepage uses PremiumNavbar
  // Also hide on auth pages as they have their own standalone layout
  if (pathname === "/" || pathname === '/login' || pathname === '/accept-invitation' || pathname?.startsWith('/admin')) {
    return null;
  }

  // Dashboard-specific navigation links
  const navLinks = [
    { title: "Map View", href: "#map" },
    { title: "Analytics", href: "#summary" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out font-sans ${
        scrolled
          ? "bg-[#f8f6f1]/90 backdrop-blur-xl py-3 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-[#115e59]/10"
          : "bg-[#f8f6f1] py-5 border-b border-[#115e59]/5"
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand Logo - Updated to match PremiumNavbar style */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-[180px] h-[50px] transition-all duration-500 group-hover:scale-105">
             <Image
              src="/serena-logo.png"
              alt="Serena Green"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden lg:flex flex-col border-l border-[#115e59]/20 pl-4">
             <span
              className="text-[#115e59] text-lg font-serif font-bold tracking-wide leading-none"
            >
              SERENA GREEN
            </span>
            <span
              className="text-[#b08d4b] text-[10px] uppercase tracking-[0.3em] font-medium mt-1"
            >
              Analytics
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="relative text-[#115e59] text-xs uppercase tracking-[0.15em] font-bold hover:text-[#b08d4b] transition-colors duration-300 group py-2"
            >
              {link.title}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#b08d4b] transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
            </Link>
          ))}
          
          <Link
            href="/"
            className={`
              relative overflow-hidden group px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border shadow-md hover:shadow-lg hover:-translate-y-0.5
              bg-[#115e59] text-white border-[#115e59] hover:bg-[#b08d4b] hover:border-[#b08d4b]
            `}
          >
            <span className="relative z-10 flex items-center gap-2">
               <HomeIcon className="w-4 h-4" />
               Return Home
            </span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[#115e59] hover:text-[#b08d4b] transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#f8f6f1] border-b border-[#115e59]/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-[#115e59] text-sm font-bold uppercase tracking-widest hover:text-[#b08d4b] flex items-center justify-between group"
                >
                  {link.title}
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
              <div className="pt-4 border-t border-[#115e59]/10">
                <Link
                   href="/"
                   onClick={() => setIsOpen(false)}
                   className="flex items-center justify-center gap-2 w-full py-3 bg-[#115e59] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#b08d4b] transition-colors"
                >
                  <HomeIcon className="w-4 h-4" />
                  Return Home
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}