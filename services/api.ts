import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import { ApiResponse } from '@/types';

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public response?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

class ApiService {
    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {},
        token?: string
    ): Promise<ApiResponse<T>> {
        const url = getApiUrl(endpoint);
        const headers = getAuthHeaders(token);

        const config: RequestInit = {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        };

        try {
            console.log(`🌐 [API] ${config.method || 'GET'} ${url}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            console.log(`📡 [API] Response Status: ${response.status}`, {
                success: data.success,
                statusCode: data.statusCode
            });

            if (!response.ok) {
                throw new ApiError(
                    response.status,
                    data.message || data.error || 'Erro na requisição',
                    data
                );
            }

            return data;
        } catch (error) {
            console.error('❌ [API] Request failed:', error);

            if (error instanceof ApiError) {
                throw error;
            }



            throw new ApiError(
                0,
                'Erro de conexão. Verifique sua internet.',
                error
            );
        }
    }

    async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, { method: 'GET' }, token);
    }

    async post<T>(
        endpoint: string,
        data?: any,
        token?: string
    ): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(
            endpoint,
            {
                method: 'POST',
                body: data ? JSON.stringify(data) : undefined,
            },
            token
        );
    }

    async put<T>(
        endpoint: string,
        data: any,
        token?: string
    ): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(
            endpoint,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            },
            token
        );
    }

    async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(endpoint, { method: 'DELETE' }, token);
    }

    async patch<T>(
        endpoint: string,
        data: any,
        token?: string
    ): Promise<ApiResponse<T>> {
        return this.makeRequest<T>(
            endpoint,
            {
                method: 'PATCH',
                body: JSON.stringify(data),
            },
            token
        );
    }
}

export const apiService = new ApiService();