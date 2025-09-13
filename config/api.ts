// src/config/api.ts - CORRIGIDO BASEADO NOS ENDPOINTS REAIS

// Configuração da API
export const API_CONFIG = {
    BASE_URL: __DEV__
        ? process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.3:3333'
        : 'https://pvmo-api-production.up.railway.app',

    ENDPOINTS: {
        // === TENANT/ADMIN ===
        TENANT: {
            LIST_SCHEMAS: '/admin/tenants/schemas',
            CREATE_SCHEMA: (storeId: string) => `/admin/tenants/${storeId}/create-schema`
        },

        // === PLATFORM AUTHENTICATION ===
        PLATFORM_AUTH: {
            LOGIN: '/platform/auth/login',
            ME: '/platform/auth/me',
            GRANT_STORE_ACCESS: '/platform/auth/grant-store-access',
            REFRESH: '/platform/auth/refresh'
        },

        // === STORE AUTHENTICATION ===
        STORE_AUTH: {
            LOGIN: (storeSlug: string) => `/stores/${storeSlug}/auth/login`,
            REGISTER: (storeSlug: string) => `/stores/${storeSlug}/auth/register`,
            ME: (storeSlug: string) => `/stores/${storeSlug}/auth/me`
        },

        // === PLATFORM USERS ===
        PLATFORM_USERS: {
            CREATE: '/platform/users',
            LIST: '/platform/users',
            GET_BY_ID: (userId: string) => `/platform/users/${userId}`,
            UPDATE: (userId: string) => `/platform/users/${userId}`,
            DELETE: (userId: string) => `/platform/users/${userId}`,
            GRANT_STORE_ACCESS: (userId: string, storeId: string) =>
                `/platform/users/${userId}/stores/${storeId}/access`,
            REVOKE_STORE_ACCESS: (userId: string, storeId: string) =>
                `/platform/users/${userId}/stores/${storeId}/access`,
            GET_STORE_ACCESS: (userId: string) => `/platform/users/${userId}/stores`
        },

        // === STORES ===
        STORES: {
            CREATE: '/stores',
            LIST: '/stores',
            MY_STORES: '/stores/my-stores',
            GET_BY_ID: (storeId: string) => `/stores/${storeId}`,
            UPDATE: (storeId: string) => `/stores/${storeId}`,
            DELETE: (storeId: string) => `/stores/${storeId}`,
            UPDATE_COLLECTIONS: (storeId: string) => `/stores/${storeId}/collections`,
            TOGGLE_ACTIVE: (storeId: string) => `/stores/${storeId}/toggle-active`,
            CREATE_WITH_OWNER: '/stores/with-owner'
        },

        // === COLLECTIONS (BASEADO NO QUE FOI MOSTRADO ANTERIORMENTE) ===
        COLLECTIONS: {
            // Rotas públicas da loja
            ITEMS: (storeSlug: string) => `/stores/${storeSlug}/collections`,
            ITEM_GET: (storeSlug: string, itemId: string) =>
                `/stores/${storeSlug}/collections/${itemId}`,

            // Rotas administrativas da plataforma
            ADMIN_ALL: (storeSlug: string) => `/stores/${storeSlug}/collections/admin/all`,
            CREATE_PLATFORM: (storeSlug: string) => `/stores/${storeSlug}/collections`,
            UPDATE_PLATFORM: (storeSlug: string, itemId: string) =>
                `/stores/${storeSlug}/collections/${itemId}`,
            DELETE_PLATFORM: (storeSlug: string, itemId: string) =>
                `/stores/${storeSlug}/collections/${itemId}`,

            // Rotas da loja (store admin)
            CREATE_STORE: (storeSlug: string) => `/stores/${storeSlug}/collections/store-admin`,
            UPDATE_STORE: (storeSlug: string, itemId: string) =>
                `/stores/${storeSlug}/collections/store-admin/${itemId}`,
            DELETE_STORE: (storeSlug: string, itemId: string) =>
                `/stores/${storeSlug}/collections/store-admin/${itemId}`
        },

        // === HEALTH CHECK ===
        HEALTH: '/health'
    },

    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },

    TIMEOUT: 30000
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