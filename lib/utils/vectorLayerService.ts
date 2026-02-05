/**
 * Service for fetching vector layer data from the API
 */

// Circuit breaker state to prevent hammering a down service
let circuitBreakerState: {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
} = {
  failures: 0,
  lastFailureTime: 0,
  isOpen: false,
};

const CIRCUIT_BREAKER_THRESHOLD = 3; // Open circuit after 3 failures
const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export interface VectorLayerFeature {
  id: string;
  siteId: number;
  year: number;
  geometry: any;
  properties: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  site: {
    id: number;
    name: string;
    slug: string;
    category: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

export interface VectorLayerResponse {
  success: boolean;
  data: VectorLayerFeature[];
  error?: string;
}

/**
 * Fetches all existing vector layers from the API with retry logic and circuit breaker
 * @param retryCount - Current retry attempt (internal use)
 * @returns Promise with the vector layers response
 */
export async function fetchAllVectorLayers(retryCount = 0): Promise<VectorLayerResponse> {
  // Check circuit breaker
  if (circuitBreakerState.isOpen) {
    const timeSinceLastFailure = Date.now() - circuitBreakerState.lastFailureTime;
    if (timeSinceLastFailure < CIRCUIT_BREAKER_TIMEOUT) {
      console.warn('[VECTOR_SERVICE] Circuit breaker is OPEN - service temporarily unavailable');
      return {
        success: false,
        data: [],
        error: 'Service temporarily unavailable (circuit breaker open)',
      };
    } else {
      // Reset circuit breaker after timeout
      console.log('[VECTOR_SERVICE] Circuit breaker timeout expired - attempting to close');
      circuitBreakerState.isOpen = false;
      circuitBreakerState.failures = 0;
    }
  }

  try {
    console.log(`[VECTOR_SERVICE] Fetching all vector layers from API... (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    
    const apiUrl = '/api/vector-layers';
    console.log('[VECTOR_SERVICE] API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log('[VECTOR_SERVICE] Response status:', response.status);
    console.log('[VECTOR_SERVICE] Response ok:', response.ok);

    if (!response.ok) {
      console.error('[VECTOR_SERVICE] Failed to fetch vector layers:', response.statusText);
      
      // Handle specific error codes
      if (response.status === 503 || response.status === 502 || response.status === 504) {
        console.warn(`[VECTOR_SERVICE] Backend service unavailable (${response.status})`);
        
        // Increment failure count
        circuitBreakerState.failures++;
        circuitBreakerState.lastFailureTime = Date.now();
        
        // Open circuit breaker if threshold reached
        if (circuitBreakerState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
          circuitBreakerState.isOpen = true;
          console.error('[VECTOR_SERVICE] Circuit breaker OPENED after', circuitBreakerState.failures, 'failures');
        }
        
        // Retry with exponential backoff
        if (retryCount < MAX_RETRIES) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
          console.log(`[VECTOR_SERVICE] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchAllVectorLayers(retryCount + 1);
        }
        
        return {
          success: false,
          data: [],
          error: 'Backend service unavailable - please ensure the API server is running',
        };
      }
      
      // Handle rate limiting
      if (response.status === 429) {
        console.warn('[VECTOR_SERVICE] Rate limited (429)');
        if (retryCount < MAX_RETRIES) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
          console.log(`[VECTOR_SERVICE] Retrying after rate limit in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchAllVectorLayers(retryCount + 1);
        }
      }
      
      return {
        success: false,
        data: [],
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('[VECTOR_SERVICE] Received data:', data);
    console.log('[VECTOR_SERVICE] Data type:', typeof data);
    console.log('[VECTOR_SERVICE] Is array:', Array.isArray(data));
    
    // Reset circuit breaker on successful request
    if (circuitBreakerState.failures > 0) {
      console.log('[VECTOR_SERVICE] Request successful - resetting circuit breaker');
      circuitBreakerState.failures = 0;
      circuitBreakerState.isOpen = false;
    }
    
    // The API returns an array directly based on your curl response
    if (Array.isArray(data)) {
      console.log('[VECTOR_SERVICE] Successfully fetched', data.length, 'vector layers');
      console.log('[VECTOR_SERVICE] First item structure:', data.length > 0 ? data[0] : 'no items');
      
      return {
        success: true,
        data,
      };
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      // Handle wrapped response format (both success: true and success: false cases)
      const isSuccess = data.success !== false && data.data.length > 0;
      console.log('[VECTOR_SERVICE] Received wrapped response:', {
        success: data.success,
        dataLength: data.data.length,
        message: data.message || data.error
      });
      return {
        success: isSuccess,
        data: data.data,
        error: data.message || data.error,
      };
    } else if (data && typeof data === 'object' && Object.keys(data).length === 0) {
      // Handle empty object {} response (backend may be initializing)
      console.warn('[VECTOR_SERVICE] Received empty object response - backend may be starting up');
      return {
        success: false,
        data: [],
        error: 'Backend service returned empty response - please try again',
      };
    } else {
      console.error('[VECTOR_SERVICE] Unexpected response format:', data);
      return {
        success: false,
        data: [],
        error: 'Unexpected response format',
      };
    }
  } catch (error) {
    console.error('[VECTOR_SERVICE] Error fetching vector layers:', error);
    
    // Handle network errors and timeouts
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[VECTOR_SERVICE] Network error - API server may be down');
      
      // Increment failure count for circuit breaker
      circuitBreakerState.failures++;
      circuitBreakerState.lastFailureTime = Date.now();
      
      if (circuitBreakerState.failures >= CIRCUIT_BREAKER_THRESHOLD) {
        circuitBreakerState.isOpen = true;
        console.error('[VECTOR_SERVICE] Circuit breaker OPENED after network failures');
      }
      
      // Retry on network errors
      if (retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[VECTOR_SERVICE] Retrying after network error in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchAllVectorLayers(retryCount + 1);
      }
      
      return {
        success: false,
        data: [],
        error: 'Network error - could not reach API server',
      };
    }
    
    // Handle timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('[VECTOR_SERVICE] Request timeout');
      if (retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[VECTOR_SERVICE] Retrying after timeout in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchAllVectorLayers(retryCount + 1);
      }
    }
    
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Manually reset the circuit breaker (useful for debugging or after fixing the backend)
 */
export function resetCircuitBreaker() {
  console.log('[VECTOR_SERVICE] Manually resetting circuit breaker');
  circuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    isOpen: false,
  };
}

/**
 * Get current circuit breaker state (for debugging)
 */
export function getCircuitBreakerState() {
  return {
    ...circuitBreakerState,
    isOpen: circuitBreakerState.isOpen,
    failures: circuitBreakerState.failures,
    timeSinceLastFailure: circuitBreakerState.lastFailureTime > 0 
      ? Date.now() - circuitBreakerState.lastFailureTime 
      : null,
  };
}

/**
 * Normalizes geometry from various formats to GeoJSON geometry
 * Handles:
 * - Direct Polygon/MultiPolygon geometry
 * - FeatureCollection wrapper (extracts first feature)
 * - Nested structures
 */
export function normalizeGeometry(geometryData: any): any | null {
  console.log('[VECTOR_SERVICE] Normalizing geometry, type:', geometryData?.type);
  
  if (!geometryData) {
    console.warn('[VECTOR_SERVICE] No geometry data provided');
    return null;
  }

  // Handle FeatureCollection edge case (some old uploads might have this)
  if (geometryData.type === 'FeatureCollection') {
    console.log('[VECTOR_SERVICE] Found FeatureCollection, extracting first feature');
    if (geometryData.features && geometryData.features.length > 0) {
      console.log('[VECTOR_SERVICE] Extracting geometry from feature 0');
      return normalizeGeometry(geometryData.features[0].geometry);
    } else {
      console.warn('[VECTOR_SERVICE] FeatureCollection has no features');
      return null;
    }
  }

  // Valid geometry types
  const validTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'];
  
  if (validTypes.includes(geometryData.type)) {
    console.log('[VECTOR_SERVICE] Valid geometry type:', geometryData.type);
    return geometryData;
  }

  console.warn('[VECTOR_SERVICE] Unknown geometry type:', geometryData.type);
  return null;
}

/**
 * Converts vector layer features to GeoJSON Feature format
 * suitable for OpenLayers consumption
 */
export function convertToGeoJSONFeatures(vectorLayers: VectorLayerFeature[]): any[] {
  console.log('[VECTOR_SERVICE] Converting', vectorLayers.length, 'vector layers to GeoJSON features');
  
  const features = vectorLayers
    .map((layer, index) => {
      console.log(`[VECTOR_SERVICE] Processing layer ${index + 1}/${vectorLayers.length}, id: ${layer.id}`);
      
      const geometry = normalizeGeometry(layer.geometry);
      
      if (!geometry) {
        console.warn(`[VECTOR_SERVICE] Skipping layer ${layer.id} - invalid geometry`);
        return null;
      }

      const feature = {
        type: 'Feature',
        geometry,
        properties: {
          id: layer.id,
          siteId: layer.siteId,
          siteName: layer.site?.name,
          year: layer.year,
          categoryName: layer.site?.category?.name,
          ...layer.properties,
        },
      };

      console.log(`[VECTOR_SERVICE] Created feature for layer ${layer.id}, geometry type: ${geometry.type}`);
      return feature;
    })
    .filter((f): f is any => f !== null);

  console.log('[VECTOR_SERVICE] Successfully converted', features.length, 'features');
  return features;
}
