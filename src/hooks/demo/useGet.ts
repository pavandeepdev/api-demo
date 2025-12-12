import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import axiosDemo from '@/config/axios-demo';
import type { AxiosError } from 'axios';

/**
 * useGet Hook - Simplified for Teaching
 * 
 * A custom hook for GET requests using TanStack Query.
 * This hook demonstrates how to fetch data with automatic caching,
 * loading states, and error handling.
 * 
 * @param url - API endpoint (e.g., '/users')
 * @param params - Optional query parameters (e.g., { page: 1, limit: 10 })
 * @param options - Optional TanStack Query options
 * 
 * @example
 * const { data, isLoading, error } = useGet<User[]>('/users');
 * const { data: user } = useGet<User>('/users/1');
 * const { data: posts } = useGet<Post[]>('/posts', { userId: 1 });
 */

interface UseGetOptions<TData> extends Omit<UseQueryOptions<TData, AxiosError>, 'queryKey' | 'queryFn'> {
    enabled?: boolean;
}

export function useGet<TData = unknown>(
    url: string,
    params?: Record<string, any>,
    options?: UseGetOptions<TData>
) {
    // Generate unique query key based on URL and params
    // This is crucial for caching - same key = same cached data
    const queryKey = params ? [url, params] : [url];

    console.log('🎣 [useGet Hook] Setting up query:', { url, params, queryKey });

    return useQuery<TData, AxiosError>({
        queryKey,

        queryFn: async () => {
            console.log('📡 [useGet Hook] Fetching data from:', url);

            const { data } = await axiosDemo.get<TData>(url, { params });

            console.log('✅ [useGet Hook] Data fetched successfully:', data);

            return data;
        },

        // Default options (can be overridden)
        staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
        retry: 2, // Retry failed requests twice
        refetchOnWindowFocus: false, // Don't refetch when window regains focus

        // Merge with custom options
        ...options,
    });
}
