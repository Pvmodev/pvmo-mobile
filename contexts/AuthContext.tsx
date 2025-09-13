// src/contexts/AuthContext.tsx - CORREÇÃO COMPLETA

import { authService } from '@/services/authService';
import { storeService } from '@/services/storeService';
import {
  LoginCredentials,
  PlatformUserRole,
  StoreData,
  User
} from '@/types';
import { localStorage, secureStorage } from '@/utils/storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextData {
  user: User | null;
  token: string | null;
  storeData: StoreData | null;
  allStores: StoreData[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials, rememberEmail?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshStoreData: () => Promise<void>;
  switchStore: (storeId: string) => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
  ensureValidToken: () => Promise<boolean>;
  // ✅ EXPORTAR as funções utilitárias
  canAccessStore: (storeSlug: string) => boolean;
  canManageStore: (storeSlug: string) => boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [allStores, setAllStores] = useState<StoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // ✅ CORRIGIR: Funções utilitárias com tipos corretos
  const canAccessStore = (storeSlug: string): boolean => {
    if (!user) return false;

    // PVMO_ADMIN pode acessar qualquer loja
    if (user.role === PlatformUserRole.PVMO_ADMIN) {
      return true;
    }

    // Verificar se tem acesso específico à loja
    return user.stores.some(store =>
      store.storeSlug === storeSlug &&
      store.isActive
    );
  };

  const canManageStore = (storeSlug: string): boolean => {
    if (!user) return false;

    if (user.role === PlatformUserRole.PVMO_ADMIN) {
      return true;
    }

    const storeAccess = user.stores.find(store =>
      store.storeSlug === storeSlug && store.isActive
    );

    if (!storeAccess) return false;

    // ✅ CORRIGIR: Usar valores literais em vez do enum para comparação
    const ownerRoles: string[] = ['OWNER', 'MANAGER'];

    // OWNER e MANAGER sempre podem gerenciar
    if (ownerRoles.includes(storeAccess.storeRole)) {
      return true;
    }

    // EMPLOYEE pode gerenciar se tiver permissão específica
    if (storeAccess.storeRole === 'EMPLOYEE') {
      return storeAccess.permissions.canManageProducts ||
        storeAccess.permissions.canManageUsers;
    }

    return false;
  };

  // Inicialização - verificar se há token salvo
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('[Auth Context] Inicializando autenticação...');
      setIsLoading(true);

      const [savedToken, savedUser] = await Promise.all([
        secureStorage.getToken(),
        localStorage.getUserData(),
      ]);

      if (savedToken && savedUser) {
        console.log('[Auth Context] Token e usuário encontrados no storage');

        const isTokenValid = await authService.validateToken(savedToken);

        if (isTokenValid) {
          console.log('[Auth Context] Token válido, restaurando sessão');
          setToken(savedToken);
          setUser(savedUser);

          try {
            await loadStoresData(savedToken);
          } catch (error) {
            console.log('[Auth Context] Erro ao carregar lojas na inicialização (ignorando erro)');
          }
        } else {
          console.log('[Auth Context] Token inválido, limpando dados');
          await clearAuthData();
        }
      } else {
        console.log('[Auth Context] Nenhum token ou usuário encontrado');
      }
    } catch (error) {
      console.error('[Auth Context] Erro na inicialização:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadStoresData = async (authToken: string) => {
    try {
      console.log('[Auth Context] Carregando dados das lojas...');

      const stores = await storeService.getMyStores(authToken);
      setAllStores(stores);

      const primaryStore = stores.find(store => store.isActive) || stores[0];
      if (primaryStore) {
        setStoreData(primaryStore);
        console.log('[Auth Context] Dados das lojas carregados. Loja principal:', primaryStore.name);
      }
    } catch (error: any) {
      console.error('[Auth Context] Erro ao carregar dados das lojas:', error);
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials, rememberEmail = false) => {
    try {
      console.log('[Auth Context] Iniciando login...');
      setIsLoading(true);

      const response = await authService.login(credentials);

      if (!response.success || !response.data) {
        throw new Error('Resposta de login inválida');
      }

      const { token: newToken, user: userData } = response.data;

      await Promise.all([
        secureStorage.setToken(newToken),
        localStorage.setUserData(userData),
        rememberEmail
          ? localStorage.setRememberEmail(credentials.email)
          : localStorage.removeRememberEmail(),
      ]);

      setToken(newToken);
      setUser(userData);

      loadStoresData(newToken);

      console.log('[Auth Context] Login realizado com sucesso');
    } catch (error) {
      console.error('[Auth Context] Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const performTokenRefresh = async (currentToken: string): Promise<boolean> => {
    try {
      console.log('[Auth Context] Executando refresh do token...');

      const response = await authService.refreshToken(currentToken);

      // Verificação defensiva para ambos os tipos de resposta
      let tokenData: { token: string; user: User } | null = null;

      // Se for ApiResponse<RefreshResponse>
      if (response && typeof response === 'object' && 'success' in response) {
        if (response.success && response.data) {
          tokenData = response.data;
        }
      }
      // Se for RefreshResponse direta
      else if (response && typeof response === 'object' && 'token' in response && 'user' in response) {
        tokenData = response as any;
      }

      if (tokenData) {
        const { token: newToken, user: userData } = tokenData;

        await Promise.all([
          secureStorage.setToken(newToken),
          localStorage.setUserData(userData),
        ]);

        setToken(newToken);
        setUser(userData);

        try {
          await loadStoresData(newToken);
        } catch (error) {
          console.warn('[Auth Context] Erro ao recarregar lojas após refresh (ignorando)');
        }

        console.log('[Auth Context] Token atualizado com sucesso');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Auth Context] Erro no refresh do token:', error);
      return false;
    }
  };

  const refreshAuthToken = async (): Promise<boolean> => {
    if (!token) {
      console.warn('[Auth Context] Não é possível fazer refresh sem token');
      return false;
    }

    return await performTokenRefresh(token);
  };

  const ensureValidToken = async (): Promise<boolean> => {
    if (!token) {
      console.warn('[Auth Context] Nenhum token disponível');
      return false;
    }

    try {
      const isValid = await authService.validateToken(token);

      if (isValid) {
        console.log('[Auth Context] Token atual é válido');
        return true;
      }

      console.log('[Auth Context] Token inválido, tentando refresh...');
      const refreshSuccess = await refreshAuthToken();

      if (!refreshSuccess) {
        console.warn('[Auth Context] Refresh falhou, mas não fazendo logout automático');
      }

      return refreshSuccess;

    } catch (error) {
      console.error('[Auth Context] Erro ao validar token:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth Context] Iniciando logout...');
      setIsLoading(true);

      await clearAuthData();
      console.log('[Auth Context] Logout realizado');
    } catch (error) {
      console.error('[Auth Context] Erro no logout:', error);
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    if (!token) {
      console.warn('[Auth Context] Não é possível atualizar dados sem token');
      return;
    }

    try {
      console.log('[Auth Context] Atualizando dados do usuário...');

      const userData = await authService.getMe(token);

      await localStorage.setUserData(userData);
      setUser(userData);

      console.log('[Auth Context] Dados do usuário atualizados');
    } catch (error: any) {
      console.error('[Auth Context] Erro ao atualizar dados do usuário:', error);

      if (error.statusCode === 401) {
        console.log('[Auth Context] Token expirado, fazendo logout');
        await logout();
      }

      throw error;
    }
  };

  const refreshStoreData = async () => {
    if (!token) {
      console.warn('[Auth Context] Não é possível atualizar dados das lojas sem token');
      return;
    }

    try {
      console.log('[Auth Context] Atualizando dados das lojas...');
      await loadStoresData(token);
    } catch (error) {
      console.error('[Auth Context] Erro ao atualizar dados das lojas:', error);
      throw error;
    }
  };

  const switchStore = async (storeId: string) => {
    try {
      console.log('[Auth Context] Trocando para loja:', storeId);

      const targetStore = allStores.find(store => store.id === storeId);
      if (!targetStore) {
        throw new Error('Loja não encontrada');
      }

      setStoreData(targetStore);
      console.log('[Auth Context] Loja alterada para:', targetStore.name);
    } catch (error) {
      console.error('[Auth Context] Erro ao trocar de loja:', error);
      throw error;
    }
  };

  const clearAuthData = async () => {
    setToken(null);
    setUser(null);
    setStoreData(null);
    setAllStores([]);

    await Promise.all([
      secureStorage.removeToken(),
      localStorage.removeUserData(),
    ]);
  };

  const contextValue: AuthContextData = {
    user,
    token,
    storeData,
    allStores,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUserData,
    refreshStoreData,
    switchStore,
    refreshAuthToken,
    ensureValidToken,
    canAccessStore,  // ✅ EXPORTADO
    canManageStore,  // ✅ EXPORTADO
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};