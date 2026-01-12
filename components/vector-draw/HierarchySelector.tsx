"use client";

import { HierarchySite } from "./types";
import { RefreshCw } from "lucide-react";
import { Plus } from "lucide-react";

type SelectorProps = {
  orgs: any[];
  regionsByOrg: Record<number, any[]>;
  categoriesByRegion: Record<number, any[]>;
  subCatsByCategory: Record<number, any[]>;
  sitesByCategory: Record<number, HierarchySite[]>;
  sitesBySubCategory: Record<number, HierarchySite[]>;
  selectedOrgId: number | null;
  selectedRegionId: number | null;
  selectedCategoryId: number | null;
  selectedSubCategoryId: number | null;
  selectedSiteId: number | null;
  onChange: (level: "org" | "region" | "category" | "subCategory" | "site", id: number | null) => void;
  loading?: boolean;
  disabledSiteIds?: Set<number>;
  onCreate?: (level: "org" | "region" | "category" | "subCategory" | "site") => void;
};

export function HierarchySelector({
  orgs,
  regionsByOrg,
  categoriesByRegion,
  subCatsByCategory,
  sitesByCategory,
  sitesBySubCategory,
  selectedOrgId,
  selectedRegionId,
  selectedCategoryId,
  selectedSubCategoryId,
  selectedSiteId,
  onChange,
  loading,
  disabledSiteIds,
  onCreate,
}: SelectorProps) {
  const regions = selectedOrgId ? regionsByOrg[selectedOrgId] || [] : [];
  const categories = selectedRegionId ? categoriesByRegion[selectedRegionId] || [] : [];
  const subCats = selectedCategoryId ? subCatsByCategory[selectedCategoryId] || [] : [];
  const sitesFromCat = selectedCategoryId ? sitesByCategory[selectedCategoryId] || [] : [];
  const sitesFromSub = selectedSubCategoryId ? sitesBySubCategory[selectedSubCategoryId] || [] : [];
  const requiresSubCat = subCats.length > 0;
  
  // Filter out sites that already have boundaries (polygons) for the selected year AND deleted sites
  const allSitesBeforeFilter = requiresSubCat ? sitesFromSub : sitesFromCat;
  const sites = allSitesBeforeFilter.filter(site => 
    !disabledSiteIds?.has(site.id) && !site.deletedAt
  );
  
  console.log("[HIERARCHY_SELECTOR] Filtered sites:", sites.length, "available out of", allSitesBeforeFilter.length, "total (excluding deleted)");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Hierarchy</h3>
        {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />}
      </div>

      <SelectRow
        label="Organization"
        value={selectedOrgId}
        options={orgs}
        getLabel={(o) => o.name}
        onChange={(id) => {
          onChange("org", id);
          onChange("region", null);
          onChange("category", null);
          onChange("subCategory", null);
          onChange("site", null);
        }}
        onAdd={() => onCreate?.("org")}
      />

      <SelectRow
        label="Region"
        value={selectedRegionId}
        options={regions}
        getLabel={(r) => r.name}
        onChange={(id) => {
          onChange("region", id);
          onChange("category", null);
          onChange("subCategory", null);
          onChange("site", null);
        }}
        disabled={!selectedOrgId}
        onAdd={() => onCreate?.("region")}
        addDisabled={!selectedOrgId}
      />

      <SelectRow
        label="Category"
        value={selectedCategoryId}
        options={categories}
        getLabel={(c) => c.name}
        onChange={(id) => {
          onChange("category", id);
          onChange("subCategory", null);
          onChange("site", null);
        }}
        disabled={!selectedRegionId}
        onAdd={() => onCreate?.("category")}
        addDisabled={!selectedRegionId}
      />

      <SelectRow
        label="SubCategory"
        value={selectedSubCategoryId}
        options={subCats}
        getLabel={(s) => s.name}
        onChange={(id) => {
          onChange("subCategory", id);
          onChange("site", null);
        }}
        disabled={!selectedCategoryId}
        optional={false}
        onAdd={() => onCreate?.("subCategory")}
        addDisabled={!selectedCategoryId}
      />

      <SelectRow
        label="Site"
        value={selectedSiteId}
        options={sites}
        getLabel={(s: HierarchySite) => `${s.name}${s.city ? ` - ${s.city}` : ""}`}
        optionDisabled={(s) => disabledSiteIds?.has(s.id) ?? false}
        onChange={(id) => onChange("site", id)}
        disabled={!selectedCategoryId || (requiresSubCat && !selectedSubCategoryId)}
        placeholder={sites.length === 0 ? "No site available" : undefined}
        onAdd={() => onCreate?.("site")}
        addDisabled={!selectedCategoryId || (requiresSubCat && !selectedSubCategoryId)}
      />
    </div>
  );
}

type SelectRowProps<T> = {
  label: string;
  value: number | null;
  options: T[];
  getLabel: (item: T) => string;
  onChange: (id: number | null) => void;
  disabled?: boolean;
  optional?: boolean;
  optionDisabled?: (item: T) => boolean;
  placeholder?: string;
  onAdd?: () => void;
  addDisabled?: boolean;
};

function SelectRow<T>({
  label,
  value,
  options,
  getLabel,
  onChange,
  disabled,
  optional,
  optionDisabled,
  placeholder,
  onAdd,
  addDisabled,
}: SelectRowProps<T>) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          {disabled && <span className="text-[11px] text-gray-400">select above first</span>}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              disabled={addDisabled}
              className="inline-flex items-center gap-1 rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          )}
        </div>
      </div>
      <select
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent disabled:bg-gray-100"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled}
      >
        <option value="">{placeholder ?? `Choose ${label.toLowerCase()}`}</option>
        {options.map((o: any) => (
          <option key={o.id} value={o.id} disabled={optionDisabled?.(o)}>
            {getLabel(o)}
          </option>
        ))}
      </select>
    </div>
  );
}
