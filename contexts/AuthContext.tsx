import { authService } from '@/services/authService';
import { StoreData, storeService } from '@/services/storeService';
import { LoginCredentials, User } from '@/types';
import { localStorage, secureStorage } from '@/utils/storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';


interface AuthContextData {
  user: User | null;
  token: string | null;
  storeData: StoreData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials, rememberEmail?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshStoreData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Inicialização - verificar se há token salvo
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('[Auth Context] Inicializando autenticação...');
      setIsLoading(true);

      // Tentar recuperar token e dados do usuário salvos
      const [savedToken, savedUser] = await Promise.all([
        secureStorage.getToken(),
        localStorage.getUserData(),
      ]);

      if (savedToken && savedUser) {
        console.log('[Auth Context] Token e usuário encontrados no storage');

        // Validar se o token ainda é válido
        const isTokenValid = await authService.validateToken(savedToken);

        if (isTokenValid) {
          console.log('[Auth Context] Token válido, restaurando sessão');
          setToken(savedToken);
          setUser(savedUser);

          // Carregar dados da loja em background
          loadStoreData(savedToken);
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

  const loadStoreData = async (authToken: string) => {
    try {
      console.log('[Auth Context] Carregando dados da loja...');
      const store = await storeService.getMyStore(authToken);
      setStoreData(store);
      console.log('[Auth Context] Dados da loja carregados:', store.name);
    } catch (error) {
      console.error('[Auth Context] Erro ao carregar dados da loja:', error);
      // Não bloquear a autenticação se falhar ao carregar a loja
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

      // Carregar dados da loja em background
      loadStoreData(newToken);

      console.log('[Auth Context] Login realizado com sucesso');
    } catch (error) {
      console.error('[Auth Context] Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth Context] Iniciando logout...');
      setIsLoading(true);

      // Tentar fazer logout no backend se há token
      if (token) {
        try {
          await authService.logout(token);
        } catch (error) {
          console.warn('[Auth Context] Erro no logout do backend, continuando...');
        }
      }

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
    } catch (error) {
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
      console.warn('[Auth Context] Não é possível atualizar dados da loja sem token');
      return;
    }

    try {
      console.log('[Auth Context] Atualizando dados da loja...');
      await loadStoreData(token);
    } catch (error) {
      console.error('[Auth Context] Erro ao atualizar dados da loja:', error);
      throw error;
    }
  };

  const clearAuthData = async () => {
    setToken(null);
    setUser(null);
    setStoreData(null);

    await Promise.all([
      secureStorage.removeToken(),
      localStorage.removeUserData(),
    ]);
  };

  const contextValue: AuthContextData = {
    user,
    token,
    storeData,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUserData,
    refreshStoreData,
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