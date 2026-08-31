import axios from 'axios';
import { format, isValid } from 'date-fns';

function resolveBackendUrl(): string {
  // When running in a browser and NOT on localhost (e.g. ngrok tunnel, mobile phone LAN, or domain)
  // ALWAYS use relative "" so it calls the current host's /api proxy over secure HTTPS!
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const envUrl = process.env.REACT_APP_BACKEND_URL;
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.replace(/\/$/, '');
      }
      return '';
    }
  }

  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL.replace(/\/$/, '');
  }
  return 'http://localhost:8000';
}

export const BACKEND_URL = resolveBackendUrl();
export const API = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

// In-memory cache for ultra-fast data fetching
const cache = new Map<string, { data: any; timestamp: number }>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 20000; // 20 seconds TTL for fast repeat views

export function clearApiCache() {
  cache.clear();
}

const apiClient = axios.create({
  baseURL: API,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // Dynamically ensure baseURL points to relative /api on mobile/ngrok
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !process.env.REACT_APP_BACKEND_URL) {
      config.baseURL = '/api';
    }
  }

  if (config.headers) {
    config.headers.set('ngrok-skip-browser-warning', 'true');
    const token = localStorage.getItem('dh_token');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

// Stale-While-Revalidate & Instant Response Cache interceptor
const originalGet = apiClient.get;
apiClient.get = function (url: string, config?: any): Promise<any> {
  const cacheKey = `${url}:${JSON.stringify(config?.params || {})}`;
  const now = Date.now();

  // Check in-memory cache for ultra-fast instant UI rendering
  if (!config?.headers?.['no-cache']) {
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
      return Promise.resolve({ data: cached.data, status: 200, statusText: 'OK', headers: {}, config: config || {} } as any);
    }
  }

  // Deduplicate identical in-flight network requests
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const requestPromise = originalGet.call(this, url, config)
    .then((response) => {
      cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      return response;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
} as any;

// Mutation cache invalidation
['post', 'put', 'patch', 'delete'].forEach((method) => {
  const original = (apiClient as any)[method];
  (apiClient as any)[method] = function (...args: any[]) {
    cache.clear(); // Clear cached GET data when mutations happen
    return original.apply(this, args);
  };
});

export default apiClient;

export function formatApiError(err: any): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || 'Something went wrong';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => (e?.msg ? e.msg : JSON.stringify(e))).join(' · ');
  }
  return String(detail);
}

export function formatINR(v: number | string | null | undefined): string {
  if (v == null || isNaN(Number(v))) return '₹0';
  return '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function getOptimizedImageUrl(url?: string): string {
  if (!url) return '/vehicles/maruti_swift_old.webp';
  if (url.startsWith('/vehicles/') && url.endsWith('.png')) {
    return url.replace('.png', '.webp');
  }
  if (url.includes('unsplash.com') && !url.includes('w=')) {
    return `${url}&w=600&q=75&auto=format`;
  }
  if (url.includes('cloudinary.com') && !url.includes('f_auto')) {
    return url.replace('/upload/', '/upload/w_600,f_auto,q_auto/');
  }
  return url;
}

export function safeFormatDate(
  dateInput: Date | string | number | null | undefined,
  formatString: string = 'dd MMM yyyy',
  fallback: string = '—'
): string {
  if (!dateInput) return fallback;
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (!isValid(d) || isNaN(d.getTime())) {
      return fallback;
    }
    return format(d, formatString);
  } catch {
    return fallback;
  }
}
