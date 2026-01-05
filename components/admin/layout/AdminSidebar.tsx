"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Globe,
  Folder,
  FolderOpen,
  MapPin,
  TrendingUp,
  Trees,
  Sun,
  Recycle,
  Droplets,
  Leaf,
  Image,
  Upload,
  BarChart3,
  FileText,
  ChevronDown,
  ChevronRight,
  Settings,
  Database,
  Map,
  BookOpen,
  Menu,
  X,
  PenLine,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    id: 'hierarchy',
    label: 'Hierarchy Management',
    icon: <Building2 className="w-5 h-5" />,
    items: [
      { id: 'organizations', label: 'Organizations', icon: <Building2 className="w-4 h-4" />, href: '/admin/organizations' },
      { id: 'regions', label: 'Regions', icon: <Globe className="w-4 h-4" />, href: '/admin/regions' },
      { id: 'categories', label: 'Categories', icon: <Folder className="w-4 h-4" />, href: '/admin/categories' },
      { id: 'subcategories', label: 'SubCategories', icon: <FolderOpen className="w-4 h-4" />, href: '/admin/subcategories' },
      { id: 'sites', label: 'Sites', icon: <MapPin className="w-4 h-4" />, href: '/admin/sites' },
    ],
  },
  {
    id: 'site-data',
    label: 'Site Data',
    icon: <Database className="w-5 h-5" />,
    items: [
      { id: 'yearly-metrics', label: 'Yearly Metrics', icon: <TrendingUp className="w-4 h-4" />, href: '/admin/yearly-metrics' },
      { id: 'plantation-data', label: 'Plantation Data', icon: <Trees className="w-4 h-4" />, href: '/admin/plantation-data' },
      { id: 'solar-data', label: 'Solar Data', icon: <Sun className="w-4 h-4" />, href: '/admin/solar-data' },
      { id: 'waste-data', label: 'Waste Data', icon: <Recycle className="w-4 h-4" />, href: '/admin/waste-data' },
      { id: 'sewage-data', label: 'Sewage Data', icon: <Droplets className="w-4 h-4" />, href: '/admin/sewage-data' },
    ],
  },
  {
    id: 'reference',
    label: 'Reference Data',
    icon: <BookOpen className="w-5 h-5" />,
    items: [
      { id: 'species', label: 'Species Catalog', icon: <Leaf className="w-4 h-4" />, href: '/admin/species' },
      { id: 'photos', label: 'Photo Management', icon: <Image className="w-4 h-4" />, href: '/admin/photos' },
    ],
  },
  {
    id: 'spatial',
    label: 'Spatial Data',
    icon: <Map className="w-5 h-5" />,
    items: [
      { id: 'rasters', label: 'Raster Upload', icon: <Upload className="w-4 h-4" />, href: '/admin/rasters' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: <Settings className="w-5 h-5" />,
    items: [
      { id: 'aggregate-metrics', label: 'Aggregate Metrics', icon: <BarChart3 className="w-4 h-4" />, href: '/admin/aggregate-metrics' },
      { id: 'category-summaries', label: 'Category Summaries', icon: <FileText className="w-4 h-4" />, href: '/admin/category-summaries' },
      { id: 'migration', label: 'Data Migration', icon: <Database className="w-4 h-4" />, href: '/admin/migration' },
    ],
  },
];

const PROMINENT_LINK = {
  id: 'vector-draw',
  label: 'Vector Drawing',
  icon: <PenLine className="w-5 h-5" />,
  href: '/admin/vector-draw',
};

interface AdminSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function AdminSidebar({ collapsed = false, onCollapsedChange }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    NAVIGATION_GROUPS.map(g => g.id) // All expanded by default
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isItemActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => isItemActive(item.href));
  };

  return (
    <aside
      className={`
        bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-bold text-green-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">SerenaGreen 2.0</p>
          </div>
        )}
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {/* Prominent Vector Draw Link */}
        <Link
          href={PROMINENT_LINK.href}
          className={`
            flex items-center gap-3 px-3 py-3 mx-1 mb-4 rounded-lg transition font-medium
            ${pathname?.startsWith('/admin/vector-draw')
              ? 'bg-green-900 text-white'
              : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? PROMINENT_LINK.label : undefined}
        >
          <span className={pathname?.startsWith('/admin/vector-draw') ? 'text-green-200' : 'text-green-600'}>
            {PROMINENT_LINK.icon}
          </span>
          {!collapsed && <span>{PROMINENT_LINK.label}</span>}
        </Link>

        {NAVIGATION_GROUPS.map((group) => {
          const isExpanded = expandedGroups.includes(group.id);
          const groupActive = isGroupActive(group);

          return (
            <div key={group.id} className="mb-2">
              {/* Group Header */}
              <button
                onClick={() => !collapsed && toggleGroup(group.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition
                  ${groupActive ? 'bg-green-50 text-green-900' : 'text-gray-700 hover:bg-gray-100'}
                  ${collapsed ? 'justify-center' : 'justify-between'}
                `}
                title={collapsed ? group.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className={groupActive ? 'text-green-700' : 'text-gray-500'}>
                    {group.icon}
                  </span>
                  {!collapsed && (
                    <span className="text-sm font-medium">{group.label}</span>
                  )}
                </div>
                {!collapsed && (
                  <span className="text-gray-400">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </span>
                )}
              </button>

              {/* Group Items */}
              {!collapsed && isExpanded && (
                <div className="mt-1 ml-4 space-y-1">
                  {group.items.map((item) => {
                    const itemActive = isItemActive(item.href);

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition
                          ${itemActive
                            ? 'bg-green-900 text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                      >
                        <span className={itemActive ? 'text-green-200' : 'text-gray-400'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Collapsed mode - show items as tooltips on hover */}
              {collapsed && (
                <div className="mt-1 space-y-1">
                  {group.items.map((item) => {
                    const itemActive = isItemActive(item.href);

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`
                          flex items-center justify-center p-2 rounded-lg transition
                          ${itemActive
                            ? 'bg-green-900 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                          }
                        `}
                        title={item.label}
                      >
                        {item.icon}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-gray-200">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
    </aside>
  );
}

export { NAVIGATION_GROUPS };
