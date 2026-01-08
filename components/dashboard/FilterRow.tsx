"use client";

import React, { useMemo } from "react";
import { ChevronDown, X, Filter, RefreshCcw } from "lucide-react";
import type {
  DashboardFilters,
  HierarchyTree,
} from "./types";

interface FilterRowProps {
  filters: DashboardFilters;
  hierarchy: HierarchyTree | null;
  loading: boolean;
  onFilterChange: (level: keyof DashboardFilters, value: number | null) => void;
}

interface SelectOption {
  value: number;
  label: string;
}

// Custom styled select component - Optimized for space
function FilterSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "All",
}: {
  label: string;
  value: number | null;
  options: SelectOption[];
  onChange: (value: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const selectedOption = options.find((opt) => opt.value === value);
  const isDisabled = disabled || options.length === 0;

  return (
    <div className="flex flex-col gap-1 min-w-[140px] flex-1 max-w-[200px]">
      <label className="text-[9px] font-bold text-[#115e59]/80 uppercase tracking-wider pl-1">
        {label}
      </label>
      <div className="relative group">
        <select
          value={value ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange(val === "" ? null : parseInt(val, 10));
          }}
          disabled={isDisabled}
          className={`
            w-full appearance-none cursor-pointer
            pl-3 pr-8 py-2
            rounded-md text-xs font-semibold
            transition-all duration-200
            focus:outline-none focus:ring-1 focus:ring-[#b08d4b] focus:border-[#b08d4b]
            border shadow-sm
            ${isDisabled
              ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100"
              : value !== null
                ? "bg-[#115e59] border-[#115e59] text-white"
                : "bg-white border-gray-200 text-gray-700 hover:border-[#b08d4b]/50"
            }
          `}
        >
          <option value="" className="bg-white text-gray-700">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white text-gray-700">
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Chevron / Loading Indicator */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current">
          <ChevronDown
            className={`
              w-3.5 h-3.5 transition-transform duration-200
              ${isDisabled ? "opacity-30" : value !== null ? "text-white/80" : "text-gray-400 group-hover:text-[#b08d4b]"}
            `}
          />
        </div>
      </div>
    </div>
  );
}

export default function FilterRow({
  filters,
  hierarchy,
  loading,
  onFilterChange,
}: FilterRowProps) {

  // Derive options from hierarchy based on current filter state
  const organizationOptions = useMemo<SelectOption[]>(() => {
    if (!hierarchy?.organizations) return [];
    return hierarchy.organizations.map((org) => ({
      value: org.id,
      label: org.name,
    }));
  }, [hierarchy]);

  const regionOptions = useMemo<SelectOption[]>(() => {
    if (!hierarchy?.organizations || filters.organizationId === null) return [];
    const org = hierarchy.organizations.find(
      (o) => o.id === filters.organizationId
    );
    if (!org?.regions) return [];
    return org.regions.map((region) => ({
      value: region.id,
      label: region.name,
    }));
  }, [hierarchy, filters.organizationId]);

  const categoryOptions = useMemo<SelectOption[]>(() => {
    if (!hierarchy?.organizations || filters.regionId === null) return [];
    const org = hierarchy.organizations.find(
      (o) => o.id === filters.organizationId
    );
    const region = org?.regions?.find((r) => r.id === filters.regionId);
    if (!region?.categories) return [];
    return region.categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [hierarchy, filters.organizationId, filters.regionId]);

  const subCategoryOptions = useMemo<SelectOption[]>(() => {
    if (!hierarchy?.organizations || filters.categoryId === null) return [];
    const org = hierarchy.organizations.find(
      (o) => o.id === filters.organizationId
    );
    const region = org?.regions?.find((r) => r.id === filters.regionId);
    const category = region?.categories?.find((c) => c.id === filters.categoryId);
    if (!category?.subCategories) return [];
    return category.subCategories.map((sub) => ({
      value: sub.id,
      label: sub.name,
    }));
  }, [hierarchy, filters.organizationId, filters.regionId, filters.categoryId]);

  const siteOptions = useMemo<SelectOption[]>(() => {
    if (!hierarchy?.organizations || filters.categoryId === null) return [];
    const org = hierarchy.organizations.find(
      (o) => o.id === filters.organizationId
    );
    const region = org?.regions?.find((r) => r.id === filters.regionId);
    const category = region?.categories?.find((c) => c.id === filters.categoryId);
    if (!category) return [];

    // If subcategory is selected, filter sites by subcategory
    if (filters.subCategoryId !== null) {
      const subCat = category.subCategories?.find(
        (s) => s.id === filters.subCategoryId
      );
      if (!subCat?.sites) return [];
      return subCat.sites.map((site) => ({
        value: site.id,
        label: site.name,
      }));
    }

    // Otherwise, show all sites in category (including those without subcategory)
    const allSites: SelectOption[] = [];

    // Sites directly under category
    if (category.sites) {
      category.sites.forEach((site) => {
        allSites.push({ value: site.id, label: site.name });
      });
    }

    // Sites under subcategories
    if (category.subCategories) {
      category.subCategories.forEach((sub) => {
        if (sub.sites) {
          sub.sites.forEach((site) => {
            allSites.push({ value: site.id, label: site.name });
          });
        }
      });
    }

    return allSites;
  }, [
    hierarchy,
    filters.organizationId,
    filters.regionId,
    filters.categoryId,
    filters.subCategoryId,
  ]);

  // Handle cascading filter changes
  const handleFilterChange = (
    level: keyof DashboardFilters,
    value: number | null
  ) => {
    onFilterChange(level, value);

    // Clear downstream filters
    if (level === "organizationId") {
      onFilterChange("regionId", null);
      onFilterChange("categoryId", null);
      onFilterChange("subCategoryId", null);
      onFilterChange("siteId", null);
    } else if (level === "regionId") {
      onFilterChange("categoryId", null);
      onFilterChange("subCategoryId", null);
      onFilterChange("siteId", null);
    } else if (level === "categoryId") {
      onFilterChange("subCategoryId", null);
      onFilterChange("siteId", null);
    } else if (level === "subCategoryId") {
      onFilterChange("siteId", null);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFilterChange("organizationId", null);
    onFilterChange("regionId", null);
    onFilterChange("categoryId", null);
    onFilterChange("subCategoryId", null);
    onFilterChange("siteId", null);
  };

  const hasActiveFilters =
    filters.organizationId !== null ||
    filters.regionId !== null ||
    filters.categoryId !== null ||
    filters.subCategoryId !== null ||
    filters.siteId !== null;

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm mt-6 transition-all duration-300 relative z-30">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-3">
        
        {/* Compact Single Row Layout */}
        <div className="flex flex-col xl:flex-row xl:items-end gap-3 xl:gap-6">
          
          {/* Label / Brand Indicator */}
          <div className="hidden xl:flex flex-col justify-center pb-2.5 gap-1 min-w-fit">
            <div className="flex items-center gap-2 text-[#115e59]">
              <Filter className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest leading-none">Filters</span>
            </div>
          </div>

          {/* Filters Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <FilterSelect
              label="Organization"
              value={filters.organizationId}
              options={organizationOptions}
              onChange={(val) => handleFilterChange("organizationId", val)}
              disabled={loading}
              placeholder="Organization"
            />

            <FilterSelect
              label="Region"
              value={filters.regionId}
              options={regionOptions}
              onChange={(val) => handleFilterChange("regionId", val)}
              disabled={loading || filters.organizationId === null}
              placeholder="Region"
            />

            <FilterSelect
              label="Category"
              value={filters.categoryId}
              options={categoryOptions}
              onChange={(val) => handleFilterChange("categoryId", val)}
              disabled={loading || filters.regionId === null}
              placeholder="Category"
            />

            <FilterSelect
              label="Sub-Category"
              value={filters.subCategoryId}
              options={subCategoryOptions}
              onChange={(val) => handleFilterChange("subCategoryId", val)}
              disabled={loading || filters.categoryId === null || subCategoryOptions.length === 0}
              placeholder="Sub-Category"
            />

            <FilterSelect
              label="Site"
              value={filters.siteId}
              options={siteOptions}
              onChange={(val) => handleFilterChange("siteId", val)}
              disabled={loading || filters.categoryId === null}
              placeholder="Site"
            />
          </div>

          {/* Clear Button - positioned at the end or below on mobile */}
          <div className={`flex items-end pb-0.5 xl:min-w-fit ${!hasActiveFilters ? 'invisible' : ''}`}>
             <button
                onClick={clearAllFilters}
                className="
                  flex items-center gap-1.5 px-3 py-2 rounded-md
                  text-[10px] font-bold uppercase tracking-widest
                  bg-gray-100 text-gray-600 border border-gray-200
                  hover:bg-red-50 hover:text-red-600 hover:border-red-200
                  transition-all duration-200 h-[34px] w-full justify-center xl:w-auto
                "
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
              </button>
          </div>

        </div>

        {/* Mobile Filter Label (visible only on small screens) */}
        <div className="xl:hidden flex items-center gap-2 mt-2 mb-1 text-[#115e59] opacity-60">
           <Filter className="w-3 h-3" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Filter Sites</span>
        </div>
        
      </div>
    </div>
  );
}
