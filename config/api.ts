
// Configuração da API
export const API_CONFIG = {
    BASE_URL: __DEV__
        ? 'https://pvmo-api-production.up.railway.app' // URL para desenvolvimento
        : 'https://pvmo-api-production.up.railway.app', // URL para produção

    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            ME: '/auth/me'
        },
        STORES: {
            LIST: '/stores',
            DETAILS: '/stores'
        }
    },

    // Headers padrão
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },

    // Timeout para requisições (em ms)
    TIMEOUT: 10000
};

// Função para obter a URL completa do endpoint
export const getApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Função para obter headers com token de autenticação
export const getAuthHeaders = (token?: string): Record<string, string> => {
    const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};