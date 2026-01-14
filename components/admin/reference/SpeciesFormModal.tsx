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
  uploadSpeciesReferenceImage,
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
  const [uploadProgress, setUploadProgress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // File upload state
  const [imageFiles, setImageFiles] = useState<{
    image1: File | null;
    image2: File | null;
    image3: File | null;
    image4: File | null;
  }>({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const [imagePreviews, setImagePreviews] = useState<{
    image1: string | null;
    image2: string | null;
    image3: string | null;
    image4: string | null;
  }>({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

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

    // Clear file state and previews
    setImageFiles({
      image1: null,
      image2: null,
      image3: null,
      image4: null,
    });
    setImagePreviews({
      image1: null,
      image2: null,
      image3: null,
      image4: null,
    });
    setUploadProgress('');
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

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreviews.image1) URL.revokeObjectURL(imagePreviews.image1);
      if (imagePreviews.image2) URL.revokeObjectURL(imagePreviews.image2);
      if (imagePreviews.image3) URL.revokeObjectURL(imagePreviews.image3);
      if (imagePreviews.image4) URL.revokeObjectURL(imagePreviews.image4);
    };
  }, [imagePreviews]);

  // File handling functions
  const handleFileSelect = (imageNum: 1 | 2 | 3 | 4, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const imageKey = `image${imageNum}` as keyof typeof imageFiles;

    if (!file) {
      // Clear the file
      setImageFiles(prev => ({ ...prev, [imageKey]: null }));
      if (imagePreviews[imageKey]) {
        URL.revokeObjectURL(imagePreviews[imageKey]!);
        setImagePreviews(prev => ({ ...prev, [imageKey]: null }));
      }
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please select a valid image file (JPEG, PNG, or WEBP)', 'error');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('Image size must be less than 10MB', 'error');
      return;
    }

    // Update file and create preview
    setImageFiles(prev => ({ ...prev, [imageKey]: file }));

    // Revoke old preview URL if exists
    if (imagePreviews[imageKey]) {
      URL.revokeObjectURL(imagePreviews[imageKey]!);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreviews(prev => ({ ...prev, [imageKey]: previewUrl }));

    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`image${imageNum}Url`];
      return newErrors;
    });
  };

  const removeImage = (imageNum: 1 | 2 | 3 | 4) => {
    const imageKey = `image${imageNum}` as keyof typeof imageFiles;

    setImageFiles(prev => ({ ...prev, [imageKey]: null }));
    if (imagePreviews[imageKey]) {
      URL.revokeObjectURL(imagePreviews[imageKey]!);
      setImagePreviews(prev => ({ ...prev, [imageKey]: null }));
    }

    // Clear the URL as well
    setFormData(prev => ({ ...prev, [`image${imageNum}Url`]: '' }));
  };

  const uploadImageFile = async (file: File): Promise<string> => {
    try {
      const result = await uploadSpeciesReferenceImage(file);
      return result.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
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

    // Image validations - all 4 are now required (either file upload or existing URL)
    if (!formData.image1Url.trim() && !imageFiles.image1) {
      newErrors.image1Url = 'Habitat image is required';
    }

    if (!formData.image2Url.trim() && !imageFiles.image2) {
      newErrors.image2Url = 'Leaf image is required';
    }

    if (!formData.image3Url.trim() && !imageFiles.image3) {
      newErrors.image3Url = 'Bark image is required';
    }

    if (!formData.image4Url.trim() && !imageFiles.image4) {
      newErrors.image4Url = 'Seed/Flower image is required';
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
      // Prepare list of files to upload
      const filesToUpload: Array<{ file: File; imageNum: number }> = [];

      if (imageFiles.image1) filesToUpload.push({ file: imageFiles.image1, imageNum: 1 });
      if (imageFiles.image2) filesToUpload.push({ file: imageFiles.image2, imageNum: 2 });
      if (imageFiles.image3) filesToUpload.push({ file: imageFiles.image3, imageNum: 3 });
      if (imageFiles.image4) filesToUpload.push({ file: imageFiles.image4, imageNum: 4 });

      // Upload files sequentially to avoid rate limiting
      if (filesToUpload.length > 0) {
        const updatedFormData = { ...formData };

        for (let i = 0; i < filesToUpload.length; i++) {
          const { file, imageNum } = filesToUpload[i];

          // Update progress message
          setUploadProgress(`Uploading image ${i + 1} of ${filesToUpload.length}...`);

          // Upload the file
          const url = await uploadImageFile(file);

          // Store the URL
          (updatedFormData as any)[`image${imageNum}Url`] = url;

          // Small delay to avoid rate limiting (400ms between uploads)
          if (i < filesToUpload.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 400));
          }
        }

        setFormData(updatedFormData);
        setUploadProgress('');

        // Use updated data for submission
        const submitData = {
          ...updatedFormData,
          botanicalName: updatedFormData.botanicalName || updatedFormData.scientificName,
        };

        if (isEditing) {
          await updateSpecies(editingSpecies.id, submitData);
          showToast('Species updated successfully', 'success');
        } else {
          await createSpecies(submitData);
          showToast('Species created successfully', 'success');
        }
      } else {
        // No files to upload, proceed directly
        const submitData = {
          ...formData,
          botanicalName: formData.botanicalName || formData.scientificName,
        };

        if (isEditing) {
          await updateSpecies(editingSpecies.id, submitData);
          showToast('Species updated successfully', 'success');
        } else {
          await createSpecies(submitData);
          showToast('Species created successfully', 'success');
        }
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
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Reference Images (Required)</h3>
            <p className="text-xs text-gray-600">Upload 4 reference images for comprehensive species documentation</p>
            {uploadProgress && (
              <p className="text-xs text-blue-600 font-medium mt-1">{uploadProgress}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image 1 - Habitat */}
            <FormField label="Image 1 (Habitat)" htmlFor="species-img1" required error={errors.image1Url}>
              <div className="space-y-2">
                <input
                  id="species-img1"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileSelect(1, e)}
                  className={`${inputClassName} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`}
                  disabled={loading}
                />
                {(imagePreviews.image1 || formData.image1Url) && (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreviews.image1 || formData.image1Url}
                      alt="Habitat preview"
                      className="w-full h-full object-cover rounded-lg border-2 border-emerald-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(1)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      disabled={loading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </FormField>

            {/* Image 2 - Leaf */}
            <FormField label="Image 2 (Leaf)" htmlFor="species-img2" required error={errors.image2Url}>
              <div className="space-y-2">
                <input
                  id="species-img2"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileSelect(2, e)}
                  className={`${inputClassName} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`}
                  disabled={loading}
                />
                {(imagePreviews.image2 || formData.image2Url) && (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreviews.image2 || formData.image2Url}
                      alt="Leaf preview"
                      className="w-full h-full object-cover rounded-lg border-2 border-emerald-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(2)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      disabled={loading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </FormField>

            {/* Image 3 - Bark */}
            <FormField label="Image 3 (Bark)" htmlFor="species-img3" required error={errors.image3Url}>
              <div className="space-y-2">
                <input
                  id="species-img3"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileSelect(3, e)}
                  className={`${inputClassName} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`}
                  disabled={loading}
                />
                {(imagePreviews.image3 || formData.image3Url) && (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreviews.image3 || formData.image3Url}
                      alt="Bark preview"
                      className="w-full h-full object-cover rounded-lg border-2 border-emerald-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(3)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      disabled={loading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </FormField>

            {/* Image 4 - Seed/Flower */}
            <FormField label="Image 4 (Seed/Flower)" htmlFor="species-img4" required error={errors.image4Url}>
              <div className="space-y-2">
                <input
                  id="species-img4"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileSelect(4, e)}
                  className={`${inputClassName} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100`}
                  disabled={loading}
                />
                {(imagePreviews.image4 || formData.image4Url) && (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreviews.image4 || formData.image4Url}
                      alt="Seed/Flower preview"
                      className="w-full h-full object-cover rounded-lg border-2 border-emerald-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(4)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      disabled={loading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </FormField>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
