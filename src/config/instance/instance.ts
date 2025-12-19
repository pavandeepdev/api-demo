import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

const token = '';

const axiosInstance = axios.create({
  baseURL: 'https://dtep-river-api-staging.devstree.in/api/v1/',
  timeout: 50000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
});


/**
 * REQUEST INTERCEPTOR
 * 
 * This runs BEFORE every API request is sent to the server.
 * Use it to:
 * - Add authentication tokens
 * - Set custom headers
 * - Log requests for debugging
 * - Transform request data
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Add Authorization Token
    // In production, get token from localStorage or state management
    config.headers.Authorization = `Bearer ${token}`;

    // 2. Handle Different Content Types
    if (config.data instanceof FormData) {
      // For file uploads, let browser set Content-Type with boundary
      config.headers['Content-Type'] = 'multipart/form-data';
    } else if (config.data) {
      // For JSON data
      config.headers['Content-Type'] = 'application/json;charset=utf-8';
    }

    // 3. Log request for debugging (remove in production)
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);

    return config;
  },
  (error) => {
    // Handle request errors
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * 
 * This runs AFTER receiving a response from the server.
 * Use it to:
 * - Handle errors globally (401, 403, 500, etc.)
 * - Transform response data
 * - Log responses for debugging
 * - Refresh tokens automatically
 */
axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    console.log("response data", res)
    // 1. Validate response structure
    if (!res.data) throw new Error('Error in response');

    // 2. Check for success status codes
    const { status: statusCode } = res;
    const hasSuccess = (statusCode === 200 || statusCode === 201)

    // 3. Log successful response
    console.log('📥 Response:', statusCode, res.config.url);

    if (hasSuccess) return res?.data;
  },
  (error: AxiosError) => {
    // 4. Handle different error status codes
    const { response } = error || {};
    const status = response?.status;

    // Handle 401 Unauthorized - Clear auth and redirect to login
    if (status === 401) {
      console.error('🔐 Unauthorized - Clearing session');
      // setItem(StorageEnum.Token, null);
      window.localStorage.clear();
      // window.location.href = '/login'; // Uncomment to redirect
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.error('🚫 Forbidden - Insufficient permissions');
    }

    // Handle 500 Server Error
    if (status === 500) {
      console.error('💥 Server Error');
    }

    // Log error for debugging
    console.error('❌ Response Error:', status, error.message);

    return Promise.reject(error);
  }
);

class Instance {
  get<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET' });
  }

  post<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST' });
  }

  put<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PUT' });
  }

  patch<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PATCH' });
  }

  delete<T = any>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE' });
  }

  request<T = any>(config: AxiosRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      axiosInstance
        .request<any, AxiosResponse>(config)
        .then((res: AxiosResponse) => {
          resolve(res as unknown as Promise<T>);
        })
        .catch((e: Error | AxiosError) => {
          reject(e);
        });
    });
  }
}

export default new Instance();