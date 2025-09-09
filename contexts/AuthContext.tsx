import { authService } from '@/services/authService';
import { storeService } from '@/services/storeService';
import { LoginCredentials, StoreData, User } from '@/types';
import { localStorage, secureStorage } from '@/utils/storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextData {
  user: User | null;
  token: string | null;
  storeData: StoreData | null;
  allStores: StoreData[];           // NOVO: lista de todas as lojas do usuário
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials, rememberEmail?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshStoreData: () => Promise<void>;
  switchStore: (storeId: string) => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;           // NOVO: refresh manual
  ensureValidToken: () => Promise<boolean>;
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

  // Inicialização - verificar se há token salvo
  useEffect(() => {
    initializeAuth();
  }, []);

  // ATUALIZAR: Modificar initializeAuth para tentar refresh
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

        // Apenas validar token, sem tentar refresh automático
        const isTokenValid = await authService.validateToken(savedToken);

        if (isTokenValid) {
          console.log('[Auth Context] Token válido, restaurando sessão');
          setToken(savedToken);
          setUser(savedUser);

          // Tentar carregar lojas, mas não fazer refresh automático se falhar
          try {
            await loadStoresData(savedToken);
          } catch (error) {
            console.log('[Auth Context] Erro ao carregar lojas na inicialização (ignorando erro)');
            // NÃO BLOQUEAR a inicialização se lojas falharem
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

      // APENAS LANÇA O ERRO - SEM RETRY AUTOMÁTICO
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

      // Salvar token e dados do usuário
      await Promise.all([
        secureStorage.setToken(newToken),
        localStorage.setUserData(userData),
        rememberEmail
          ? localStorage.setRememberEmail(credentials.email)
          : localStorage.removeRememberEmail(),
      ]);

      setToken(newToken);
      setUser(userData);

      // Carregar dados das lojas em background
      loadStoresData(newToken);

      console.log('[Auth Context] Login realizado com sucesso');
    } catch (error) {
      console.error('[Auth Context] Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // NOVO: Método interno para fazer refresh
  const performTokenRefresh = async (currentToken: string): Promise<boolean> => {
    try {
      console.log('[Auth Context] Executando refresh do token...');

      const response = await authService.refreshToken(currentToken);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;

        // Atualizar token e dados
        await Promise.all([
          secureStorage.setToken(newToken),
          localStorage.setUserData(userData),
        ]);

        setToken(newToken);
        setUser(userData);

        // REMOVER ESTA LINHA:
        // await loadStoresData(newToken);

        console.log('[Auth Context] Token atualizado com sucesso');
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Auth Context] Erro no refresh do token:', error);
      return false;
    }
  };

  // NOVO: Método público para refresh manual
  const refreshAuthToken = async (): Promise<boolean> => {
    if (!token) {
      console.warn('[Auth Context] Não é possível fazer refresh sem token');
      return false;
    }

    return await performTokenRefresh(token);
  };
  // NOVO: Garantir que o token é válido
  const ensureValidToken = async (): Promise<boolean> => {
    if (!token) {
      console.warn('[Auth Context] Nenhum token disponível');
      return false;
    }

    try {
      // Testar se token atual funciona
      const isValid = await authService.validateToken(token);

      if (isValid) {
        console.log('[Auth Context] Token atual é válido');
        return true;
      }

      // Token inválido, tentar refresh
      console.log('[Auth Context] Token inválido, tentando refresh...');
      return await refreshAuthToken();

    } catch (error) {
      console.error('[Auth Context] Erro ao validar token:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth Context] Iniciando logout...');
      setIsLoading(true);

      // REMOVIDO: tentativa de logout no backend (endpoint não existe)
      // Apenas limpar dados locais
      await clearAuthData();
      console.log('[Auth Context] Logout realizado');
    } catch (error) {
      console.error('[Auth Context] Erro no logout:', error);
      // Mesmo com erro, limpar dados locais
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

      // Se falhar ao buscar dados, pode ser que o token expirou
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
      await loadStoresData(token); // SEM retry automático
    } catch (error) {
      console.error('[Auth Context] Erro ao atualizar dados das lojas:', error);
      throw error; // Lança erro para quem chamou decidir o que fazer
    }
  };

  // NOVO: Método para trocar de loja
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