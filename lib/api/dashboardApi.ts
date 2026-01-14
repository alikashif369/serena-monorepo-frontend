// Dashboard API Client for Serena Hotels GIS Dashboard

import type {
  HierarchyTree,
  Site,
  YearlyMetrics,
  SiteBoundary,
  Raster,
  Photo,
  SiteSpecies,
  CategoryType,
} from '@/components/dashboard/types';

import { API_URL, getHeaders, handleResponse } from '../utils/apiConfig';

// ============================================================================
// Hierarchy API
// ============================================================================

export async function getHierarchyTree(): Promise<HierarchyTree> {
  const response = await fetch(`${API_URL}/hierarchy/tree`, {
    headers: getHeaders(),
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
  const data = await handleResponse<HierarchyTree | any[]>(response);

  // Handle both formats: { organizations: [...] } or [...] (array directly)
  if (Array.isArray(data)) {
    console.log("[dashboardApi] Converting array response to HierarchyTree format");
    return { organizations: data };
  }

  return data as HierarchyTree;
}

export async function getHierarchyStats(): Promise<Record<string, number>> {
  const response = await fetch(`${API_URL}/hierarchy/stats`, {
    headers: getHeaders(),
    next: { revalidate: 300 },
  });
  return handleResponse<Record<string, number>>(response);
}

// ============================================================================
// Sites API
// ============================================================================

export interface SiteFilters {
  categoryId?: number;
  subCategoryId?: number;
  siteType?: string;
  search?: string;
}

export async function listSites(filters?: SiteFilters): Promise<Site[]> {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
  if (filters?.subCategoryId) params.append('subCategoryId', filters.subCategoryId.toString());
  if (filters?.siteType) params.append('siteType', filters.siteType);
  if (filters?.search) params.append('search', filters.search);

  const response = await fetch(`${API_URL}/sites?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<Site[]>(response);
}

export async function getSite(id: number, includeMetrics = true): Promise<Site> {
  const params = new URLSearchParams();
  if (includeMetrics) params.append('includeMetrics', 'true');

  const response = await fetch(`${API_URL}/sites/${id}?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<Site>(response);
}

export async function getSiteMetrics(siteId: number, years?: number[]): Promise<YearlyMetrics[]> {
  const params = new URLSearchParams();
  if (years && years.length > 0) {
    params.append('years', years.join(','));
  }

  const response = await fetch(`${API_URL}/sites/${siteId}/metrics?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<YearlyMetrics[]>(response);
}

export async function getSiteBoundary(siteId: number, year: number): Promise<SiteBoundary> {
  const response = await fetch(`${API_URL}/sites/${siteId}/boundary/${year}`, {
    headers: getHeaders(),
  });
  return handleResponse<SiteBoundary>(response);
}

export async function getSiteRasters(siteId: number, year: number): Promise<{ base?: Raster; classified?: Raster }> {
  const response = await fetch(`${API_URL}/sites/${siteId}/rasters/${year}`, {
    headers: getHeaders(),
  });
  return handleResponse<{ base?: Raster; classified?: Raster }>(response);
}

// ============================================================================
// Boundaries API (All boundaries for map)
// ============================================================================

export async function getAllBoundaries(filters?: {
  organizationId?: number;
  regionId?: number;
  categoryId?: number;
}): Promise<SiteBoundary[]> {
  const params = new URLSearchParams();
  if (filters?.organizationId) params.append('organizationId', filters.organizationId.toString());
  if (filters?.regionId) params.append('regionId', filters.regionId.toString());
  if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());

  const response = await fetch(`${API_URL}/boundaries?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<SiteBoundary[]>(response);
}

// ============================================================================
// Rasters API
// ============================================================================

export async function listRasters(filters?: {
  siteId?: number;
  year?: number;
  isClassified?: boolean;
}): Promise<Raster[]> {
  const params = new URLSearchParams();
  if (filters?.siteId) params.append('siteId', filters.siteId.toString());
  if (filters?.year) params.append('year', filters.year.toString());
  if (filters?.isClassified !== undefined) params.append('isClassified', filters.isClassified.toString());

  const response = await fetch(`${API_URL}/rasters?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<Raster[]>(response);
}

export async function getRaster(id: string): Promise<Raster> {
  const response = await fetch(`${API_URL}/rasters/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Raster>(response);
}

export function getRasterTileUrl(rasterId: string): string {
  return `${API_URL}/rasters/${rasterId}/tiles/{z}/{x}/{y}.png`;
}

// ============================================================================
// Photos API
// ============================================================================

export async function getPhotos(filters?: {
  siteId?: number;
  speciesId?: number;
  year?: number;
  category?: 'EVENT' | 'SITE' | 'SPECIES' | 'COMMUNITY';
}): Promise<Photo[]> {
  const params = new URLSearchParams();
  if (filters?.siteId) params.append('siteId', filters.siteId.toString());
  if (filters?.speciesId) params.append('speciesId', filters.speciesId.toString());
  if (filters?.year) params.append('year', filters.year.toString());
  if (filters?.category) params.append('category', filters.category);

  const response = await fetch(`${API_URL}/photos?${params.toString()}`, {
    headers: getHeaders(),
    cache: 'no-store', // Disable caching for photos
  });
  return handleResponse<Photo[]>(response);
}

// ============================================================================
// Species API
// ============================================================================

export async function getSiteSpecies(siteId: number): Promise<SiteSpecies[]> {
  const response = await fetch(`${API_URL}/site-species?siteId=${siteId}`, {
    headers: getHeaders(),
  });
  const data = await handleResponse<SiteSpecies[]>(response);

  // Temporary debug - will remove after verification
  console.log('🔍 API Response for site-species:', {
    count: data.length,
    species: data.map(s => ({
      id: s.species?.id,
      name: s.species?.englishName || s.species?.scientificName,
      hasImage1: !!s.species?.image1Url,
      hasImage2: !!s.species?.image2Url,
      hasImage3: !!s.species?.image3Url,
      hasImage4: !!s.species?.image4Url,
      image1: s.species?.image1Url?.substring(0, 50),
      image2: s.species?.image2Url?.substring(0, 50),
      image3: s.species?.image3Url?.substring(0, 50),
      image4: s.species?.image4Url?.substring(0, 50),
    }))
  });

  return data;
}

// ============================================================================
// Category Summaries API
// ============================================================================

export interface CategorySummary {
  id: number;
  organizationId?: number;
  regionId?: number;
  categoryId?: number;
  title: string;
  summary: string;
  displayOrder?: number;
}

export async function getCategorySummaries(filters?: {
  organizationId?: number;
  regionId?: number;
  categoryId?: number;
}): Promise<CategorySummary[]> {
  const params = new URLSearchParams();
  if (filters?.organizationId) params.append('organizationId', filters.organizationId.toString());
  if (filters?.regionId) params.append('regionId', filters.regionId.toString());
  if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());

  const response = await fetch(`${API_URL}/category-summaries?${params.toString()}`, {
    headers: getHeaders(),
  });

  return handleResponse<CategorySummary[]>(response);
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatArea(sqMeters: number): string {
  if (sqMeters >= 10000) {
    return `${formatNumber(sqMeters / 10000, 2)} ha`;
  }
  return `${formatNumber(sqMeters, 0)} m²`;
}

export function getCategoryLabel(type: CategoryType): string {
  const labels: Record<CategoryType, string> = {
    PLANTATION: 'Plantation',
    SOLAR: 'Solar Energy',
    COMMUNITY: 'Community',
    WASTE: 'Waste Management',
    SEWAGE: 'Sewage Treatment',
    RESTORATION: 'Restoration',
  };
  return labels[type] || type;
}
