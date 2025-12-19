// Storage Keys
export const StorageEnum = {
    Token: 'auth_token',
    User: 'user_data',
    RefreshToken: 'refresh_token',
} as const;

export type StorageKey = typeof StorageEnum[keyof typeof StorageEnum];

// Order Types
export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    totalAmount: number;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: string;
    productName: string;
    quantity: number;
    price: number;
}

// API Response Types
export interface ApiResponse<T = any> {
    statusCode: number;
    error: boolean;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// User Types
export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
}

// Auth Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}
