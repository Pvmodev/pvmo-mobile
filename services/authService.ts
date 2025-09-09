import { API_CONFIG } from '@/config/api';
import { ApiResponse, CreatePlatformUserData, LoginCredentials, LoginResponse, PlatformUser, RefreshResponse, User } from '@/types';
import { apiService } from './api';


class AuthService {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        console.log('🔐 [Auth Service] Tentando fazer login...');

        try {
            const response = await apiService.post<LoginResponse['data']>(
                API_CONFIG.ENDPOINTS.AUTH.LOGIN,
                credentials
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro no login');
            }

            console.log('✅ [Auth Service] Login realizado com sucesso');

            return {
                success: response.success,
                statusCode: response.statusCode,
                timestamp: response.timestamp,
                path: response.path,
                method: response.method,
                data: response.data
            };
        } catch (error) {
            console.error('❌ [Auth Service] Erro no login:', error);
            throw error;
        }
    }

    // NOVO: Método para refresh token
    async refreshToken(currentToken: string): Promise<ApiResponse<RefreshResponse>> {
        console.log('🔄 [Auth Service] Fazendo refresh do token...');

        return await apiService.get<RefreshResponse>(
            API_CONFIG.ENDPOINTS.AUTH.REFRESH,
            currentToken
        );
    }



    // REMOVIDO: logout não implementado na API
    // async logout(token: string): Promise<void> {
    //     // Método removido - API não tem endpoint de logout
    //     console.log('🚪 [Auth Service] Limpando token local...');
    // }

    async getMe(token: string): Promise<User> {
        console.log('👤 [Auth Service] Buscando dados do usuário...');

        try {
            const response = await apiService.get<{ user: User }>(
                API_CONFIG.ENDPOINTS.AUTH.ME,
                token
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao buscar dados do usuário');
            }

            console.log('✅ [Auth Service] Dados do usuário obtidos com sucesso');
            // A API retorna { user: User }, então acessamos response.data.user
            return response.data.user;
        } catch (error) {
            console.error('❌ [Auth Service] Erro ao buscar dados do usuário:', error);
            throw error;
        }
    }

    // REMOVIDO: refresh token não implementado na API
    // async refreshToken(token: string): Promise<string> {
    //     // Método removido - API não tem endpoint de refresh
    //     throw new Error('Refresh token não implementado');
    // }

    async validateToken(token: string): Promise<boolean> {
        try {
            await this.getMe(token);
            return true;
        } catch (error) {
            console.log('⚠️ [Auth Service] Token inválido ou expirado');
            return false;
        }
    }

    // NOVO: método para conceder acesso a loja (para admins)
    async grantStoreAccess(
        targetUserId: string,
        storeId: string,
        permissions: any,
        token: string
    ): Promise<void> {
        console.log('🔑 [Auth Service] Concedendo acesso à loja...');

        try {
            const response = await apiService.post(
                API_CONFIG.ENDPOINTS.AUTH.GRANT_ACCESS,
                {
                    targetUserId,
                    storeId,
                    permissions
                },
                token
            );

            if (!response.success) {
                throw new Error(response.message || 'Erro ao conceder acesso');
            }

            console.log('✅ [Auth Service] Acesso concedido com sucesso');
        } catch (error) {
            console.error('❌ [Auth Service] Erro ao conceder acesso:', error);
            throw error;
        }
    }
    async createPlatformUser(
        userData: CreatePlatformUserData,
        token: string
    ): Promise<ApiResponse<PlatformUser>> {
        console.log('👥 [Auth Service] Criando usuário da plataforma...');

        try {
            const response = await apiService.post<PlatformUser>(
                API_CONFIG.ENDPOINTS.PLATFORM_USERS.CREATE,
                userData,
                token
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao criar usuário');
            }

            console.log('✅ [Auth Service] Usuário criado:', response.data.name);
            return response;
        } catch (error) {
            console.error('❌ [Auth Service] Erro ao criar usuário:', error);
            throw error;
        }
    }

    async getPlatformUsers(
        params: {
            page?: number;
            limit?: number;
            role?: string;
            isActive?: boolean;
            search?: string;
        } = {},
        token: string
    ): Promise<ApiResponse<{ users: PlatformUser[]; total: number; page: number; totalPages: number }>> {
        console.log('📋 [Auth Service] Buscando usuários da plataforma...');

        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.role) queryParams.append('role', params.role);
            if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
            if (params.search) queryParams.append('search', params.search);

            const endpoint = `${API_CONFIG.ENDPOINTS.PLATFORM_USERS.LIST}?${queryParams.toString()}`;

            const response = await apiService.get<{ users: PlatformUser[]; total: number; page: number; totalPages: number }>(endpoint, token);

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao buscar usuários');
            }

            console.log('✅ [Auth Service] Usuários encontrados:', response.data.total);
            return response;
        } catch (error) {
            console.error('❌ [Auth Service] Erro ao buscar usuários:', error);
            throw error;
        }
    }
}

export const authService = new AuthService();