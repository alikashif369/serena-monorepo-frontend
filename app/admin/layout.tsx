"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/admin/layout/AdminLayout';

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

const FULL_WIDTH_ROUTES = ['/admin/vector-draw'];

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const isFullWidth = FULL_WIDTH_ROUTES.some(route => pathname?.startsWith(route));

  if (isFullWidth) {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
