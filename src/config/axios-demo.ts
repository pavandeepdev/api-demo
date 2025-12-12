import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';


/**
 * Demo Axios Instance for Teaching
 * 
 * This is a simplified version of axios configuration for teaching purposes.
 * It demonstrates how interceptors work with clear logging and comments.
 * 
 * Base URL: JSONPlaceholder - A free fake REST API for testing and prototyping
 */

export const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Create axios instance with base configuration
const axiosDemo = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
// This runs BEFORE every request is sent to the server

axiosDemo.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log('🚀 [REQUEST INTERCEPTOR] Outgoing Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            fullURL: `${config.baseURL}${config.url}`,
            headers: config.headers,
            data: config.data,
        });

        // 1. Add custom headers
        config.headers['X-Custom-Header'] = 'Demo-App';
        config.headers['X-Request-Time'] = new Date().toISOString();

        // 2. Add authentication token (if available)
        const token = localStorage.getItem('demo_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 [REQUEST INTERCEPTOR] Added auth token');
        }

        // 3. Log request for teaching purposes
        console.log('✅ [REQUEST INTERCEPTOR] Request modified and ready to send');

        return config;
    },
    (error: AxiosError) => {
        console.error('❌ [REQUEST INTERCEPTOR] Request Error:', error);
        return Promise.reject(error);
    }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
// This runs AFTER receiving response from the server

axiosDemo.interceptors.response.use(
    (response) => {
        console.log('📥 [RESPONSE INTERCEPTOR] Incoming Response:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            headers: response.headers,
        });

        // 1. Log successful response
        console.log('✅ [RESPONSE INTERCEPTOR] Response received successfully');

        // 2. You can transform response data here if needed
        // For example: response.data = { success: true, data: response.data }

        return response;
    },
    async (error: AxiosError) => {
        console.error('❌ [RESPONSE INTERCEPTOR] Response Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            data: error.response?.data,
        });

        // Handle different error scenarios

        // 1. Handle 401 Unauthorized
        if (error.response?.status === 401) {
            console.warn('🔒 [RESPONSE INTERCEPTOR] Unauthorized - Token might be expired');

            // In a real app, you would:
            // - Try to refresh the token
            // - Redirect to login if refresh fails
            // - Clear local storage

            // For demo purposes, just log
            console.log('💡 [RESPONSE INTERCEPTOR] In production: Redirect to login or refresh token');
        }

        // 2. Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.warn('🚫 [RESPONSE INTERCEPTOR] Forbidden - Access denied');
        }

        // 3. Handle 404 Not Found
        if (error.response?.status === 404) {
            console.warn('🔍 [RESPONSE INTERCEPTOR] Not Found - Resource does not exist');
        }

        // 4. Handle 500 Server Error
        if (error.response?.status === 500) {
            console.error('💥 [RESPONSE INTERCEPTOR] Server Error - Something went wrong on the server');
        }

        // 5. Handle Network Error (no response)
        if (!error.response) {
            console.error('🌐 [RESPONSE INTERCEPTOR] Network Error - Check your internet connection');
        }

        return Promise.reject(error);
    }
);

export default axiosDemo;
