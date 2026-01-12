"use client";

import { useEffect, useMemo, useState } from "react";
import { HierarchySite } from "./types";
import { API_URL, getHeaders } from "../../lib/utils/apiConfig";

const API_BASE = API_URL;

type OrgNode = any;

type UseHierarchyResult = {
  sites: HierarchySite[];
  orgs: OrgNode[];
  regionsByOrg: Record<number, OrgNode[]>;
  categoriesByRegion: Record<number, OrgNode[]>;
  subCatsByCategory: Record<number, OrgNode[]>;
  sitesByCategory: Record<number, HierarchySite[]>;
  sitesBySubCategory: Record<number, HierarchySite[]>;
  refresh: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

export function useHierarchy(): UseHierarchyResult {
  const [tree, setTree] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const normalize = (orgs: OrgNode[]): UseHierarchyResult => {
    console.log("[NORMALIZE] Starting normalization, orgs count:", orgs.length);
    console.log("[NORMALIZE] Orgs type:", typeof orgs, "is array:", Array.isArray(orgs));
    if (Array.isArray(orgs) && orgs.length > 0) {
      console.log("[NORMALIZE] First org structure:", JSON.stringify(orgs[0], null, 2).slice(0, 500));
    }
    const sites: HierarchySite[] = [];
    const regionsByOrg: Record<number, OrgNode[]> = {};
    const categoriesByRegion: Record<number, OrgNode[]> = {};
    const subCatsByCategory: Record<number, OrgNode[]> = {};
    const sitesByCategory: Record<number, HierarchySite[]> = {};
    const sitesBySubCategory: Record<number, HierarchySite[]> = {};

    orgs.forEach((org: any) => {
      console.log(`[NORMALIZE] Processing org ${org.id} (${org.name}), regions: ${org.regions?.length || 0}`);
      regionsByOrg[org.id] = org.regions || [];

      org.regions?.forEach((region: any) => {
        console.log(`[NORMALIZE] Processing region ${region.id} (${region.name}), categories: ${region.categories?.length || 0}`);
        categoriesByRegion[region.id] = region.categories || [];

        region.categories?.forEach((cat: any) => {
          console.log(`[NORMALIZE] Processing category ${cat.id} (${cat.name}), sites: ${cat.sites?.length || 0}, subcats: ${cat.subCategories?.length || 0}`);
          subCatsByCategory[cat.id] = cat.subCategories || [];

          // Sites directly under category (filter out soft-deleted sites)
          const catSites: HierarchySite[] = (cat.sites || [])
            .filter((site: any) => !site.deletedAt)
            .map((site: any) => ({
              id: site.id,
              name: site.name,
              slug: site.slug,
              siteType: site.siteType,
              area: site.area,
              district: site.district,
              city: site.city,
              org: org.name,
              region: region.name,
              category: cat.name,
              categoryId: cat.id,
              subCategory: null,
              subCategoryId: null,
              deletedAt: site.deletedAt,
            }));
          console.log(`[NORMALIZE] Category ${cat.id} has ${catSites.length} direct sites`);
          sites.push(...catSites);
          sitesByCategory[cat.id] = catSites;

          // Sites under subcategories (filter out soft-deleted sites)
          cat.subCategories?.forEach((sub: any) => {
            const subSites: HierarchySite[] = (sub.sites || [])
              .filter((site: any) => !site.deletedAt)
              .map((site: any) => ({
                id: site.id,
                name: site.name,
                slug: site.slug,
                siteType: site.siteType,
                area: site.area,
                district: site.district,
                city: site.city,
                org: org.name,
                region: region.name,
                category: cat.name,
                categoryId: cat.id,
                subCategory: sub.name,
                subCategoryId: sub.id,
                deletedAt: site.deletedAt,
              }));
            console.log(`[NORMALIZE] SubCategory ${sub.id} (${sub.name}) has ${subSites.length} sites`);
            sites.push(...subSites);
            sitesBySubCategory[sub.id] = subSites;
          });
        });
      });
    });

    console.log("[NORMALIZE] Normalization complete, total sites:", sites.length);
    console.log("[NORMALIZE] Sites by category:", Object.entries(sitesByCategory).map(([catId, catSites]) => `cat${catId}:${catSites.length}sites`).join(", "));

    return {
      sites,
      orgs,
      regionsByOrg,
      categoriesByRegion,
      subCatsByCategory,
      sitesByCategory,
      sitesBySubCategory,
      refresh: fetchTree,
      loading,
      error,
    } as UseHierarchyResult;
  };

  const fetchTree = async () => {
    console.log("[HIERARCHY] Starting fetchTree function");
    console.log("[HIERARCHY] Fetching hierarchy tree...");
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/hierarchy/tree`;
      console.log("[HIERARCHY] API URL:", url);

      const res = await fetch(url, {
        headers: getHeaders(),
      });
      
      console.log("[HIERARCHY] Response status:", res.status, res.statusText);
      console.log("[HIERARCHY] Response headers:", Array.from(res.headers.entries()));
      
      if (!res.ok) {
        const text = await res.text();
        console.error("[HIERARCHY] Error response body:", text);
        console.error("[HIERARCHY] Full response:", res);
        throw new Error(text || "Failed to load hierarchy");
      }
      const data = await res.json();
      console.log("[HIERARCHY] Full hierarchy data:", data);
      console.log("[HIERARCHY] Hierarchy data type:", typeof data, "is array:", Array.isArray(data));
      console.log("[HIERARCHY] Hierarchy data loaded, orgs count:", data?.length);
      if (Array.isArray(data) && data.length > 0) {
        console.log("[HIERARCHY] First org:", data[0]);
      }
      setTree(data || []);
      console.log("[HIERARCHY] Tree state updated");
    } catch (err: any) {
      console.error("[HIERARCHY] Fetch error caught:", err);
      console.error("[HIERARCHY] Error message:", err?.message);
      console.error("[HIERARCHY] Error stack:", err?.stack);
      setError(err?.message || "Error loading hierarchy");
    } finally {
      console.log("[HIERARCHY] fetchTree finally block - setLoading(false)");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[HIERARCHY_EFFECT] useHierarchy effect triggered, hasLoaded:", hasLoaded);
    if (!hasLoaded) {
      console.log("[HIERARCHY_EFFECT] First load, calling fetchTree");
      fetchTree();
      setHasLoaded(true);
      console.log("[HIERARCHY_EFFECT] hasLoaded set to true");
    } else {
      console.log("[HIERARCHY_EFFECT] Already loaded, skipping fetchTree");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalized = useMemo(() => normalize(tree), [tree]);

  return normalized;
}
