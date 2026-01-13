"use client";

import { useState, useRef } from 'react';
import { Upload, X, Image, FileImage, CheckCircle, XCircle } from 'lucide-react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
} from '@/components/admin/shared/FormModal';
import {
  PhotoCategory,
  UploadPhotoData,
  uploadPhoto,
} from '@/lib/admin/photosApi';
import { Site } from '@/lib/admin/hierarchyApi';
import { Species } from '@/lib/admin/speciesApi';
import { useToast } from '@/components/ToastContext';

interface PhotoUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sites: Site[];
  speciesList: Species[];
}

interface FileWithPreview {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function PhotoUploadModal({
  open,
  onClose,
  onSuccess,
  sites,
  speciesList,
}: PhotoUploadModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<UploadPhotoData, 'file'>>({
    category: 'SITE',
    siteId: undefined,
    speciesId: undefined,
    year: new Date().getFullYear(),
    latitude: undefined,
    longitude: undefined,
    caption: '',
    description: '',
    tags: [],
  });
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  // Reset form when modal opens/closes
  const resetForm = () => {
    setFormData({
      category: 'SITE',
      siteId: undefined,
      speciesId: undefined,
      year: new Date().getFullYear(),
      latitude: undefined,
      longitude: undefined,
      caption: '',
      description: '',
      tags: [],
    });
    selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setTagsInput('');
    setErrors({});
  };

  // Handle file selection
  const handleFileSelect = (files: FileList) => {
    const validFiles: FileWithPreview[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast(`${file.name} is not an image file`, 'error');
        return;
      }

      if (file.size > maxSize) {
        showToast(`${file.name} exceeds 10MB limit`, 'error');
        return;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        status: 'pending',
      });
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setErrors((prev) => ({ ...prev, file: '' }));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (selectedFiles.length === 0) {
      newErrors.file = 'Please select at least one photo to upload';
    }

    if ((formData.category === 'EVENT' || formData.category === 'SITE' || formData.category === 'COMMUNITY') && !formData.siteId) {
      newErrors.siteId = 'Site is required for Event/Site/Community photos';
    }

    if (formData.category === 'SPECIES' && !formData.speciesId) {
      newErrors.speciesId = 'Species is required for Species photos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit - Upload all files
  const handleSubmit = async () => {
    if (!validate() || selectedFiles.length === 0) return;

    setUploading(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let successCount = 0;
    let failCount = 0;

    // Upload files one by one
    for (let i = 0; i < selectedFiles.length; i++) {
      const fileWithPreview = selectedFiles[i];
      
      // Update status to uploading
      setSelectedFiles(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'uploading' };
        return updated;
      });

      try {
        await uploadPhoto({
          ...formData,
          tags,
          file: fileWithPreview.file,
        });

        // Update status to success
        setSelectedFiles(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'success' };
          return updated;
        });
        
        successCount++;
      } catch (error: any) {
        // Update status to error
        setSelectedFiles(prev => {
          const updated = [...prev];
          updated[i] = { 
            ...updated[i], 
            status: 'error',
            error: error.message || 'Upload failed'
          };
          return updated;
        });
        
        failCount++;
      }
    }

    setUploading(false);
    
    if (successCount > 0) {
      showToast(
        `${successCount} photo${successCount > 1 ? 's' : ''} uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        failCount > 0 ? 'warning' : 'success'
      );
      onSuccess();
      
      if (failCount === 0) {
        resetForm();
        onClose();
      }
    } else {
      showToast('All uploads failed', 'error');
    }
  };

  // Handle field changes
  const handleChange = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryChange = (category: PhotoCategory) => {
    setFormData((prev) => ({
      ...prev,
      category,
      siteId: category === 'SPECIES' ? undefined : prev.siteId,
      speciesId: category === 'SPECIES' ? prev.speciesId : undefined,
    }));
    setErrors({});
  };

  return (
    <FormModal
      open={open}
      onClose={() => {
        if (!uploading) {
          resetForm();
          onClose();
        }
      }}
      title="Upload Photos"
      description={`Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} ` : ''}photo${selectedFiles.length !== 1 ? 's' : ''} with metadata and categorization`}
      size="xl"
      loading={uploading}
      footer={
        <FormModalFooter
          onCancel={() => {
            if (!uploading) {
              resetForm();
              onClose();
            }
          }}
          onSubmit={handleSubmit}
          submitLabel={selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Photos` : 'Upload Photo'}
          loading={uploading}
          disabled={uploading}
        />
      }
    >
      <div className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Photos <span className="text-red-500">*</span>
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-green-500 bg-green-50'
                : errors.file
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedFiles.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                  {selectedFiles.map((fileWithPreview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={fileWithPreview.preview}
                        alt={fileWithPreview.file.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {/* Status overlay */}
                      {fileWithPreview.status !== 'pending' && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          {fileWithPreview.status === 'uploading' && (
                            <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full" />
                          )}
                          {fileWithPreview.status === 'success' && (
                            <CheckCircle className="w-8 h-8 text-green-400" />
                          )}
                          {fileWithPreview.status === 'error' && (
                            <XCircle className="w-8 h-8 text-red-400" />
                          )}
                        </div>
                      )}
                      {/* Remove button (only for pending files) */}
                      {fileWithPreview.status === 'pending' && !uploading && (
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <p className="mt-1 text-xs text-gray-600 truncate">{fileWithPreview.file.name}</p>
                      {fileWithPreview.error && (
                        <p className="text-xs text-red-500 truncate" title={fileWithPreview.error}>
                          {fileWithPreview.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-green-900 text-white text-sm rounded-lg hover:bg-green-800 transition inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Add More Photos
                  </button>
                )}
              </div>
            ) : (
              <>
                <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop photos here, or click to select
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-green-900 text-white text-sm rounded-lg hover:bg-green-800 transition inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Select Photos
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Supports JPEG, PNG, WebP (max 10MB per file). You can select multiple files.
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="hidden"
              multiple
              disabled={uploading}
            />
          </div>
          {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
        </div>

        {/* Category Selection */}
        <FormField label="Category" htmlFor="photo-category" required>
          <div className="flex gap-2">
            {(['EVENT', 'SITE', 'SPECIES', 'COMMUNITY'] as PhotoCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition ${
                  formData.category === cat
                    ? 'bg-green-900 text-white border-green-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat === 'EVENT' ? 'Event' : cat === 'SITE' ? 'Site' : cat === 'SPECIES' ? 'Species' : 'Community'}
              </button>
            ))}
          </div>
        </FormField>

        {/* Site/Species Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(formData.category === 'EVENT' || formData.category === 'SITE' || formData.category === 'COMMUNITY') && (
            <FormField label="Site" htmlFor="photo-site" required error={errors.siteId}>
              <select
                id="photo-site"
                value={formData.siteId || ''}
                onChange={(e) => handleChange('siteId', e.target.value ? parseInt(e.target.value) : undefined)}
                className={inputClassName}
                disabled={uploading}
              >
                <option value="">Select a site...</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {formData.category === 'SPECIES' && (
            <FormField label="Species" htmlFor="photo-species" required error={errors.speciesId}>
              <select
                id="photo-species"
                value={formData.speciesId || ''}
                onChange={(e) => handleChange('speciesId', e.target.value ? parseInt(e.target.value) : undefined)}
                className={inputClassName}
                disabled={uploading}
              >
                <option value="">Select a species...</option>
                {speciesList.map((species) => (
                  <option key={species.id} value={species.id}>
                    {species.scientificName} ({species.localName})
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {(formData.category === 'EVENT' || formData.category === 'SITE' || formData.category === 'COMMUNITY') && (
            <FormField label="Year" htmlFor="photo-year">
              <input
                id="photo-year"
                type="number"
                value={formData.year || ''}
                onChange={(e) => handleChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                className={inputClassName}
                placeholder="e.g., 2024"
                min={2019}
                max={2100}
                disabled={uploading}
              />
            </FormField>
          )}
        </div>

        {/* Caption & Description */}
        <FormField label="Caption" htmlFor="photo-caption">
          <input
            id="photo-caption"
            type="text"
            value={formData.caption || ''}
            onChange={(e) => handleChange('caption', e.target.value)}
            className={inputClassName}
            placeholder="Brief caption for the photo"
            disabled={uploading}
          />
        </FormField>

        <FormField label="Description" htmlFor="photo-description">
          <textarea
            id="photo-description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`${inputClassName} h-20 resize-none`}
            placeholder="Detailed description of the photo..."
            disabled={uploading}
          />
        </FormField>

        {/* Geolocation */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Geolocation (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Latitude" htmlFor="photo-lat">
              <input
                id="photo-lat"
                type="number"
                step="any"
                value={formData.latitude ?? ''}
                onChange={(e) => handleChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={inputClassName}
                placeholder="e.g., 35.3095"
                disabled={uploading}
              />
            </FormField>
            <FormField label="Longitude" htmlFor="photo-lng">
              <input
                id="photo-lng"
                type="number"
                step="any"
                value={formData.longitude ?? ''}
                onChange={(e) => handleChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={inputClassName}
                placeholder="e.g., 75.6927"
                disabled={uploading}
              />
            </FormField>
          </div>
        </div>

        {/* Tags */}
        <FormField label="Tags" htmlFor="photo-tags" hint="Separate tags with commas">
          <input
            id="photo-tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className={inputClassName}
            placeholder="e.g., plantation, trees, 2024, spring"
            disabled={uploading}
          />
        </FormField>
      </div>
    </FormModal>
  );
}
