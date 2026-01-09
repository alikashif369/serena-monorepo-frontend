"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function ClientLayoutContent({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/accept-invitation";
  const isAdminPage = pathname?.startsWith("/admin");

  // If it's the homepage, we want the content to start at the very top (pt-0)
  // so the transparent navbar can sit on top of the hero image.
  // For other pages, we keep the standard padding (pt-20) to avoid content being hidden behind the fixed navbar.
  // For auth pages and admin pages, we also want pt-0 as they handle their own layout.
  
  return (
    <div className={`min-h-screen ${isHomepage || isAuthPage || isAdminPage ? "pt-0" : "pt-20"}`}>
      {children}
    </div>
  );
}
