"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  Leaf,
  Upload,
  ArrowRight,
  PenLine,
  MapPin,
  FolderTree,
  Layers,
  Trees,
  Sun,
  Trash2,
  BarChart3,
  Image,
  Users,
  Settings,
  FileText,
  Droplets
} from 'lucide-react';
import { JSX } from 'react';

interface ModuleCardProps {
  href: string;
  icon: JSX.Element;
  title: string;
  description: string;
}

function ModuleCard({ href, icon, title, description }: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#115e59]/30 transition-all duration-300"
    >
      <div className="w-10 h-10 rounded-lg bg-[#115e59]/10 flex items-center justify-center text-[#115e59] group-hover:bg-[#115e59] group-hover:text-white transition-all duration-300 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-800 group-hover:text-[#115e59] transition-colors flex items-center gap-2">
          {title}
          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </h3>
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}

interface ModuleSectionProps {
  title: string;
  children: React.ReactNode;
}

function ModuleSection({ title, children }: ModuleSectionProps) {
  return (
    <div>
      <h2 className="text-sm font-bold text-[#0d4a47] uppercase tracking-widest mb-4 flex items-center gap-3">
        <span className="w-10 h-[3px] bg-[#b08d4b] rounded-full" />
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="max-w-[1800px] mx-auto space-y-8 pb-10"
    >
      {/* Vector Drawing Tool */}
      <motion.div variants={item}>
        <ModuleSection title="Vector Drawing">
          <ModuleCard
            href="/admin/vector-draw"
            icon={<PenLine className="w-5 h-5" />}
            title="Vector Drawing Tool"
            description="Create and edit site boundaries, plantation zones, and infrastructure on the interactive map"
          />
        </ModuleSection>
      </motion.div>

      {/* Hierarchy Management */}
      <motion.div variants={item}>
        <ModuleSection title="Hierarchy Management">
          <ModuleCard
            href="/admin/organizations"
            icon={<Building2 className="w-5 h-5" />}
            title="Organizations"
            description="Manage parent organizations and company structures"
          />
          <ModuleCard
            href="/admin/regions"
            icon={<MapPin className="w-5 h-5" />}
            title="Regions"
            description="Define geographical regions and zones"
          />
          <ModuleCard
            href="/admin/categories"
            icon={<FolderTree className="w-5 h-5" />}
            title="Categories"
            description="Organize sites by category types"
          />
          <ModuleCard
            href="/admin/subcategories"
            icon={<Layers className="w-5 h-5" />}
            title="Sub-Categories"
            description="Create detailed sub-categorizations"
          />
          <ModuleCard
            href="/admin/sites"
            icon={<MapPin className="w-5 h-5" />}
            title="Sites"
            description="Manage individual site locations"
          />
        </ModuleSection>
      </motion.div>

      {/* Site Data */}
      <motion.div variants={item}>
        <ModuleSection title="Site Data">
          <ModuleCard
            href="/admin/yearly-metrics"
            icon={<BarChart3 className="w-5 h-5" />}
            title="Yearly Metrics"
            description="Annual performance and impact metrics"
          />
          <ModuleCard
            href="/admin/plantation-data"
            icon={<Trees className="w-5 h-5" />}
            title="Plantation Data"
            description="Tree planting records and growth data"
          />
          <ModuleCard
            href="/admin/solar-data"
            icon={<Sun className="w-5 h-5" />}
            title="Solar Data"
            description="Solar energy production metrics"
          />
          <ModuleCard
            href="/admin/waste-data"
            icon={<Trash2 className="w-5 h-5" />}
            title="Waste Data"
            description="Waste management and recycling data"
          />
          <ModuleCard
            href="/admin/sewage-data"
            icon={<Droplets className="w-5 h-5" />}
            title="Sewage Data"
            description="Water treatment and sewage metrics"
          />
        </ModuleSection>
      </motion.div>

      {/* Reference Data */}
      <motion.div variants={item}>
        <ModuleSection title="Reference Data">
          <ModuleCard
            href="/admin/species"
            icon={<Leaf className="w-5 h-5" />}
            title="Species Catalog"
            description="Tree and plant species database"
          />
          <ModuleCard
            href="/admin/photos"
            icon={<Image className="w-5 h-5" />}
            title="Photo Management"
            description="Site photos and documentation"
          />
        </ModuleSection>
      </motion.div>

      {/* Spatial Data */}
      <motion.div variants={item}>
        <ModuleSection title="Spatial Data">
          <ModuleCard
            href="/admin/rasters"
            icon={<Upload className="w-5 h-5" />}
            title="Raster Upload"
            description="Upload drone imagery and GeoTIFFs"
          />
        </ModuleSection>
      </motion.div>

      {/* System */}
      <motion.div variants={item}>
        <ModuleSection title="System">
          <ModuleCard
            href="/admin/users"
            icon={<Users className="w-5 h-5" />}
            title="User Management"
            description="Manage user accounts and permissions"
          />
          <ModuleCard
            href="/admin/aggregate-metrics"
            icon={<BarChart3 className="w-5 h-5" />}
            title="Aggregate Metrics"
            description="View aggregated metrics across sites"
          />
          <ModuleCard
            href="/admin/category-summaries"
            icon={<FileText className="w-5 h-5" />}
            title="Category Summaries"
            description="Summary reports by category"
          />
          <ModuleCard
            href="/admin/migration"
            icon={<Settings className="w-5 h-5" />}
            title="Data Migration"
            description="Import and migrate data"
          />
        </ModuleSection>
      </motion.div>
    </motion.div>
  );
}
