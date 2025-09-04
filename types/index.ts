export interface User {
    id: string;
    email: string;
    name: string;
    role: 'pvmo_admin' | 'store_client' | 'employee';
    storeId?: string; // apenas para store_client
    createdAt?: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
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

export interface ApiResponse<T = any> {
    success: boolean;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    data?: T;
    message?: string;
    error?: string;
}

export interface Store {
    id: string;
    name: string;
    clientEmail: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}