import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getClientToken } from "@/config/getClientToken";
import { signOut } from "next-auth/react";

export const BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT;

// --- 1. Create the Axios Instance ---
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": true,
  },
});

interface ApiResponse<T> {
  statusCode: number;
  error: boolean;
  message?: string;
  messageCode?: string;
  data: T;
}



axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const accessToken = await getClientToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else if (config.data) {
      config.headers["Content-Type"] = "application/json;charset=utf-8";
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  <T>(res: AxiosResponse<ApiResponse<T>>) => {
    if (!res.data) throw new Error("Error in response");
    const { statusCode, error } = res.data;
    const hasSuccess =
      (statusCode === 200 || statusCode === 201) && error === false;
    if (hasSuccess) {
      return res;
    }
    throw new Error(res.data.message || "Unknown API error");
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      if (typeof window !== "undefined") {
        await signOut();
        window.localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

class Instance {
  // ✅ POST method with consistent signature
  post<T, D = any>(
    url: string,
    data?: D,
    config?: Omit<AxiosRequestConfig, "url" | "data" | "method">
  ): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({
      url,
      data,
      method: "POST",
      ...config,
    });
  }

  // ✅ GET method with consistent signature
  get<T>(
    url: string,
    config?: Omit<AxiosRequestConfig, "url" | "method">
  ): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({
      url,
      method: "GET",
      ...config,
    });
  }

  // ✅ PUT method with consistent signature
  put<T, D = any>(
    url: string,
    data?: D,
    config?: Omit<AxiosRequestConfig, "url" | "data" | "method">
  ): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({
      url,
      data,
      method: "PUT",
      ...config,
    });
  }

  // ✅ PATCH method with consistent signature
  patch<T, D = any>(
    url: string,
    data?: D,
    config?: Omit<AxiosRequestConfig, "url" | "data" | "method">
  ): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({
      url,
      data,
      method: "PATCH",
      ...config,
    });
  }

  // ✅ DELETE method with consistent signature
  delete<T>(
    url: string,
    config?: Omit<AxiosRequestConfig, "url" | "method">
  ): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>({
      url,
      method: "DELETE",
      ...config,
    });
  }

  private request<T>(config: AxiosRequestConfig): Promise<T> {
    return axiosInstance.request<T>(config).then((res) => res.data);
  }
}

export const instance = new Instance();
