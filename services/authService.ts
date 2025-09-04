import { API_CONFIG } from '@/config/api';
import { LoginCredentials, LoginResponse, User } from '@/types';
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

    async logout(token: string): Promise<void> {
        console.log('🚪 [Auth Service] Fazendo logout...');

        try {
            await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {}, token);
            console.log('✅ [Auth Service] Logout realizado com sucesso');
        } catch (error) {
            console.error('❌ [Auth Service] Erro no logout:', error);
            // Não lançamos erro aqui, pois mesmo que falhe no backend,
            // queremos limpar o token local
        }
    }

    async getMe(token: string): Promise<User> {
        console.log('👤 [Auth Service] Buscando dados do usuário...');

        try {
            const response = await apiService.get<User>(
                API_CONFIG.ENDPOINTS.AUTH.ME,
                token
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Erro ao buscar dados do usuário');
            }

            console.log('✅ [Auth Service] Dados do usuário obtidos com sucesso');
            return response.data;
        } catch (error) {
            console.error('❌ [Auth Service] Erro ao buscar dados do usuário:', error);
            throw error;
        }
    }

    async refreshToken(token: string): Promise<string> {
        console.log('🔄 [Auth Service] Renovando token...');

        try {
            const response = await apiService.post<{ token: string }>(
                API_CONFIG.ENDPOINTS.AUTH.REFRESH,
                {},
                token
            );

            if (!response.success || !response.data?.token) {
                throw new Error(response.message || 'Erro ao renovar token');
            }

            console.log('✅ [Auth Service] Token renovado com sucesso');
            return response.data.token;
        } catch (error) {
            console.error('❌ [Auth Service] Erro ao renovar token:', error);
            throw error;
        }
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            await this.getMe(token);
            return true;
        } catch (error) {
            console.log('⚠️ [Auth Service] Token inválido ou expirado');
            return false;
        }
    }
}

export const authService = new AuthService();