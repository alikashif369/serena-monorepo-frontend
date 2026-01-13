"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Image, Search, Grid, List, Eye, Pencil, X, MapPin, Calendar } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import { Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import PhotoUploadModal from './PhotoUploadModal';
import PhotoEditModal from './PhotoEditModal';
import {
  Photo,
  PhotoCategory,
  PhotoFilters,
  listPhotos,
  deletePhoto,
  formatFileSize,
  getCategoryLabel,
  getCategoryColor,
} from '@/lib/admin/photosApi';
import { listSites, Site } from '@/lib/admin/hierarchyApi';
import { listSpecies, Species } from '@/lib/admin/speciesApi';
import { useToast } from '@/components/ToastContext';

type ViewMode = 'grid' | 'list';

export default function PhotosTab() {
  const { showToast } = useToast();

  // Data state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filters, setFilters] = useState<PhotoFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [sitesData, speciesData] = await Promise.all([
          listSites(),
          listSpecies(),
        ]);
        setSites(sitesData);
        setSpeciesList(speciesData);
      } catch (error: any) {
        console.error('Failed to load reference data:', error);
      }
    };
    loadReferenceData();
  }, []);

  // Fetch photos
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await listPhotos(filters);
      setPhotos(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load photos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Filter photos by search query (client-side)
  const filteredPhotos = photos.filter((photo) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      photo.caption?.toLowerCase().includes(query) ||
      photo.description?.toLowerCase().includes(query) ||
      photo.originalFileName.toLowerCase().includes(query) ||
      photo.tags.some(tag => tag.toLowerCase().includes(query)) ||
      photo.site?.name.toLowerCase().includes(query) ||
      photo.species?.botanicalName?.toLowerCase().includes(query)
    );
  });

  // Handlers
  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleEditClick = (photo: Photo) => {
    setEditingPhoto(photo);
    setShowEditModal(true);
  };

  const handleDeleteClick = (photo: Photo) => {
    setDeletingPhoto(photo);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPhoto) return;

    setDeleting(true);
    try {
      await deletePhoto(deletingPhoto.id);
      showToast('Photo deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingPhoto(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete photo', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowLightbox(true);
  };

  // Get unique years from photos
  const years = Array.from(new Set(photos.map(p => p.year).filter(Boolean))).sort((a, b) => b! - a!);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Photo Gallery"
        description="Upload and manage photos for sites, events, communities, and species - use them across your dashboard"
        actions={
          <button
            onClick={handleUploadClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Photos
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
          <Image className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-900 font-medium mb-1">Photo Management</p>
            <p className="text-blue-700">
              Upload photos for your sites, events, communities, and species. These photos can be used throughout your dashboard and public pages. 
              Supports bulk upload with drag & drop.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by caption, description, filename, or tags..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-green-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-green-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <select
            value={filters.category || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as PhotoCategory || undefined }))}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="EVENT">Event</option>
            <option value="SITE">Site</option>
            <option value="SPECIES">Species</option>
          </select>

          {/* Site Filter */}
          <select
            value={filters.siteId || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, siteId: e.target.value ? parseInt(e.target.value) : undefined }))}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            <option value="">All Sites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>

          {/* Species Filter */}
          <select
            value={filters.speciesId || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, speciesId: e.target.value ? parseInt(e.target.value) : undefined }))}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            <option value="">All Species</option>
            {speciesList.map((species) => (
              <option key={species.id} value={species.id}>{species.scientificName}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={filters.year || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : undefined }))}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {(filters.category || filters.siteId || filters.speciesId || filters.year) && (
            <button
              onClick={() => setFilters({})}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredPhotos.length}</span> of {photos.length} photos
        </div>
      </div>

      {/* Photo Grid/List */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading photos...</p>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No photos found. Upload photos to get started.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPhotos.map((photo) => (
            <PhotoGridCard
              key={photo.id}
              photo={photo}
              onView={() => handleViewPhoto(photo)}
              onEdit={() => handleEditClick(photo)}
              onDelete={() => handleDeleteClick(photo)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
          {filteredPhotos.map((photo) => (
            <PhotoListRow
              key={photo.id}
              photo={photo}
              onView={() => handleViewPhoto(photo)}
              onEdit={() => handleEditClick(photo)}
              onDelete={() => handleDeleteClick(photo)}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <PhotoUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchData}
        sites={sites}
        speciesList={speciesList}
      />

      {/* Edit Modal */}
      {showEditModal && editingPhoto && (
        <PhotoEditModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPhoto(null);
          }}
          onSuccess={fetchData}
          photo={editingPhoto}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Photo"
        message={`Are you sure you want to delete "${deletingPhoto?.caption || deletingPhoto?.originalFileName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingPhoto(null);
        }}
        loading={deleting}
      />

      {/* Lightbox */}
      {showLightbox && selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          onClose={() => {
            setShowLightbox(false);
            setSelectedPhoto(null);
          }}
          onEdit={() => {
            setShowLightbox(false);
            handleEditClick(selectedPhoto);
          }}
          onDelete={() => {
            setShowLightbox(false);
            handleDeleteClick(selectedPhoto);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface PhotoGridCardProps {
  photo: Photo;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PhotoGridCard({ photo, onView, onEdit, onDelete }: PhotoGridCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative aspect-square">
        <img
          src={photo.minioUrl}
          alt={photo.caption || photo.originalFileName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-image.png';
          }}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onView}
            className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition"
            title="View Full Image"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition"
            title="Edit Metadata"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition"
            title="Delete Photo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-0.5 text-xs font-medium rounded shadow-sm ${getCategoryColor(photo.category)}`}>
            {getCategoryLabel(photo.category)}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate" title={photo.caption || photo.originalFileName}>
          {photo.caption || photo.originalFileName}
        </p>
        <p className="text-xs text-gray-500 mt-1 truncate" title={photo.site?.name || photo.species?.botanicalName || '-'}>
          {photo.site?.name || photo.species?.botanicalName || '-'}
        </p>
        <div className="flex items-center justify-between mt-2">
          {photo.year && (
            <p className="text-xs text-gray-400">{photo.year}</p>
          )}
          {photo.tags.length > 0 && (
            <span className="text-xs text-gray-400">{photo.tags.length} tag{photo.tags.length > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface PhotoListRowProps {
  photo: Photo;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PhotoListRow({ photo, onView, onEdit, onDelete }: PhotoListRowProps) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50">
      <img
        src={photo.minioUrl}
        alt={photo.caption || photo.originalFileName}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder-image.png';
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(photo.category)}`}>
            {getCategoryLabel(photo.category)}
          </span>
          <span className="text-sm font-medium text-gray-900 truncate">
            {photo.caption || photo.originalFileName}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          {photo.site && <span>{photo.site.name}</span>}
          {photo.species && <span className="italic">{photo.species.botanicalName}</span>}
          {photo.year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {photo.year}
            </span>
          )}
          {photo.latitude && photo.longitude && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
            </span>
          )}
          <span>{formatFileSize(photo.fileSize)}</span>
        </div>
        {photo.tags.length > 0 && (
          <div className="flex gap-1 mt-2">
            {photo.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {tag}
              </span>
            ))}
            {photo.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{photo.tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface PhotoLightboxProps {
  photo: Photo;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PhotoLightbox({ photo, onClose, onEdit, onDelete }: PhotoLightboxProps) {
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Actions */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm flex items-center gap-2"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Image */}
      <div className="max-w-5xl max-h-[80vh] relative">
        <img
          src={photo.minioUrl}
          alt={photo.caption || photo.originalFileName}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>

      {/* Info panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="max-w-3xl mx-auto text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(photo.category)}`}>
              {getCategoryLabel(photo.category)}
            </span>
            {photo.year && <span className="text-sm text-white/70">{photo.year}</span>}
          </div>
          {photo.caption && (
            <h3 className="text-lg font-medium mb-1">{photo.caption}</h3>
          )}
          {photo.description && (
            <p className="text-sm text-white/80 mb-2">{photo.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-white/60">
            {photo.site && <span>{photo.site.name}</span>}
            {photo.species && <span className="italic">{photo.species.botanicalName}</span>}
            {photo.latitude && photo.longitude && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
              </span>
            )}
            <span>{formatFileSize(photo.fileSize)}</span>
            <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
          </div>
          {photo.tags.length > 0 && (
            <div className="flex gap-1 mt-3">
              {photo.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 text-xs bg-white/20 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
