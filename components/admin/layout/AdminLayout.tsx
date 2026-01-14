"use client";

import { useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';
// import AdminSidebar from './AdminSidebar'; // COMMENTED OUT - Navigation is in navbar and main page
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { User, Search, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // COMMENTED OUT - Sidebar removed
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isSuperAdmin, isLoading } = useAuth();

  // Scroll handler for glass-morphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
          {/* Top Navigation Bar - Full Width with scroll effect */}
          <header
            className={`z-[100] flex-shrink-0 transition-all duration-500 ease-in-out ${
              scrolled
                ? "bg-[#f8f6f1]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-[#115e59]/10"
                : "bg-[#f8f6f1] border-b border-[#115e59]/5"
            }`}
          >
              <div className="px-6 md:px-8 h-20 flex items-center justify-between gap-4">
                {/* Brand & Title */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  <Link href="/admin" className="flex items-center gap-4 group">
                    <div className="relative w-[180px] h-[50px] transition-all duration-500 group-hover:scale-105">
                      <Image
                        src="/serena-logo.png"
                        alt="Serena"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <div className="flex flex-col border-l border-[#115e59]/20 pl-4">
                      <span className="text-[#115e59] text-lg font-serif font-bold tracking-wide leading-none">
                        ADMIN PANEL
                      </span>
                      <span className="text-[#b08d4b] text-[10px] uppercase tracking-[0.3em] font-medium mt-1">
                        Serena Green
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Main Navigation links */}
                <nav className="hidden xl:flex items-center gap-2 flex-1 min-w-0 overflow-visible">
                  <Link
                    href="/admin/vector-draw"
                    className="relative px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#115e59] hover:text-[#b08d4b] transition-colors duration-300 whitespace-nowrap flex-shrink-0 group"
                  >
                    Vector Drawing
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#b08d4b] transition-all duration-300 scale-x-0 group-hover:scale-x-100 origin-left" />
                  </Link>

                  {/* Dropdown Items */}
                  {[
                    { label: 'Hierarchy Management', items: [
                      { href: '/admin/organizations', label: 'Organizations' },
                      { href: '/admin/regions', label: 'Regions' },
                      { href: '/admin/categories', label: 'Categories' },
                      { href: '/admin/subcategories', label: 'Sub-Categories' },
                      { href: '/admin/sites', label: 'Sites' },
                    ]},
                    { label: 'Site Data', items: [
                      { href: '/admin/yearly-metrics', label: 'Yearly Metrics' },
                      { href: '/admin/plantation-data', label: 'Plantation Data' },
                      { href: '/admin/solar-data', label: 'Solar Data' },
                      { href: '/admin/waste-data', label: 'Waste Data' },
                      { href: '/admin/sewage-data', label: 'Sewage Data' },
                      { href: '/admin/community-data', label: 'Community Data' },
                    ]},
                    { label: 'Reference Data', items: [
                      { href: '/admin/species', label: 'Species Catalog' },
                      { href: '/admin/photos', label: 'Photo Management' },
                    ]},
                    { label: 'Spatial Data', items: [
                      { href: '/admin/rasters', label: 'Raster Upload' },
                    ]},
                    { label: 'System', items: [
                      { href: '/admin/users', label: 'User Management' },
                      { href: '/admin/category-summaries', label: 'Category Summaries' },
                      { href: '/admin/data-migration', label: 'Data Migration' },
                    ]},
                  ].map((group) => (
                    <div key={group.label} className="relative group/nav flex-shrink-0">
                      <button className="relative flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#115e59] hover:text-[#b08d4b] transition-colors duration-300 whitespace-nowrap group">
                        {group.label}
                        <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover/nav:rotate-180" />
                        <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#b08d4b] transition-all duration-300 scale-x-0 group-hover/nav:scale-x-100 origin-left" />
                      </button>
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white/95 backdrop-blur-xl border border-[#115e59]/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 z-[9999] py-2 translate-y-2 group-hover/nav:translate-y-0">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-4 py-2.5 text-xs text-[#115e59] hover:bg-[#f8f6f1] hover:text-[#b08d4b] hover:pl-5 transition-all duration-200"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </nav>

                {/* Right Actions: Search & User */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Search */}
                  <div className="relative hidden lg:block">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#115e59]/40" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2.5 text-xs bg-white/80 border border-[#115e59]/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#b08d4b]/20 focus:border-[#b08d4b]/30 w-48 xl:w-56 transition-all duration-300 placeholder:text-[#115e59]/40"
                    />
                  </div>

                  {/* Dashboard Link */}
                  <Link
                    href="/dashboard"
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 bg-[#115e59] text-white hover:bg-[#b08d4b] shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Dashboard
                  </Link>

                  {/* User Profile */}
                  <div className="relative hidden md:block">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-full bg-white/80 border border-[#115e59]/10 hover:border-[#b08d4b]/30 transition-all duration-300 shadow-sm hover:shadow-md group"
                    >
                      <div className="flex flex-col text-right hidden lg:block">
                        <span className="text-[11px] font-bold text-[#115e59] group-hover:text-[#b08d4b] transition-colors duration-300">
                          {isLoading ? '...' : user?.name || 'Super Admin'}
                        </span>
                        <span className="text-[9px] text-[#b08d4b] uppercase tracking-wider">
                          {isSuperAdmin ? 'Super Admin' : 'Admin'}
                        </span>
                      </div>
                      <div className="w-8 h-8 bg-[#115e59] rounded-full flex items-center justify-center text-white ring-2 ring-offset-1 ring-transparent group-hover:ring-[#b08d4b]/30 transition-all duration-300">
                        <User className="w-4 h-4" />
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-[#115e59]/10 py-2 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#115e59]/5 bg-[#f8f6f1]/50">
                          <p className="text-sm font-bold text-[#115e59] truncate">
                            {user?.name || 'Super Admin'}
                          </p>
                          <p className="text-[10px] text-[#b08d4b] truncate">
                            {user?.email || 'admin@serena.com'}
                          </p>
                        </div>
                        <Link
                          href="/admin/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#115e59] hover:bg-[#f8f6f1] hover:pl-5 transition-all duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4 text-[#b08d4b]" />
                          Profile Settings
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 hover:pl-5 w-full transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="xl:hidden p-2 text-[#115e59] hover:text-[#b08d4b] transition-colors duration-300"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              {/* Mobile Menu Overlay */}
              {mobileMenuOpen && (
                <div className="xl:hidden bg-[#f8f6f1] border-t border-[#115e59]/10 overflow-hidden">
                  <div className="flex flex-col p-6 space-y-2">
                    <Link
                      href="/admin/vector-draw"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[#115e59] text-sm font-bold uppercase tracking-widest hover:text-[#b08d4b] py-2 transition-colors"
                    >
                      Vector Drawing
                    </Link>
                    {[
                      { label: 'Hierarchy Management', items: [
                        { href: '/admin/organizations', label: 'Organizations' },
                        { href: '/admin/regions', label: 'Regions' },
                        { href: '/admin/categories', label: 'Categories' },
                        { href: '/admin/subcategories', label: 'Sub-Categories' },
                        { href: '/admin/sites', label: 'Sites' },
                      ]},
                      { label: 'Site Data', items: [
                        { href: '/admin/yearly-metrics', label: 'Yearly Metrics' },
                        { href: '/admin/plantation-data', label: 'Plantation Data' },
                        { href: '/admin/solar-data', label: 'Solar Data' },
                        { href: '/admin/waste-data', label: 'Waste Data' },
                        { href: '/admin/sewage-data', label: 'Sewage Data' },
                        { href: '/admin/community-data', label: 'Community Data' },
                      ]},
                      { label: 'Reference Data', items: [
                        { href: '/admin/species', label: 'Species Catalog' },
                        { href: '/admin/photos', label: 'Photo Management' },
                      ]},
                      { label: 'Spatial Data', items: [
                        { href: '/admin/rasters', label: 'Raster Upload' },
                      ]},
                      { label: 'System', items: [
                        { href: '/admin/users', label: 'User Management' },
                        { href: '/admin/category-summaries', label: 'Category Summaries' },
                        { href: '/admin/data-migration', label: 'Data Migration' },
                      ]},
                    ].map((group) => (
                      <div key={group.label} className="py-2 border-t border-[#115e59]/10">
                        <span className="text-[#b08d4b] text-[10px] uppercase tracking-widest font-bold">{group.label}</span>
                        <div className="mt-2 space-y-1">
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block text-[#115e59] text-sm hover:text-[#b08d4b] py-1 pl-2 transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-[#115e59]/10 space-y-3">
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center w-full py-3 bg-[#115e59] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#b08d4b] transition-colors"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center justify-center gap-2 w-full py-3 border border-red-500 text-red-500 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </header>

          {/* Content Area - Sidebar commented out (navigation in navbar and main page) */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - COMMENTED OUT */}
            {/* <AdminSidebar
              collapsed={sidebarCollapsed}
              onCollapsedChange={setSidebarCollapsed}
            /> */}

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="max-w-[1800px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

// Export a simple header component for pages that want to set their own title
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
