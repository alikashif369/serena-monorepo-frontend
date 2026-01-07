// src/components/Navbar.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // Use Link for client-side navigation
import { usePathname } from "next/navigation";
// Import Lucide icons for reliable menu button
import { LogIn, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Do not render this global navbar on the homepage, because the homepage uses PremiumNavbar
  if (pathname === "/") {
    return null;
  }

  // Add scroll effect for glass + drop-shadow
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`
    fixed top-0 left-0 w-full z-50 transition-all duration-300
    ${scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200"
          : "bg-green-900/30 backdrop-blur-sm border-b border-green-800/20" // DARK GREEN like footer
        }
      `}
    >

      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <Image
            src="/serena-logo.png"
            alt="Serena Green"
            width={140}
            height={140}
            className="object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className={`
              text-xl font-bold tracking-tight transition-all font-serif
              ${scrolled
                ? "text-gray-800 group-hover:text-green-800"
                : "text-white group-hover:text-gray-100 drop-shadow-md"
              }
            
            `}
          >
            Serena Green
          </span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { href: "/", label: "Home" },
            { href: "#stats", label: "Stats" },
            { href: "#recent", label: "Activities" },
            { href: "#partners", label: "Partners" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`
                text-sm font-medium transition-all duration-300 relative group
                ${scrolled
                  ? "text-gray-700 hover:text-green-800"
                  : "text-white/90 hover:text-white"
                }
              `}
            >
              {item.label}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${scrolled ? 'bg-green-700' : 'bg-white'}`}></span>
            </a>
          ))}
       
          {/* Dashboard Button */}
          <a
            href="/dashboard"
            className="
    px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all duration-300
    bg-gradient-to-r from-green-800 to-green-900 text-white hover:shadow-xl hover:-translate-y-0.5 border border-green-700/50
  "
          >
            Dashboard
          </a>
          
        </div>

        {/* Mobile Menu Button (FIXED ICON) */}
        <button
          onClick={() => setOpen(!open)}
          className={`
            md:hidden text-2xl transition p-1 rounded
            ${scrolled ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/10"}
          `}
        >
          {/* Using Lucide icons instead of unstyled i tag */}
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drop-down */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg shadow-xl border-t border-gray-200 animate-fade-down">
          <ul className="flex flex-col px-6 py-4 gap-4 text-gray-800 font-medium">

            <a href="/" onClick={() => setOpen(false)} className="hover:text-green-700 transition-colors">Home</a>
            <a href="#stats" onClick={() => setOpen(false)} className="hover:text-green-700 transition-colors">Stats</a>
            <a href="#recent" onClick={() => setOpen(false)} className="hover:text-green-700 transition-colors">Activities</a>
            <a href="#partners" onClick={() => setOpen(false)} className="hover:text-green-700 transition-colors">Partners</a>

            <a
              href="/dashboard"
              className="bg-green-800 text-white text-center py-2.5 rounded-lg shadow-md hover:bg-green-900 transition mt-2"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </a>

          </ul>
        </div>
      )}
    </header>
  );
}