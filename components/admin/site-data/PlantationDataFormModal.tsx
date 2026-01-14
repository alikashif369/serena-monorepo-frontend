"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
  selectClassName,
} from '@/components/admin/shared/FormModal';
import {
  PlantationData,
  CreatePlantationData,
  createPlantationData,
  updatePlantationData,
} from '@/lib/admin/siteDataApi';
import {
  Site,
  Category,
  Region,
  Organization,
} from '@/lib/admin/hierarchyApi';
import { Species, listSpecies } from '@/lib/admin/speciesApi';
import { useToast } from '@/components/ToastContext';

interface PlantationDataFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingData: PlantationData | null;
  sites: Site[];
  categories: Category[];
  regions: Region[];
  organizations: Organization[];
}

export default function PlantationDataFormModal({
  open,
  onClose,
  onSuccess,
  editingData,
  sites,
  categories,
  regions,
  organizations,
}: PlantationDataFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!editingData;

  // Form state
  const [formData, setFormData] = useState<CreatePlantationData>({
    siteId: 0,
    plants: 0,
    species: [],
  });
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  
  // Species handling
  const [availableSpecies, setAvailableSpecies] = useState<Species[]>([]);
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch species list
  useEffect(() => {
    if (open) {
      listSpecies().then(setAvailableSpecies).catch(console.error);
    }
  }, [open]);

  // Filtered dropdown options
  const filteredRegions = selectedOrgId
    ? regions.filter((r) => r.organizationId === selectedOrgId)
    : regions;

  const filteredCategories = selectedRegionId
    ? categories.filter((c) => c.regionId === selectedRegionId)
    : selectedOrgId
    ? categories.filter((c) => {
        const region = regions.find((r) => r.id === c.regionId);
        return region?.organizationId === selectedOrgId;
      })
    : categories;

  const filteredSites = selectedCategoryId
    ? sites.filter((s) => s.categoryId === selectedCategoryId)
    : selectedRegionId
    ? sites.filter((s) => {
        const category = categories.find((c) => c.id === s.categoryId);
        return category?.regionId === selectedRegionId;
      })
    : selectedOrgId
    ? sites.filter((s) => {
        const category = categories.find((c) => c.id === s.categoryId);
        const region = regions.find((r) => r.id === category?.regionId);
        return region?.organizationId === selectedOrgId;
      })
    : sites;

  // Initialize form data
  useEffect(() => {
    if (editingData) {
      setFormData({
        siteId: editingData.siteId,
        plants: editingData.plants,
        species: editingData.species,
      });

      const site = sites.find((s) => s.id === editingData.siteId);
      const category = categories.find((c) => c.id === site?.categoryId);
      const region = regions.find((r) => r.id === category?.regionId);
      setSelectedCategoryId(category?.id);
      setSelectedRegionId(region?.id);
      setSelectedOrgId(region?.organizationId);
    } else {
      setFormData({ siteId: 0, plants: 0, species: [] });
      setSelectedOrgId(organizations[0]?.id);
      setSelectedRegionId(undefined);
      setSelectedCategoryId(undefined);
    }
    setSpeciesSearch('');
    setSelectedSpeciesId('');
    setErrors({});
  }, [editingData, open, sites, categories, regions, organizations]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.siteId) {
      newErrors.siteId = 'Site is required';
    }

    if (formData.plants < 0) {
      newErrors.plants = 'Plants must be a positive number';
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
      if (isEditing) {
        await updatePlantationData(editingData.id, {
          plants: formData.plants,
          species: formData.species,
        });
        showToast('Plantation data updated successfully', 'success');
      } else {
        await createPlantationData(formData);
        showToast('Plantation data created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addSpecies = () => {
    if (!selectedSpeciesId) return;
    
    // Find species code from ID (assuming ID is passed, but we need code/name for storage as string array)
    const species = availableSpecies.find(s => s.id.toString() === selectedSpeciesId);
    if (!species) return;

    // Use english name or scientific name or code as the identifier
    const identifier = species.englishName || species.scientificName; // Or species.code if that's what backend expects

    if (identifier && !formData.species.includes(identifier)) {
      setFormData((prev) => ({
        ...prev,
        species: [...prev.species, identifier],
      }));
    }
    setSelectedSpeciesId('');
  };

  const removeSpecies = (sp: string) => {
    setFormData((prev) => ({
      ...prev,
      species: prev.species.filter((s) => s !== sp),
    }));
  };
  
  // Filter species for dropdown search
  const filteredSpeciesList = availableSpecies.filter(s => 
    !formData.species.includes(s.englishName || s.scientificName) && // Exclude already selected
    (s.englishName.toLowerCase().includes(speciesSearch.toLowerCase()) || 
     s.scientificName.toLowerCase().includes(speciesSearch.toLowerCase()) ||
     (s.localName && s.localName.toLowerCase().includes(speciesSearch.toLowerCase())))
  );

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Plantation Data' : 'Add Plantation Data'}
      description={
        isEditing
          ? 'Update the plantation information for this site.'
          : 'Enter plantation information for a site.'
      }
      size="lg"
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? 'Save Changes' : 'Add Data'}
          loading={loading}
        />
      }
    >
      <div className="space-y-6">
        {/* Site Selection */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Select Site</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Organization" htmlFor="plantation-org">
              <select
                id="plantation-org"
                value={selectedOrgId || ''}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value ? Number(e.target.value) : undefined);
                  setSelectedRegionId(undefined);
                  setSelectedCategoryId(undefined);
                  setFormData((prev) => ({ ...prev, siteId: 0 }));
                }}
                className={selectClassName}
                disabled={loading || isEditing}
              >
                <option value="">Select...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Region" htmlFor="plantation-region">
              <select
                id="plantation-region"
                value={selectedRegionId || ''}
                onChange={(e) => {
                  setSelectedRegionId(e.target.value ? Number(e.target.value) : undefined);
                  setSelectedCategoryId(undefined);
                  setFormData((prev) => ({ ...prev, siteId: 0 }));
                }}
                className={selectClassName}
                disabled={loading || isEditing || !selectedOrgId}
              >
                <option value="">Select...</option>
                {filteredRegions.map((region) => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Category" htmlFor="plantation-category">
              <select
                id="plantation-category"
                value={selectedCategoryId || ''}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value ? Number(e.target.value) : undefined);
                  setFormData((prev) => ({ ...prev, siteId: 0 }));
                }}
                className={selectClassName}
                disabled={loading || isEditing || !selectedRegionId}
              >
                <option value="">Select...</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Site" htmlFor="plantation-site" required error={errors.siteId}>
              <select
                id="plantation-site"
                value={formData.siteId || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, siteId: Number(e.target.value) }))}
                className={selectClassName}
                disabled={loading || isEditing || !selectedCategoryId}
              >
                <option value="">Select...</option>
                {filteredSites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Plantation Info */}
        <FormField label="Total Plants" htmlFor="plantation-plants" required error={errors.plants}>
          <input
            id="plantation-plants"
            type="number"
            value={formData.plants}
            onChange={(e) => setFormData((prev) => ({ ...prev, plants: parseInt(e.target.value) || 0 }))}
            className={inputClassName}
            placeholder="e.g., 5000"
            min="0"
            disabled={loading}
          />
        </FormField>

        {/* Species */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700">Species Selection</label>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-grow relative">
              <select
                value={selectedSpeciesId}
                onChange={(e) => setSelectedSpeciesId(e.target.value)}
                className={selectClassName}
                disabled={loading}
              >
                <option value="">Select a species...</option>
                {filteredSpeciesList.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.englishName || sp.scientificName} ({sp.localName || 'No local name'})
                  </option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              onClick={addSpecies}
              disabled={!selectedSpeciesId || loading}
              className="px-4 py-2 bg-green-900 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Add Species
            </button>
          </div>

          {/* Helper for searching if list is long (optional enhancement, standard browser select has basic search) */}

          {formData.species.length > 0 ? (
             <div className="mt-3">
               <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Selected Species:</p>
               <div className="flex flex-wrap gap-2">
                 {formData.species.map((sp) => (
                   <span
                     key={sp}
                     className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white border border-green-200 text-green-800 rounded-full text-sm shadow-sm"
                   >
                     <span className="font-medium">{sp}</span>
                     <button
                       type="button"
                       onClick={() => removeSpecies(sp)}
                       className="p-1 hover:bg-green-100 rounded-full text-green-600 hover:text-green-800 transition-colors"
                     >
                       <X className="w-3.5 h-3.5" />
                     </button>
                   </span>
                 ))}
               </div>
             </div>
          ) : (
             <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-xs text-gray-400">No species selected yet.</p>
             </div>
          )}
        </div>
      </div>
    </FormModal>
  );
}
