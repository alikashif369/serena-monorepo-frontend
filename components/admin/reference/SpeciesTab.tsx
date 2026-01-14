"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Leaf, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import SpeciesFormModal from './SpeciesFormModal';
import {
  Species,
  listSpecies,
  deleteSpecies,
  getSpeciesImages,
} from '@/lib/admin/speciesApi';
import { useToast } from '@/components/ToastContext';

export default function SpeciesTab() {
  const { showToast } = useToast();

  // State
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<Species | null>(null);
  const [deletingSpecies, setDeletingSpecies] = useState<Species | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await listSpecies(debouncedSearch || undefined);
      setSpecies(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load species', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch]);

  // Handlers
  const handleCreateClick = () => {
    setEditingSpecies(null);
    setShowFormModal(true);
  };

  const handleEditClick = (item: Species) => {
    setEditingSpecies(item);
    setShowFormModal(true);
  };

  const handleDeleteClick = (item: Species) => {
    setDeletingSpecies(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSpecies) return;

    setDeleting(true);
    try {
      await deleteSpecies(deletingSpecies.id);
      showToast('Species deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingSpecies(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete species', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Table columns
  const columns: Column<Species>[] = [
    {
      key: 'scientificName',
      label: 'Species',
      sortable: true,
      render: (item) => {
        const images = getSpeciesImages(item);
        return (
          <div className="flex items-center gap-4">
            {images.length > 0 ? (
              <div className="relative group">
                <img
                  src={images[0]}
                  alt={item.scientificName}
                  className="w-14 h-14 rounded-xl object-cover shadow-sm ring-2 ring-green-100 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center shadow-sm ring-2 ring-green-100">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="font-semibold text-gray-900 italic text-base mb-0.5">{item.scientificName}</div>
              {item.code && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-md">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium text-green-700">{item.code}</span>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'localName',
      label: 'Local Name',
      sortable: true,
      render: (item) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-800">{item.localName || '-'}</span>
          {item.englishName && (
            <span className="text-xs text-gray-500">{item.englishName}</span>
          )}
        </div>
      ),
    },
    {
      key: 'uses',
      label: 'Uses',
      render: (item) => (
        <div className="max-w-xs">
          {item.uses ? (
            <div className="flex flex-wrap gap-1">
              {item.uses.split(',').slice(0, 3).map((use, idx) => (
                <span key={idx} className="inline-block text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 font-medium">
                  {use.trim()}
                </span>
              ))}
              {item.uses.split(',').length > 3 && (
                <span className="inline-block text-[10px] text-gray-500 px-1">+{item.uses.split(',').length - 3}</span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'images',
      label: 'Images',
      align: 'center',
      render: (item) => {
        const count = getSpeciesImages(item).length;
        const percentage = (count / 4) * 100;
        return (
          <div className="flex flex-col items-center gap-2">
            <Badge variant={count === 4 ? 'success' : count > 0 ? 'warning' : 'default'}>
              {count}/4
            </Badge>
            {count > 0 && (
              <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    count === 4 ? 'bg-green-500' : count >= 2 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Species Catalog"
        description="Manage tree and plant species with scientific names, descriptions, and images"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Species
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, scientific name, local name, or English name..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
          />
        </div>
        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{species.length}</span> species
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={species}
        columns={columns}
        keyExtractor={(item) => item.id}
        loading={loading}
        emptyMessage="No species found. Add species to build your catalog."
        emptyIcon={<Leaf className="w-12 h-12 text-gray-300" />}
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
        <SpeciesFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingSpecies(null);
          }}
          onSuccess={fetchData}
          editingSpecies={editingSpecies}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Species"
        message={`Are you sure you want to delete "${deletingSpecies?.scientificName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingSpecies(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
