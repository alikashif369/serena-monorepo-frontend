"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, LayoutDashboard } from "lucide-react";

export default function PremiumNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Scroll handler for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { title: "Home", href: "/" },
    { title: "Our Impact", href: "#impact" },
    { title: "Initiatives", href: "#initiatives" },
    { title: "Partners", href: "#partners" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out font-sans ${
        scrolled
          ? "bg-white/95 backdrop-blur-md py-4 shadow-sm border-b border-gray-100"
          : "bg-gradient-to-b from-white/80 to-transparent py-6"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-[180px] h-[60px] transition-all duration-500 group-hover:scale-105">
             <Image
              src="/serena-logo.png"
              alt="Serena Green"
              fill
              className="object-contain drop-shadow-sm" // Removed large drop-shadow
              priority
            />
          </div>
          <div className="hidden lg:flex flex-col border-l border-green-950/20 pl-4">
             <span
              className="text-green-950 text-lg font-serif font-bold tracking-wide leading-none"
            >
              SERENA GREEN
            </span>
            <span
              className="text-serena-gold text-[10px] uppercase tracking-[0.3em] font-medium mt-1"
            >
              Conservation
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="relative text-green-950/80 text-sm uppercase tracking-[0.15em] font-medium hover:text-serena-gold transition-colors duration-300 group py-2"
            >
              {link.title}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-serena-gold transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
            </Link>
          ))}
          
          <Link
            href="/dashboard"
            className={`
              relative overflow-hidden group px-7 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 border shadow-md
              ${
                scrolled
                  ? "bg-green-950 text-white border-green-950 hover:bg-serena-gold hover:text-white"
                  : "bg-green-950 text-white border-green-950 hover:bg-serena-gold hover:text-white"
              }
            `}
          >
            <span className="relative z-10 flex items-center gap-2">
               <LayoutDashboard className="w-4 h-4" />
               Dashboard
            </span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-green-950 hover:text-serena-gold transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed inset-0 bg-white z-[40] pt-24 px-6 overflow-hidden"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link, idx) => (
                <motion.div
                   key={link.title}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 * idx }}
                >
                    <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-3xl font-serif text-green-950 hover:text-serena-gold transition-colors mb-4"
                    >
                    {link.title}
                    </Link>
                    <div className="h-[1px] w-12 bg-green-950/10" />
                </motion.div>
              ))}
              
              <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="pt-8"
              >
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-3 w-full py-4 bg-serena-gold text-white rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-green-950 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Access Dashboard
                  </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
