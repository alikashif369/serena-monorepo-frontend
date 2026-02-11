// API functions for Species management

import { API_URL, getHeaders, getMultipartHeaders, handleResponse } from '../utils/apiConfig';

// ============================================================================
// Types
// ============================================================================

export interface Species {
  id: number;
  code?: string;
  scientificName: string;
  botanicalName?: string;
  localName: string;
  englishName: string;
  description: string;
  uses: string;
  imagePath?: string;
  // All 4 reference images are now required
  image1Url: string;  // Habitat view - REQUIRED
  image2Url: string;  // Leaf close-up - REQUIRED
  image3Url: string;  // Bark texture - REQUIRED
  image4Url: string;  // Seed/flower - REQUIRED
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpeciesData {
  code: string;
  scientificName: string;
  botanicalName?: string;
  localName: string;
  englishName: string;
  description: string;
  uses: string;
  // All 4 reference images are now required
  image1Url: string;  // Habitat view - REQUIRED
  image2Url: string;  // Leaf close-up - REQUIRED
  image3Url: string;  // Bark texture - REQUIRED
  image4Url: string;  // Seed/flower - REQUIRED
}

export interface UpdateSpeciesData {
  scientificName?: string;
  botanicalName?: string;
  localName?: string;
  englishName?: string;
  description?: string;
  uses?: string;
  image1Url?: string;
  image2Url?: string;
  image3Url?: string;
  image4Url?: string;
}

// ============================================================================
// API Functions
// ============================================================================

export async function listSpecies(search?: string): Promise<Species[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const queryString = params.toString();
  const url = queryString ? `${API_URL}/species?${queryString}` : `${API_URL}/species`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });
  return handleResponse<Species[]>(response);
}

export async function getSpecies(id: number): Promise<Species> {
  const response = await fetch(`${API_URL}/species/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Species>(response);
}

export async function createSpecies(data: CreateSpeciesData): Promise<Species> {
  const response = await fetch(`${API_URL}/species`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Species>(response);
}

export async function updateSpecies(id: number, data: UpdateSpeciesData): Promise<Species> {
  const response = await fetch(`${API_URL}/species/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Species>(response);
}

export async function deleteSpecies(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/species/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete species' }));
    throw new Error(error.message);
  }
}

export async function uploadSpeciesReferenceImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/species/upload-reference-image`, {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData,
  });

  return handleResponse<{ url: string }>(response);
}

// ============================================================================
// Utility Functions
// ============================================================================

export function generateSpeciesCode(scientificName: string): string {
  // Generate a code from the scientific name (first 3 letters of genus + first 3 letters of species)
  const parts = scientificName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].substring(0, 3) + parts[1].substring(0, 3)).toUpperCase();
  }
  return scientificName.substring(0, 6).toUpperCase();
}

export function getSpeciesImages(species: Species): string[] {
  // All 4 images are now required, so we can return them directly
  return [
    species.image1Url,
    species.image2Url,
    species.image3Url,
    species.image4Url,
  ];
}
