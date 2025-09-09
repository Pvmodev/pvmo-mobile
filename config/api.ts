// Configuração da API
export const API_CONFIG = {
    BASE_URL: __DEV__
        ? 'http://192.168.0.3:3333' // URL para desenvolvimento (ajuste pelo seu IP)
        : 'https://pvmo-api-production.up.railway.app', // URL para produção

    ENDPOINTS: {
        AUTH: {
            LOGIN: '/platform/auth/login',
            ME: '/platform/auth/me',
            REFRESH: '/platform/auth/refresh',                    // NOVO: refresh token
            GRANT_ACCESS: '/platform/auth/grant-store-access'
        }, // GESTÃO DE USUÁRIOS DA PLATAFORMA
        PLATFORM_USERS: {
            LIST: '/platform/users',
            CREATE: '/platform/users',
            GET_BY_ID: (userId: string) => `/platform/users/${userId}`,
            UPDATE: (userId: string) => `/platform/users/${userId}`,
            DELETE: (userId: string) => `/platform/users/${userId}`,
            GRANT_STORE_ACCESS: (userId: string, storeId: string) =>
                `/platform/users/${userId}/stores/${storeId}/access`,
            REVOKE_STORE_ACCESS: (userId: string, storeId: string) =>
                `/platform/users/${userId}/stores/${storeId}/access`,
            GET_STORE_ACCESS: (userId: string) => `/platform/users/${userId}/stores`
        },
        STORES: {
            LIST: '/stores',
            CREATE: '/stores',
            CREATE_WITH_OWNER: '/stores/with-owner',
            MY_STORES: '/stores/my-stores',
            GET_BY_ID: (storeId: string) => `/stores/${storeId}`,
            UPDATE: (storeId: string) => `/stores/${storeId}`,
            UPDATE_COLLECTIONS: (storeId: string) => `/stores/${storeId}/collections`,
            TOGGLE_ACTIVE: (storeId: string) => `/stores/${storeId}/toggle-active`,
            DETAILS: '/stores',
            COLLECTIONS: (storeSlug: string) => `/stores/${storeSlug}/collections`,
            DELETE: (storeId: string) => `/stores/${storeId}`

        },
        COLLECTIONS: {
            // Rotas públicas (sem auth)
            ITEMS: (storeSlug: string) => `/stores/${storeSlug}/collections`,
            ITEM_GET: (storeSlug: string, itemId: string) =>
                `/stores/${storeSlug}/collections/${itemId}`,

            // Rotas administrativas (plataforma)
            ADMIN_ALL: (storeSlug: string) => `/stores/${storeSlug}/collections/admin/all`,
            CREATE_PLATFORM: (storeSlug: string) => `/stores/${storeSlug}/collections`,
            CREATE_STORE: (storeSlug: string) => `/stores/${storeSlug}/collections/store-admin`,
            COLLECTION_UPDATE: (storeSlug: string, itemId: string) => `/stores/${storeSlug}/collections/${itemId}`,
            COLLECTION_DELETE: (storeSlug: string, itemId: string) => `/stores/${storeSlug}/collections/${itemId}`,

            // Rotas da loja (store admin)
            STORE_CREATE: (storeSlug: string) => `/stores/${storeSlug}/collections/store-admin`,
            STORE_UPDATE: (storeSlug: string, itemId: string) => `/stores/${storeSlug}/collections/store-admin/${itemId}`,
            STORE_DELETE: (storeSlug: string, itemId: string) => `/stores/${storeSlug}/collections/store-admin/${itemId}`

        },
        // AUTENTICAÇÃO DE USUÁRIOS DE LOJAS
        STORE_AUTH: {
            LOGIN: (storeSlug: string) => `/stores/${storeSlug}/auth/login`,
            REGISTER: (storeSlug: string) => `/stores/${storeSlug}/auth/register`,
            ME: (storeSlug: string) => `/stores/${storeSlug}/auth/me`
        },
        TENANT: {
            LIST_SCHEMAS: '/admin/tenants/schemas',
            CREATE_SCHEMA: (storeId: string) => `/admin/tenants/${storeId}/create-schema`
        },
        // HEALTH CHECK
        HEALTH: '/health'
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