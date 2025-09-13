// src/services/authService.ts - CORRIGIDO SEM TIMEOUT NO FETCH

import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';
import {
    ApiResponse,
    CreatePlatformUserData,
    LoginCredentials,
    LoginResponse,
    PlatformUser,
    RefreshResponse,
    User
} from '@/types';
import { fetchWithTimeout } from '@/utils/fetchWithTimeout';

interface GetPlatformUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
}

interface PlatformUsersResponse {
    users: PlatformUser[];
    total: number;
    page: number;
    totalPages: number;
}

interface GrantStoreAccessData {
    userId: string;
    storeId: string;
    storeRole: 'OWNER' | 'MANAGER' | 'EMPLOYEE' | 'VIEWER';
    permissions: {
        canManageProducts: boolean;
        canManageUsers: boolean;
        canManageOrders: boolean;
        canViewAnalytics: boolean;
        canManageSettings: boolean;
        canManageFinances: boolean;
    };
}

class AuthService {
    /**
     * Login de usuário da plataforma
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.PLATFORM_AUTH.LOGIN);

            console.log('🔐 [AuthService] Fazendo login:', credentials.email);

            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: API_CONFIG.DEFAULT_HEADERS,
                body: JSON.stringify(credentials),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'AUTHENTICATION_FAILED'
                };
            }

            const data: LoginResponse = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta de login inválida',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [AuthService] Login realizado com sucesso:', data.data.user.email);
            return data;

        } catch (error: any) {
            console.error('❌ [AuthService] Erro no login:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Obter dados do usuário autenticado
     */
    async getMe(token: string): Promise<User> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.PLATFORM_AUTH.ME);

            console.log('👤 [AuthService] Buscando dados do usuário');

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: getAuthHeaders(token),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'USER_FETCH_FAILED'
                };
            }

            const data: ApiResponse<User> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [AuthService] Dados do usuário obtidos:', data.data.email);
            return data.data;

        } catch (error: any) {
            console.error('❌ [AuthService] Erro ao buscar dados do usuário:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Atualizar token com acessos atuais
     */
    async refreshToken(currentToken: string): Promise<ApiResponse<RefreshResponse>> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.PLATFORM_AUTH.REFRESH);

            console.log('🔄 [AuthService] Atualizando token');

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: getAuthHeaders(currentToken),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'TOKEN_REFRESH_FAILED'
                };
            }

            const data: ApiResponse<RefreshResponse> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [AuthService] Token atualizado com sucesso');
            return data;

        } catch (error: any) {
            console.error('❌ [AuthService] Erro ao atualizar token:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Validar se o token ainda é válido
     */
    async validateToken(token: string): Promise<boolean> {
        try {
            await this.getMe(token);
            return true;
        } catch (error: any) {
            if (error.statusCode === 401) {
                return false;
            }
            // Para outros erros, assumimos que o token é válido
            return true;
        }
    }

    /**
     * Criar novo usuário da plataforma (apenas admin)
     */
    async createPlatformUser(userData: CreatePlatformUserData, token: string): Promise<PlatformUser> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.PLATFORM_USERS.CREATE);

            console.log('👥 [AuthService] Criando usuário:', userData.email);

            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify(userData),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'USER_CREATION_FAILED'
                };
            }

            const data: ApiResponse<PlatformUser> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [AuthService] Usuário criado:', data.data.email);
            return data.data;

        } catch (error: any) {
            console.error('❌ [AuthService] Erro ao criar usuário:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Listar usuários da plataforma (apenas admin)
     */
    async getPlatformUsers(params: GetPlatformUsersParams, token: string): Promise<ApiResponse<PlatformUsersResponse>> {
        try {
            const queryParams = new URLSearchParams();

            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.search) queryParams.append('search', params.search);
            if (params.role) queryParams.append('role', params.role);
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

            const url = `${getApiUrl(API_CONFIG.ENDPOINTS.PLATFORM_USERS.LIST)}?${queryParams}`;

            console.log('👥 [AuthService] Listando usuários da plataforma');

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: getAuthHeaders(token),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'USERS_FETCH_FAILED'
                };
            }

            const data: ApiResponse<PlatformUsersResponse> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [AuthService] Usuários listados:', data.data.total);
            return data;

        } catch (error: any) {
            console.error('❌ [AuthService] Erro ao listar usuários:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Buscar usuário por ID
     */
    async getPlatformUserById(userId: string, token: string): Promise<PlatformUser> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.PLATFORM_USERS.GET_BY_ID(userId));

            console.log('👤 [AuthService] Buscando usuário por ID:', userId);

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: getAuthHeaders(token),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'USER_FETCH_FAILED'
                };
            }

            const data: ApiResponse<PlatformUser> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [AuthService] Usuário encontrado:', data.data.email);
            return data.data;

        } catch (error: any) {
            console.error('❌ [AuthService] Erro ao buscar usuário:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Atualizar usuário
     */
    async updatePlatformUser(userId: string, userData: Partial<CreatePlatformUserData>, token: string): Promise<PlatformUser> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.PLATFORM_USERS.UPDATE(userId));

            console.log('🔄 [AuthService] Atualizando usuário:', userId);

            const response = await fetchWithTimeout(url, {
                method: 'PATCH',
                headers: getAuthHeaders(token),
                body: JSON.stringify(userData),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'USER_UPDATE_FAILED'
                };
            }

            const data: ApiResponse<PlatformUser> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [AuthService] Usuário atualizado:', data.data.email);
            return data.data;

        } catch (error: any) {
            console.error('❌ [AuthService] Erro ao atualizar usuário:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Deletar usuário (apenas admin)
     */
    async deletePlatformUser(userId: string, token: string): Promise<void> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.PLATFORM_USERS.DELETE(userId));

            console.log('🗑️ [AuthService] Deletando usuário:', userId);

            const response = await fetchWithTimeout(url, {
                method: 'DELETE',
                headers: getAuthHeaders(token),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'USER_DELETE_FAILED'
                };
            }

            console.log('✅ [AuthService] Usuário deletado');

        } catch (error: any) {
            console.error('❌ [AuthService] Erro ao deletar usuário:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Conceder acesso de usuário a uma loja
     */
    async grantStoreAccess(userId: string, storeId: string, accessData: Omit<GrantStoreAccessData, 'userId' | 'storeId'>, token: string): Promise<void> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.PLATFORM_USERS.GRANT_STORE_ACCESS(userId, storeId));

            console.log('🔐 [AuthService] Concedendo acesso à loja:', { userId, storeId });

            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: getAuthHeaders(token),
                body: JSON.stringify(accessData),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'ACCESS_GRANT_FAILED'
                };
            }

            console.log('✅ [AuthService] Acesso concedido');

        } catch (error: any) {
            console.error('❌ [AuthService] Erro ao conceder acesso:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Revogar acesso de usuário a uma loja
     */
    async revokeStoreAccess(userId: string, storeId: string, token: string): Promise<void> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.PLATFORM_USERS.REVOKE_STORE_ACCESS(userId, storeId));

            console.log('🚫 [AuthService] Revogando acesso à loja:', { userId, storeId });

            const response = await fetchWithTimeout(url, {
                method: 'DELETE',
                headers: getAuthHeaders(token),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'ACCESS_REVOKE_FAILED'
                };
            }

            console.log('✅ [AuthService] Acesso revogado');

        } catch (error: any) {
            console.error('❌ [AuthService] Erro ao revogar acesso:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }

    /**
     * Listar acessos a lojas de um usuário
     */
    async getUserStoreAccess(userId: string, token: string): Promise<any[]> {
        try {
            const url = getApiUrl(API_CONFIG.ENDPOINTS.PLATFORM_USERS.GET_STORE_ACCESS(userId));

            console.log('🏪 [AuthService] Listando acessos do usuário:', userId);

            const response = await fetchWithTimeout(url, {
                method: 'GET',
                headers: getAuthHeaders(token),
                timeout: API_CONFIG.TIMEOUT,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    statusCode: response.status,
                    message: errorData.message || `Erro ${response.status}: ${response.statusText}`,
                    error: errorData.error || 'ACCESS_FETCH_FAILED'
                };
            }

            const data: ApiResponse<any[]> = await response.json();

            if (!data.success || !data.data) {
                throw {
                    statusCode: 500,
                    message: 'Resposta inválida do servidor',
                    error: 'INVALID_RESPONSE'
                };
            }

            console.log('✅ [AuthService] Acessos listados:', data.data.length);
            return data.data;

        } catch (error: any) {
            console.error('❌ [AuthService] Erro ao listar acessos:', error);
            throw {
                statusCode: error.statusCode || 0,
                message: error.message || 'Erro de conexão',
                error: error.error || 'NETWORK_ERROR'
            };
        }
    }
}

export const authService = new AuthService();