// Interfaces para tipos da aplicação

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    data: T;
    message?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

// CORRIGIDO: User interface baseada na resposta da API
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'PVMO_ADMIN' | 'STORE_OWNER' | 'STORE_EMPLOYEE' | 'DEFAULT_USER';
    stores: StoreAccess[];  // Lojas que o usuário tem acesso
}

export interface StoreAccess {
    storeId: string;
    storeSlug: string;
    storeName: string;
    permissions: {
        canManage?: boolean;
        canManageProducts?: boolean;
        canManageUsers?: boolean;
        [key: string]: any;
    };
    isActive: boolean;
}

export interface LoginResponse {
    success: boolean;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    data: {
        token: string;
        user: User;
    };
}

export interface RefreshResponse {
    token: string;
    user: User;
}

export interface StoreData {
    id: string;
    name: string;
    slug: string;              // ADICIONADO: campo que estava faltando
    clientEmail: string;
    isActive: boolean;
    collections: { [key: string]: boolean };
    settings?: { [key: string]: any };  // ADICIONADO: campo settings
    createdAt: string;
    updatedAt: string;
}

export interface StoreListResponse {
    stores: StoreData[];
    total: number;
    page: number;
    totalPages: number;
}

export interface StoreStatsData {
    totalCollections: number;
    activeCollections: number;
    inactiveCollections: number;
    totalUsers: number;
    storeAge: string;
    lastUpdate: string;
}

export interface CreateStoreWithOwnerData {
    name: string;
    clientEmail: string;
    ownerId: string;
    collections?: Record<string, boolean>;
    settings?: Record<string, any>;
}

export interface StoreWithOwnerResponse extends StoreData {
    owner: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    newToken: string;
}

export interface CreatePlatformUserData {
    name: string;
    email: string;
    password: string;
    role: 'PVMO_ADMIN' | 'STORE_OWNER' | 'STORE_EMPLOYEE' | 'DEFAULT_USER';
}

export interface PlatformUser {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    storeAccess: StoreAccessInfo[];
    createdAt: string;
    updatedAt: string;
}


export interface StoreAccessInfo {
    storeId: string;
    storeSlug: string;
    storeName: string;
    permissions: Record<string, any>;
    isActive: boolean;
    createdAt: string;
}