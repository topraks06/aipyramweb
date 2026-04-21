import { AUTH_CODE } from '@/constants/auth';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errorMessage?: string;
  errorCode?: string;
}

class ApiError extends Error {
  constructor(public status: number, public errorMessage: string, public errorCode?: string) {
    super(errorMessage);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch('/next_api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const result: ApiResponse = await response.json();
    
    if (result.success) {
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if(currentPath === '/login' || currentPath === '/login/') {
      return;
    }
    const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
  }
}

async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit,
  isRetry = false
): Promise<T> {
  try {
    const response = await fetch(`/next_api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const result: ApiResponse<T> = await response.json();

    if ([AUTH_CODE.TOKEN_MISSING].includes(result.errorCode || '')) {
      redirectToLogin();
      return result.data as T;
    }

    if (response.status === 401 && 
        result.errorCode === AUTH_CODE.TOKEN_EXPIRED && 
        !isRetry) {
      
      if (isRefreshing && refreshPromise) {
        const refreshSuccess = await refreshPromise;
        if (refreshSuccess) {
          return apiRequest<T>(endpoint, options, true);
        } else {
          redirectToLogin();
          return result.data as T;
        }
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken();
        
        try {
          const refreshSuccess = await refreshPromise;
          
          if (refreshSuccess) {
            return apiRequest<T>(endpoint, options, true);
          } else {
            redirectToLogin();
            return result.data as T;
          }
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }
    }

    if(!response.ok || !result.success) {
      throw new ApiError(response.status, result.errorMessage || 'API Error', result.errorCode);
    }

    return result.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error or invalid response');
  }
}

export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, string>) => {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    return apiRequest<T>(url, { method: 'GET' });
  },

  post: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};

export { ApiError };
export type { ApiResponse }; 