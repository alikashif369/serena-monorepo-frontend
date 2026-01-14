"use client";

import { useState, useEffect } from 'react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
} from '@/components/admin/shared/FormModal';
import {
  Species,
  CreateSpeciesData,
  createSpecies,
  updateSpecies,
  generateSpeciesCode,
} from '@/lib/admin/speciesApi';
import { useToast } from '@/components/ToastContext';

interface SpeciesFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSpecies: Species | null;
}

export default function SpeciesFormModal({
  open,
  onClose,
  onSuccess,
  editingSpecies,
}: SpeciesFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!editingSpecies;

  // Form state
  const [formData, setFormData] = useState<CreateSpeciesData>({
    code: '',
    scientificName: '',
    botanicalName: '',
    localName: '',
    englishName: '',
    description: '',
    uses: '',
    image1Url: '',
    image2Url: '',
    image3Url: '',
    image4Url: '',
  });
  const [autoCode, setAutoCode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  useEffect(() => {
    if (editingSpecies) {
      setFormData({
        code: editingSpecies.code || '',
        scientificName: editingSpecies.scientificName,
        botanicalName: editingSpecies.botanicalName || editingSpecies.scientificName,
        localName: editingSpecies.localName,
        englishName: editingSpecies.englishName,
        description: editingSpecies.description,
        uses: editingSpecies.uses,
        image1Url: editingSpecies.image1Url || '',
        image2Url: editingSpecies.image2Url || '',
        image3Url: editingSpecies.image3Url || '',
        image4Url: editingSpecies.image4Url || '',
      });
      setAutoCode(false);
    } else {
      setFormData({
        code: '',
        scientificName: '',
        botanicalName: '',
        localName: '',
        englishName: '',
        description: '',
        uses: '',
        image1Url: '',
        image2Url: '',
        image3Url: '',
        image4Url: '',
      });
      setAutoCode(true);
    }
    setErrors({});
  }, [editingSpecies, open]);

  // Auto-generate code from scientific name
  useEffect(() => {
    if (autoCode && formData.scientificName) {
      setFormData((prev) => ({
        ...prev,
        code: generateSpeciesCode(prev.scientificName),
      }));
    }
  }, [formData.scientificName, autoCode]);

  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }

    if (!formData.scientificName.trim()) {
      newErrors.scientificName = 'Scientific name is required';
    }

    if (!formData.localName.trim()) {
      newErrors.localName = 'Local name is required';
    }

    if (!formData.englishName.trim()) {
      newErrors.englishName = 'English name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.uses.trim()) {
      newErrors.uses = 'Uses is required';
    }

    // Image validations - all 4 are now required
    if (!formData.image1Url.trim()) {
      newErrors.image1Url = 'Habitat image URL is required';
    } else if (!isValidUrl(formData.image1Url)) {
      newErrors.image1Url = 'Please enter a valid URL';
    }

    if (!formData.image2Url.trim()) {
      newErrors.image2Url = 'Leaf image URL is required';
    } else if (!isValidUrl(formData.image2Url)) {
      newErrors.image2Url = 'Please enter a valid URL';
    }

    if (!formData.image3Url.trim()) {
      newErrors.image3Url = 'Bark image URL is required';
    } else if (!isValidUrl(formData.image3Url)) {
      newErrors.image3Url = 'Please enter a valid URL';
    }

    if (!formData.image4Url.trim()) {
      newErrors.image4Url = 'Seed/Flower image URL is required';
    } else if (!isValidUrl(formData.image4Url)) {
      newErrors.image4Url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('formData:', formData);
    
    if (!validate()) {
      console.log('Validation failed - showing error toast');
      showToast('Please fill in all required fields', 'error');
      return;
    }

    console.log('Validation passed, submitting...');
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        botanicalName: formData.botanicalName || formData.scientificName,
        // All 4 images are now required - no fallbacks needed
      };

      if (isEditing) {
        await updateSpecies(editingSpecies.id, submitData);
        showToast('Species updated successfully', 'success');
      } else {
        await createSpecies(submitData);
        showToast('Species created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save species', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = (field: keyof CreateSpeciesData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Species' : 'Add Species'}
      description={
        isEditing
          ? 'Update the species information.'
          : 'Enter details for a new species entry.'
      }
      size="xl"
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? 'Save Changes' : 'Add Species'}
          loading={loading}
        />
      }
    >
      <div className="space-y-6">
        {/* Naming */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Scientific Name" htmlFor="species-scientific" required error={errors.scientificName}>
            <input
              id="species-scientific"
              type="text"
              value={formData.scientificName}
              onChange={(e) => handleChange('scientificName', e.target.value)}
              className={`${inputClassName} italic`}
              placeholder="e.g., Pinus wallichiana"
              disabled={loading}
            />
          </FormField>

          <FormField
            label="Species Code"
            htmlFor="species-code"
            required
            error={errors.code}
            hint={autoCode ? 'Auto-generated' : 'Custom'}
          >
            <div className="flex gap-2">
              <input
                id="species-code"
                type="text"
                value={formData.code}
                onChange={(e) => {
                  setAutoCode(false);
                  handleChange('code', e.target.value.toUpperCase());
                }}
                className={inputClassName}
                placeholder="e.g., PINWAL"
                disabled={loading}
              />
              {!autoCode && (
                <button
                  type="button"
                  onClick={() => {
                    setAutoCode(true);
                    if (formData.scientificName) {
                      setFormData((prev) => ({
                        ...prev,
                        code: generateSpeciesCode(prev.scientificName),
                      }));
                    }
                  }}
                  className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition whitespace-nowrap"
                >
                  Auto
                </button>
              )}
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Local Name" htmlFor="species-local" required error={errors.localName}>
            <input
              id="species-local"
              type="text"
              value={formData.localName}
              onChange={(e) => handleChange('localName', e.target.value)}
              className={inputClassName}
              placeholder="e.g., Kail"
              disabled={loading}
            />
          </FormField>

          <FormField label="English Name" htmlFor="species-english" required error={errors.englishName}>
            <input
              id="species-english"
              type="text"
              value={formData.englishName}
              onChange={(e) => handleChange('englishName', e.target.value)}
              className={inputClassName}
              placeholder="e.g., Blue Pine"
              disabled={loading}
            />
          </FormField>
        </div>

        {/* Description & Uses */}
        <FormField label="Description" htmlFor="species-description" required error={errors.description}>
          <textarea
            id="species-description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`${inputClassName} h-24 resize-none`}
            placeholder="Describe the species, its characteristics, habitat, etc."
            disabled={loading}
          />
        </FormField>

        <FormField label="Uses" htmlFor="species-uses" required error={errors.uses}>
          <textarea
            id="species-uses"
            value={formData.uses}
            onChange={(e) => handleChange('uses', e.target.value)}
            className={`${inputClassName} h-24 resize-none`}
            placeholder="Describe the uses of this species (timber, medicine, etc.)"
            disabled={loading}
          />
        </FormField>

        {/* Images */}
        <div className="bg-emerald-50 rounded-lg p-4 space-y-4 border border-emerald-100">
          <h3 className="text-sm font-semibold text-gray-900">Reference Images (Required)</h3>
          <p className="text-xs text-gray-600">All 4 reference images are required to ensure comprehensive species documentation</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Image 1 (Habitat)" htmlFor="species-img1" required error={errors.image1Url}>
              <input
                id="species-img1"
                type="url"
                value={formData.image1Url}
                onChange={(e) => handleChange('image1Url', e.target.value)}
                className={inputClassName}
                placeholder="https://... (habitat view)"
                disabled={loading}
                required
              />
            </FormField>

            <FormField label="Image 2 (Leaf)" htmlFor="species-img2" required error={errors.image2Url}>
              <input
                id="species-img2"
                type="url"
                value={formData.image2Url}
                onChange={(e) => handleChange('image2Url', e.target.value)}
                className={inputClassName}
                placeholder="https://... (leaf close-up)"
                disabled={loading}
                required
              />
            </FormField>

            <FormField label="Image 3 (Bark)" htmlFor="species-img3" required error={errors.image3Url}>
              <input
                id="species-img3"
                type="url"
                value={formData.image3Url}
                onChange={(e) => handleChange('image3Url', e.target.value)}
                className={inputClassName}
                placeholder="https://... (bark texture)"
                disabled={loading}
                required
              />
            </FormField>

            <FormField label="Image 4 (Seed/Flower)" htmlFor="species-img4" required error={errors.image4Url}>
              <input
                id="species-img4"
                type="url"
                value={formData.image4Url}
                onChange={(e) => handleChange('image4Url', e.target.value)}
                className={inputClassName}
                placeholder="https://... (seed/flower)"
                disabled={loading}
                required
              />
            </FormField>
          </div>

          {/* Image Previews with Labels */}
          {(formData.image1Url || formData.image2Url || formData.image3Url || formData.image4Url) && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { url: formData.image1Url, label: 'Habitat' },
                { url: formData.image2Url, label: 'Leaf' },
                { url: formData.image3Url, label: 'Bark' },
                { url: formData.image4Url, label: 'Seed/Flower' }
              ].map((img, i) => (
                <div key={i} className="space-y-1">
                  {img.url && (
                    <>
                      <img
                        src={img.url}
                        alt={img.label}
                        className="w-full aspect-square rounded-lg object-cover border-2 border-emerald-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-center text-gray-600 font-medium">{img.label}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
}
