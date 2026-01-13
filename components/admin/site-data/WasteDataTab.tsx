"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Recycle, Search, Leaf, Factory } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import WasteDataFormModal from './WasteDataFormModal';
import {
  WasteData,
  listWasteData,
  deleteWasteData,
  getAvailableYears,
} from '@/lib/admin/siteDataApi';
import { listSites, Site } from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

export default function WasteDataTab() {
  const { showToast } = useToast();

  // Data state
  const [data, setData] = useState<WasteData[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingData, setEditingData] = useState<WasteData | null>(null);
  const [deletingData, setDeletingData] = useState<WasteData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterSiteId, setFilterSiteId] = useState<number | undefined>(undefined);
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [wasteData, sitesData] = await Promise.all([
        listWasteData({ siteId: filterSiteId, year: filterYear }),
        listSites(),
      ]);
      setData(wasteData);
      setSites(sitesData);
    } catch (error: any) {
      showToast(error.message || 'Failed to load waste data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterSiteId, filterYear]);

  // Filter by search
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.site?.name.toLowerCase().includes(query) ||
      item.year.toString().includes(query)
    );
  });

  // Handlers
  const handleCreateClick = () => {
    setEditingData(null);
    setShowFormModal(true);
  };

  const handleEditClick = (item: WasteData) => {
    setEditingData(item);
    setShowFormModal(true);
  };

  const handleDeleteClick = (item: WasteData) => {
    setDeletingData(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingData) return;

    setDeleting(true);
    try {
      await deleteWasteData(deletingData.id);
      showToast('Waste data deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingData(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete waste data', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Calculate totals
  const totalOrganicWaste = filteredData.reduce((sum, item) => sum + item.organicWaste, 0);
  const totalInorganicWaste = filteredData.reduce((sum, item) => sum + ((item as any).inorganicWaste || 0), 0);
  const totalWaste = filteredData.reduce((sum, item) => sum + ((item as any).totalWaste || item.organicWaste), 0);
  const totalCompostReceived = filteredData.reduce((sum, item) => sum + item.compostReceived, 0);
  const totalMethaneRecovered = filteredData.reduce((sum, item) => sum + (item.methaneRecovered || 0), 0);
  const totalMethaneSaved = filteredData.reduce((sum, item) => sum + ((item as any).methaneSaved || 0), 0);
  const totalCo2Equivalent = filteredData.reduce((sum, item) => sum + ((item as any).co2Equivalent || 0), 0);
  const totalLandfillDiverted = filteredData.reduce((sum, item) => sum + ((item as any).landfillDiverted || 0), 0);

  // Get years for filter (2019 to 2100)
  const years = [];
  for (let y = 2019; y <= 2100; y++) {
    years.push(y);
  }

  // Table columns
  const columns: Column<WasteData>[] = [
    {
      key: 'site',
      label: 'Site',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Recycle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{item.site?.name || '-'}</div>
            <div className="text-xs text-gray-500">{item.site?.category?.name || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'year',
      label: 'Year',
      sortable: true,
      render: (item) => (
        <Badge variant="default">{item.year}</Badge>
      ),
    },
    {
      key: 'organicWaste',
      label: 'Organic Waste',
      sortable: true,
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <span className="text-sm font-medium text-gray-900 block">
            {item.organicWaste.toLocaleString()} t
          </span>
          {(item as any).inorganicWaste && (
            <span className="text-xs text-gray-500">
              +{((item as any).inorganicWaste).toLocaleString()} t inorg.
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'compostReceived',
      label: 'Compost Received',
      sortable: true,
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <span className="text-sm text-green-700 block font-medium">
            {item.compostReceived.toLocaleString()} t
          </span>
          {(item as any).compostQuality && (
            <span className="text-xs text-gray-500">
              {(item as any).compostQuality}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'conversionRate',
      label: 'Conversion Rate',
      align: 'center',
      render: (item) => {
        const rate = item.organicWaste > 0
          ? ((item.compostReceived / item.organicWaste) * 100).toFixed(1)
          : '0';
        return (
          <Badge variant={Number(rate) >= 50 ? 'success' : Number(rate) >= 25 ? 'warning' : 'default'}>
            {rate}%
          </Badge>
        );
      },
    },
    {
      key: 'environmental',
      label: 'Environmental Impact',
      align: 'right',
      render: (item) => (
        <div className="text-right text-sm">
          {item.methaneRecovered && (
            <div className="text-blue-700">
              {item.methaneRecovered.toLocaleString()} m³ CH₄
            </div>
          )}
          {(item as any).methaneSaved && (
            <div className="text-green-700 text-xs">
              {((item as any).methaneSaved).toLocaleString()} kg saved
            </div>
          )}
          {(item as any).co2Equivalent && (
            <div className="text-emerald-700 text-xs">
              {((item as any).co2Equivalent).toLocaleString()} t CO₂ eq
            </div>
          )}
          {!item.methaneRecovered && !(item as any).methaneSaved && !(item as any).co2Equivalent && (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'landfillDiverted',
      label: 'Landfill Diverted',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="text-sm text-gray-700">
          {(item as any).landfillDiverted ? `${((item as any).landfillDiverted).toLocaleString()} t` : '-'}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-500">
          {new Date(item.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Waste Data"
        description="Manage organic waste and composting data by site and year"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Waste Data
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Recycle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
              <p className="text-sm text-gray-500">Records</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Factory className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalOrganicWaste.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Organic Waste (t)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCompostReceived.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Compost (t)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Factory className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalMethaneRecovered.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Methane (m³)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCo2Equivalent.toLocaleString()}</p>
              <p className="text-sm text-gray-500">CO₂ Saved (t)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Recycle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalLandfillDiverted.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Diverted (t)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by site name..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterSiteId || ''}
            onChange={(e) => setFilterSiteId(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            <option value="">All Sites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
          <select
            value={filterYear || ''}
            onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredData.length}</span> records
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyExtractor={(item) => item.id}
        loading={loading}
        emptyMessage="No waste data found. Add data to track composting."
        emptyIcon={<Recycle className="w-12 h-12 text-gray-300" />}
        actions={(item) => (
          <>
            <ActionButton
              onClick={() => handleEditClick(item)}
              icon={<Pencil className="w-4 h-4" />}
              label="Edit"
            />
            <ActionButton
              onClick={() => handleDeleteClick(item)}
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete"
              variant="danger"
            />
          </>
        )}
      />

      {/* Form Modal */}
      {showFormModal && (
        <WasteDataFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingData(null);
          }}
          onSuccess={fetchData}
          editingData={editingData}
          sites={sites}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Waste Data"
        message={`Are you sure you want to delete waste data for "${deletingData?.site?.name}" (${deletingData?.year})? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingData(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
