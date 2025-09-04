import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    REMEMBER_EMAIL: 'remember_email',
} as const;

// Secure storage para dados sensíveis (token)
export const secureStorage = {
    async setToken(token: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
            console.log('🔐 [Storage] Token salvo com segurança');
        } catch (error) {
            console.error('❌ [Storage] Erro ao salvar token:', error);
            throw new Error('Erro ao salvar token de autenticação');
        }
    },

    async getToken(): Promise<string | null> {
        try {
            const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
            console.log('🔐 [Storage] Token recuperado:', token ? 'Encontrado' : 'Não encontrado');
            return token;
        } catch (error) {
            console.error('❌ [Storage] Erro ao recuperar token:', error);
            return null;
        }
    },

    async removeToken(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
            console.log('🗑️ [Storage] Token removido');
        } catch (error) {
            console.error('❌ [Storage] Erro ao remover token:', error);
        }
    },
};

// AsyncStorage para dados não sensíveis
export const localStorage = {
    async setUserData(user: User): Promise<void> {
        try {
            const userData = JSON.stringify(user);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, userData);
            console.log('💾 [Storage] Dados do usuário salvos');
        } catch (error) {
            console.error('❌ [Storage] Erro ao salvar dados do usuário:', error);
            throw new Error('Erro ao salvar dados do usuário');
        }
    },

    async getUserData(): Promise<User | null> {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            if (userData) {
                const user = JSON.parse(userData);
                console.log('💾 [Storage] Dados do usuário recuperados:', user.email);
                return user;
            }
            console.log('💾 [Storage] Nenhum dado de usuário encontrado');
            return null;
        } catch (error) {
            console.error('❌ [Storage] Erro ao recuperar dados do usuário:', error);
            return null;
        }
    },

    async removeUserData(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
            console.log('🗑️ [Storage] Dados do usuário removidos');
        } catch (error) {
            console.error('❌ [Storage] Erro ao remover dados do usuário:', error);
        }
    },

    async setRememberEmail(email: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, email);
            console.log('📧 [Storage] Email salvo para lembrar');
        } catch (error) {
            console.error('❌ [Storage] Erro ao salvar email:', error);
        }
    },

    async getRememberEmail(): Promise<string | null> {
        try {
            const email = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL);
            console.log('📧 [Storage] Email recuperado:', email || 'Não encontrado');
            return email;
        } catch (error) {
            console.error('❌ [Storage] Erro ao recuperar email:', error);
            return null;
        }
    },

    async removeRememberEmail(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
            console.log('🗑️ [Storage] Email removido');
        } catch (error) {
            console.error('❌ [Storage] Erro ao remover email:', error);
        }
    },

    async clearAll(): Promise<void> {
        try {
            await Promise.all([
                this.removeUserData(),
                this.removeRememberEmail(),
            ]);
            console.log('🧹 [Storage] Todos os dados locais removidos');
        } catch (error) {
            console.error('❌ [Storage] Erro ao limpar dados:', error);
        }
    },
};