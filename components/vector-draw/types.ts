export type HierarchySite = {
  id: number;
  name: string;
  slug: string;
  siteType?: string | null;
  area?: number | null;
  district?: string | null;
  city?: string | null;
  org?: string;
  region?: string;
  category?: string;
  categoryId?: number;
  subCategory?: string | null;
  subCategoryId?: number | null;
  deletedAt?: string | null;
};

export type BoundaryResponse = {
  id: string;
  siteId: number;
  year: number;
  geometry: any;
};

export type RasterResponse = {
  id: number;
  siteId: number;
  year: number;
  isClassified: boolean;
  bbox: any;
};
