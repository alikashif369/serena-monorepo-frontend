// Migration utility for importing legacy species data

import { LegacySpecies, MigrationResult } from './types';
import { createSpecies, listSpecies, generateSpeciesCode } from '../speciesApi';

/**
 * Parse legacy species JSON file
 */
export function parseLegacySpecies(jsonContent: string): LegacySpecies[] {
  try {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data)) {
      throw new Error('Expected an array of species');
    }
    return data as LegacySpecies[];
  } catch (error: any) {
    throw new Error(`Failed to parse species JSON: ${error.message}`);
  }
}

/**
 * Transform legacy species to new format
 */
export function transformSpecies(legacy: LegacySpecies) {
  const scientificName = legacy.Name?.trim() || '';
  const code = legacy.check?.trim() || generateSpeciesCode(scientificName);

  return {
    code: code.toUpperCase(),
    scientificName,
    botanicalName: scientificName,
    localName: legacy.localname?.trim() || '',
    englishName: legacy.englishname?.trim() || '',
    description: legacy.description?.trim() || '',
    uses: legacy.uses?.trim() || '...',
    image1Url: legacy.image1 || '',
    image2Url: legacy.image2 || '',
    image3Url: legacy.image3 || '',
    image4Url: legacy.image4 || '',
  };
}

/**
 * Import species from legacy JSON data
 */
export async function importSpecies(
  legacyData: LegacySpecies[],
  onProgress?: (current: number, total: number, name: string) => void
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  // Get existing species for duplicate check
  let existingSpecies: { scientificName: string; code?: string }[] = [];
  try {
    existingSpecies = await listSpecies();
  } catch (error) {
    console.warn('Could not fetch existing species for duplicate check');
  }

  const existingNames = new Set(
    existingSpecies.map(s => s.scientificName.toLowerCase())
  );
  const existingCodes = new Set(
    existingSpecies.map(s => s.code?.toLowerCase()).filter(Boolean)
  );

  for (let i = 0; i < legacyData.length; i++) {
    const legacy = legacyData[i];
    const name = legacy.Name || `Species ${i + 1}`;

    if (onProgress) {
      onProgress(i + 1, legacyData.length, name);
    }

    try {
      // Skip if already exists
      if (existingNames.has(name.toLowerCase().trim())) {
        result.skipped++;
        continue;
      }

      const transformed = transformSpecies(legacy);

      // Skip if code already exists
      if (existingCodes.has(transformed.code.toLowerCase())) {
        // Generate a unique code
        let uniqueCode = transformed.code;
        let counter = 1;
        while (existingCodes.has(uniqueCode.toLowerCase())) {
          uniqueCode = `${transformed.code}${counter}`;
          counter++;
        }
        transformed.code = uniqueCode;
      }

      // Validate required fields
      if (!transformed.scientificName) {
        result.errors.push(`Row ${i + 1}: Missing scientific name`);
        continue;
      }
      if (!transformed.localName) {
        result.errors.push(`Row ${i + 1}: Missing local name for ${name}`);
        continue;
      }
      if (!transformed.englishName) {
        result.errors.push(`Row ${i + 1}: Missing English name for ${name}`);
        continue;
      }

      await createSpecies(transformed);
      result.created++;

      // Add to existing sets to prevent duplicates within the same import
      existingNames.add(name.toLowerCase().trim());
      existingCodes.add(transformed.code.toLowerCase());

    } catch (error: any) {
      result.errors.push(`${name}: ${error.message}`);
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Validate legacy species data before import
 */
export function validateLegacySpecies(data: LegacySpecies[]): string[] {
  const errors: string[] = [];
  const names = new Set<string>();
  const codes = new Set<string>();

  data.forEach((item, index) => {
    const row = index + 1;

    if (!item.Name?.trim()) {
      errors.push(`Row ${row}: Missing Name (scientific name)`);
    } else {
      const nameLower = item.Name.toLowerCase().trim();
      if (names.has(nameLower)) {
        errors.push(`Row ${row}: Duplicate name "${item.Name}"`);
      }
      names.add(nameLower);
    }

    if (item.check) {
      const codeLower = item.check.toLowerCase().trim();
      if (codes.has(codeLower)) {
        errors.push(`Row ${row}: Duplicate code "${item.check}"`);
      }
      codes.add(codeLower);
    }

    if (!item.localname?.trim()) {
      errors.push(`Row ${row}: Missing localname`);
    }

    if (!item.englishname?.trim()) {
      errors.push(`Row ${row}: Missing englishname`);
    }
  });

  return errors;
}
