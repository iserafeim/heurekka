/**
 * HTTP Client for Backend API
 * Direct fetch implementation to bypass tRPC version compatibility issues
 */

import { secureAuth } from '@/lib/auth/secure-auth';

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class HttpClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001') + '/api';
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const token = await secureAuth.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token for API request:', error);
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    console.log('API Response:', {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as any;
      error.status = response.status;
      error.statusText = response.statusText;

      try {
        const errorData = await response.json();
        error.message = errorData.message || error.message;
        error.code = errorData.code;
        error.details = errorData;
      } catch (parseError) {
        // Use default error message if JSON parsing fails
        console.warn('Failed to parse error response as JSON:', parseError);
      }

      throw error;
    }

    try {
      return await response.json();
    } catch (parseError) {
      console.warn('Failed to parse response as JSON:', parseError);
      throw new Error(`Invalid JSON response from ${response.url}`);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    try {
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      // Network error or other fetch failure
      console.warn('HTTP GET request failed:', {
        url: url.toString(),
        error: error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
      const apiError = new Error(`Network request failed: ${error instanceof Error ? error.message : String(error)}`) as any;
      apiError.status = 0;
      apiError.code = 'NETWORK_ERROR';
      apiError.originalError = error;
      throw apiError;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.warn('HTTP POST request failed:', error);
      const apiError = new Error('Network request failed') as any;
      apiError.status = 0;
      apiError.code = 'NETWORK_ERROR';
      throw apiError;
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.warn('HTTP PUT request failed:', error);
      const apiError = new Error('Network request failed') as any;
      apiError.status = 0;
      apiError.code = 'NETWORK_ERROR';
      throw apiError;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.warn('HTTP DELETE request failed:', error);
      const apiError = new Error('Network request failed') as any;
      apiError.status = 0;
      apiError.code = 'NETWORK_ERROR';
      throw apiError;
    }
  }
}

export const httpClient = new HttpClient();
export type { ApiError };