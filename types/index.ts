// src/types/index.ts - CORRIGIDO para compatibilidade com backend

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

// ✅ CORRIGIDO: User interface baseada no schema Prisma real
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'PVMO_ADMIN' | 'PLATFORM_USER';
    stores: StoreAccess[];
}

// ✅ CORRIGIDO: StoreAccess baseado no UserStoreAccess do backend
export interface StoreAccess {
    storeId: string;
    storeSlug: string;
    storeName: string;
    storeRole: 'OWNER' | 'MANAGER' | 'EMPLOYEE' | 'VIEWER'; // ✅ ADICIONADO: campo que estava faltando
    permissions: StorePermissions;
    isActive: boolean;
    createdAt?: string; // ✅ ADICIONADO: campos do backend
}

// ✅ NOVO: Interface de permissões granulares
export interface StorePermissions {
    canManageProducts: boolean;
    canManageUsers: boolean;
    canManageOrders: boolean;
    canViewAnalytics: boolean;
    canManageSettings: boolean;
    canManageFinances: boolean;
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

// ✅ CORRIGIDO: StoreData baseado no modelo Store do Prisma
export interface StoreData {
    id: string;
    name: string;
    slug: string;
    clientEmail: string;
    isActive: boolean;
    collections: Record<string, boolean>; // ✅ CORRIGIDO: tipo mais específico
    settings?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string; // ✅ ADICIONADO: soft delete
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
    newToken?: string; // ✅ CORRIGIDO: campo opcional
}

// ✅ CORRIGIDO: CreatePlatformUserData baseado no DTO real
export interface CreatePlatformUserData {
    name: string;
    email: string;
    password: string;
    role: 'PVMO_ADMIN' | 'PLATFORM_USER'; // ❌ CORRIGIDO: apenas estes roles existem
}

// ✅ CORRIGIDO: PlatformUser baseado na resposta real da API
export interface PlatformUser {
    id: string;
    email: string;
    name: string;
    role: 'PVMO_ADMIN' | 'PLATFORM_USER'; // ❌ CORRIGIDO
    isActive: boolean;
    storeAccess: StoreAccessInfo[];
    createdAt: string;
    updatedAt: string;
}

// ✅ CORRIGIDO: StoreAccessInfo baseado no UserStoreAccessResponseDto
export interface StoreAccessInfo {
    storeId: string;
    storeSlug: string;
    storeName: string;
    storeRole: 'OWNER' | 'MANAGER' | 'EMPLOYEE' | 'VIEWER'; // ✅ ADICIONADO: campo essencial
    permissions: StorePermissions; // ✅ CORRIGIDO: tipo específico
    isActive: boolean;
    createdAt: string;
}

// ✅ NOVO: Interfaces para produtos (baseado no backend)
export interface ProductDimensions {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
}

export interface ProductAnalytics {
    views: number;
    sales: number;
    addCart: number;
    review: number;
}

// ✅ NOVO: Product interface baseada no CollectionItemResponseDto
export interface Product {
    id: string;
    collectionKey: string;
    name: string;
    type: string;
    description: string;
    imageList: string[];
    videoUrl: string[];
    tag: string[];

    // Estoques por tamanho
    storageP: number;
    storageM: number;
    storageG: number;
    storageU: number;
    storageChild: number;
    storagePP: number;
    storageGG: number;
    storageEXG: number;
    storageLocation: string;

    price: number; // ⚠️ SEMPRE EM CENTAVOS
    discount: number;
    featured: boolean;
    isActive: boolean;
    sponsor?: string;
    weight: number;
    dimensions: ProductDimensions;
    correlated: string[];
    marketAffiliateIds: string[];
    analytics: ProductAnalytics;

    createdAt: string;
    updatedAt: string;
    deletedAt?: string;

    // Helper methods (implementados no service)
    getPriceInReais(): number;
    getFormattedPrice(): string;
    getFinalPriceInCents(): number;
    getFinalPriceInReais(): number;
    getFormattedFinalPrice(): string;
}

// ✅ NOVO: ProductData para criação (baseado no CreateCollectionItemDto)
export interface ProductData {
    collectionKey: string;
    name: string;
    type: string;
    description: string;
    imageList: string[];
    videoUrl: string[];
    tag: string[];

    storageP: number;
    storageM: number;
    storageG: number;
    storageU: number;
    storageChild?: number;
    storagePP?: number;
    storageGG?: number;
    storageEXG?: number;
    storageLocation: string;

    price: number; // ⚠️ SEMPRE EM CENTAVOS
    discount: number;
    featured: boolean;
    isActive: boolean;
    sponsor?: string;
    weight: number;
    dimensions: ProductDimensions;
    correlated: string[];
    marketAffiliateIds: string[];
    analytics: ProductAnalytics;
}

// ✅ NOVO: Enum de coleções (baseado no CollectionKey do backend)
export enum CollectionKey {
    ITEM_COLLECTION_BIQUINIS = 'item-collection-biquinis',
    ITEM_COLLECTION_MONTESEUBIQUINI = 'item-collection-monteseubiquini',
    ITEM_COLLECTION_ACESSORIOS = 'item-collection-acessorios',
    ITEM_COLLECTION_VESTUARIO = 'item-collection-vestuario',
    ITEM_COLLECTION_FITNESS = 'item-collection-fitness',
    ITEM_COLLECTION_MAIOS = 'item-collection-maios',
    ITEM_COLLECTION_SAIDAS = 'item-collection-saidas',
    ITEM_COLLECTION_CALCADOS = 'item-collection-calcados',
    ITEM_COLLECTION_BOLSAS = 'item-collection-bolsas',
    ITEM_COLLECTION_CAMISETAS = 'item-collection-camisetas',
    ITEM_COLLECTION_SHORTS = 'item-collection-shorts',
    ITEM_COLLECTION_SAPATOS = 'item-collection-sapatos',
    ITEM_COLLECTION_TENIS = 'item-collection-tenis',
    ITEM_COLLECTION_CAMISAS = 'item-collection-camisas',
    ITEM_COLLECTION_BLUSAS = 'item-collection-blusas',
    ITEM_COLLECTION_CALCAS = 'item-collection-calcas',
    ITEM_COLLECTION_JEANS = 'item-collection-jeans',
    ITEM_COLLECTION_UNDERWEAR = 'item-collection-underwear',
    ITEM_COLLECTION_LINGERIE = 'item-collection-lingerie',
    ITEM_COLLECTION_INFANTIL = 'item-collection-infantil',
    ITEM_COLLECTION_MASCULINO = 'item-collection-masculino',
}

// ✅ NOVO: Response para lista de produtos
export interface ProductListResponse {
    items: Product[];
    total: number;
    page: number;
    totalPages: number;
    collectionKey?: string;
}

// ✅ NOVO: Helper para conversão de preços
export class PriceHelper {
    static toCents(priceInReais: number): number {
        return Math.round(priceInReais * 100);
    }

    static toReais(priceInCents: number): number {
        return priceInCents / 100;
    }

    static format(priceInCents: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(priceInCents / 100);
    }

    static formatReais(priceInReais: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(priceInReais);
    }
}

// ✅ NOVO: Enums para roles (para type safety)
export enum PlatformUserRole {
    PVMO_ADMIN = 'PVMO_ADMIN',
    PLATFORM_USER = 'PLATFORM_USER'
}

export enum StoreUserRole {
    OWNER = 'OWNER',
    MANAGER = 'MANAGER',
    EMPLOYEE = 'EMPLOYEE',
    VIEWER = 'VIEWER'
}

export enum StoreCustomerRole {
    CUSTOMER = 'CUSTOMER',
    GUEST = 'GUEST'
}

// ✅ NOVO: Status de pedidos (baseado no backend)
export enum OrderStatus {
    PENDENTE = 'pendente',
    EM_SEPARACAO = 'em_separacao',
    EMBALADO = 'embalado',
    ENVIADO = 'enviado',
    CONCLUIDO = 'concluido',
    EXPIRADO = 'expirado',
    CANCELADO = 'cancelado',
    DEVOLVIDO = 'devolvido'
}

// ✅ NOVO: Type guards para verificação de tipos
export function isPlatformAdmin(user: User): boolean {
    return user.role === PlatformUserRole.PVMO_ADMIN;
}

export function hasStoreAccess(user: User, storeSlug: string): boolean {
    return user.stores.some(store =>
        store.storeSlug === storeSlug && store.isActive
    );
}

export function canManageStore(user: User, storeSlug: string): boolean {
    if (isPlatformAdmin(user)) return true;

    const storeAccess = user.stores.find(store =>
        store.storeSlug === storeSlug && store.isActive
    );

    return storeAccess?.storeRole === StoreUserRole.OWNER ||
        storeAccess?.permissions.canManageProducts === true;
}

// Add to your types
export interface ApiErrorResponse {
    success: false;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    message: string;
    error: string;
}

