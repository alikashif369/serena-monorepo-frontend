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
  Menu,
  X,
  PenLine,
  Users,
  Database,
  BookOpen,
  Map,
  Settings
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
      { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" />, href: '/admin/users' },
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
    NAVIGATION_GROUPS.map(g => g.id)
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
        bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out shadow-sm
        ${collapsed ? 'w-20' : 'w-72'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-green-950 flex items-center justify-center text-serena-gold font-serif font-bold text-lg">
                S
             </div>
             <div>
                <h2 className="text-lg font-serif font-bold text-green-950 tracking-wide">Admin Panel</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Serena Green</p>
             </div>
          </div>
        )}
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className={`p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-green-950 transition ${collapsed ? 'mx-auto' : ''}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-200">
        {/* Prominent Vector Draw Link */}
        <Link
          href={PROMINENT_LINK.href}
          className={`
            flex items-center gap-3 px-3 py-3.5 mx-1 mb-6 rounded-lg transition-all group font-medium
            ${pathname?.startsWith('/admin/vector-draw')
              ? 'bg-green-950 text-white shadow-md shadow-green-900/20'
              : 'bg-white text-green-950 hover:bg-green-50 border border-green-100 hover:border-green-200'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? PROMINENT_LINK.label : undefined}
        >
          <span className={`${pathname?.startsWith('/admin/vector-draw') ? 'text-serena-gold' : 'text-green-700 group-hover:text-green-900'}`}>
            {PROMINENT_LINK.icon}
          </span>
          {!collapsed && <span>{PROMINENT_LINK.label}</span>}
        </Link>

        {NAVIGATION_GROUPS.map((group) => {
          const isExpanded = expandedGroups.includes(group.id);
          const groupActive = isGroupActive(group);

          return (
            <div key={group.id} className="mb-4">
              {/* Group Header */}
              <button
                onClick={() => !collapsed && toggleGroup(group.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${collapsed ? 'justify-center pointer-events-none' : 'justify-between hover:bg-gray-50'}
                `}
                title={collapsed ? group.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className={`
                    ${groupActive ? 'text-green-700' : 'text-gray-400'}
                  `}>
                    {group.icon}
                  </span>
                  {!collapsed && (
                    <span className={`text-sm font-semibold tracking-wide ${groupActive ? 'text-green-950' : 'text-gray-600'}`}>
                      {group.label}
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <ChevronDown
                    className={`w-4 h-4 text-gray-300 transition-transform duration-200 ${
                      isExpanded ? 'transform rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Group Items (Accordion) */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isExpanded && !collapsed ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="flex flex-col gap-0.5 ml-4 border-l border-gray-100 pl-3 py-1">
                  {group.items.map((item) => {
                    const active = isItemActive(item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all
                          ${active
                            ? 'bg-green-50 text-green-900 font-medium'
                            : 'text-gray-500 hover:text-green-800 hover:bg-gray-50'
                          }
                        `}
                      >
                         {/* Icons for items are optional/small */}
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer User Profile (Collapsed) */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
               <Users className="w-4 h-4" />
           </div>
           {!collapsed && (
               <div className="flex-1 min-w-0">
                   <p className="text-xs font-medium text-gray-900 truncate">Admin User</p>
                   <p className="text-[10px] text-gray-400 truncate">admin@serena.com</p>
               </div>
           )}
           {!collapsed && (
               <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
           )}
        </div>
      </div>
    </aside>
  );
}
