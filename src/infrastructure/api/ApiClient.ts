import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../../shared/constants';
import { ApiResponse, ApiError } from '../../shared/types';

export class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token && this.isValidToken(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request metadata
        config.headers['X-Request-ID'] = this.generateRequestId();
        config.headers['X-Request-Time'] = new Date().toISOString();

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => this.transformResponse(response),
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired) - but not for login/refresh endpoints
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url?.includes('/auth/login') &&
            !originalRequest.url?.includes('/auth/refresh')) {
          
          // Check if we have a valid token to refresh
          const currentToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (!currentToken || !this.isValidToken(currentToken)) {
            this.clearAuth();
            throw error;
          }

          if (this.isRefreshing) {
            return this.queueRequest(originalRequest);
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            if (!newToken) {
              throw new Error('No token received');
            }
            this.processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.clearAuth();
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        throw this.transformError(error);
      }
    );
  }

  // HTTP Methods
  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(endpoint, config);
    return response.data;
  }

  async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(endpoint, data, config);
    return response.data;
  }

  async postForm<T = any>(endpoint: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(endpoint, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async put<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(endpoint, data, config);
    return response.data;
  }

  async patch<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(endpoint, data, config);
    return response.data;
  }

  async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(endpoint, config);
    return response.data;
  }

  // File upload
  async upload<T = any>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Private methods
  private transformResponse(response: AxiosResponse): AxiosResponse {
    // Log para debugging
    console.log('🔄 ApiClient transformResponse - Original:', response.config.url, response.data);
    
    // Ensure consistent response format
    if (response.data && typeof response.data === 'object') {
      // If already has our format, return as is
      if (response.data.hasOwnProperty('success')) {
        return response;
      }

      // IMPORTANT: Don't transform paginated responses or responses with specific structures
      // Check if this is a paginated response (has data array and meta object)
      if (response.data.hasOwnProperty('data') && 
          Array.isArray(response.data.data) && 
          response.data.hasOwnProperty('meta')) {
        console.log('📄 ApiClient: Detected paginated response, not transforming');
        return response;
      }

      // Check if this is a Laravel resource response (has data property)
      if (response.data.hasOwnProperty('data') && !response.data.hasOwnProperty('success')) {
        console.log('📦 ApiClient: Detected Laravel resource response, not transforming');
        return response;
      }

      // Only transform simple responses that don't have a specific structure
      console.log('🔧 ApiClient: Transforming simple response');
      const transformedData: ApiResponse = {
        success: response.status >= 200 && response.status < 300,
        data: response.data,
        message: 'Success',
        timestamp: new Date().toISOString(),
      };

      return {
        ...response,
        data: transformedData,
      };
    }

    return response;
  }

  private transformError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const apiError: ApiError = {
        message: error.response.data?.message || 
                error.response.data?.error || 
                `HTTP ${error.response.status}: ${error.response.statusText}`,
        code: error.response.data?.code,
        status: error.response.status,
        errors: error.response.data?.errors
      };
      
      return apiError;
    } else if (error.request) {
      // Network error
      return {
        message: 'Error de conexión. Verifique su conexión a internet.',
        code: 'NETWORK_ERROR'
      };
    } else {
      // Request setup error
      return {
        message: `Error de configuración: ${error.message}`,
        code: 'REQUEST_ERROR'
      };
    }
  }

  private async refreshToken(): Promise<string> {
    try {
      const currentToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!currentToken) {
        throw new Error('No token available for refresh');
      }

      const response = await axios.post(`${API_CONFIG.BASE_URL.replace(/\/$/, '')}/auth/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      const newToken = response.data?.access_token || response.data?.token;
      if (!newToken || typeof newToken !== 'string') {
        throw new Error('Invalid token in refresh response');
      }

      // Validate the new token before storing
      if (!this.isValidToken(newToken)) {
        throw new Error('Received invalid token from refresh');
      }

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
      return newToken;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  private queueRequest(originalRequest: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.failedQueue.push({ resolve, reject });
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return this.client(originalRequest);
    });
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    
    // Redirect to login
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  private isValidToken(token: string): boolean {
    try {
      if (!token || typeof token !== 'string') {
        return false;
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp || typeof payload.exp !== 'number') {
        return false;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      // Add 30 seconds buffer to avoid edge cases
      return payload.exp > (currentTime + 30);
    } catch {
      return false;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();