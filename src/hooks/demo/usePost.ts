import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import axiosDemo from '@/config/axios-demo';
import type { AxiosError } from 'axios';

/**
 * usePost Hook - Simplified for Teaching
 * 
 * A custom hook for POST requests using TanStack Query mutations.
 * This hook demonstrates how to create data with automatic cache invalidation,
 * loading states, and error handling.
 * 
 * @param url - API endpoint (e.g., '/users')
 * @param options - Optional mutation options including cache invalidation
 * 
 * @example
 * const createUser = usePost<User, CreateUserDto>('/users', {
 *   invalidateQueries: ['users'],
 *   onSuccess: (data) => console.log('Created:', data)
 * });
 * 
 * createUser.mutate({ name: 'John', email: 'john@example.com' });
 */

interface UsePostOptions<TData, TVariables>
    extends Omit<UseMutationOptions<TData, AxiosError, TVariables>, 'mutationFn'> {
    invalidateQueries?: string[]; // Query keys to invalidate after success
}

export function usePost<TData = unknown, TVariables = unknown>(
    url: string,
    options?: UsePostOptions<TData, TVariables>
) {
    const queryClient = useQueryClient();

    console.log('🎣 [usePost Hook] Setting up mutation for:', url);

    return useMutation<TData, AxiosError, TVariables>({
        mutationFn: async (body: TVariables) => {
            console.log('📡 [usePost Hook] Sending POST request to:', url, 'with data:', body);

            const { data } = await axiosDemo.post<TData>(url, body);

            console.log('✅ [usePost Hook] Data created successfully:', data);

            return data;
        },

        onSuccess: (data, variables, context) => {
            console.log('🎉 [usePost Hook] Mutation successful!');

            // Invalidate queries to refetch fresh data
            if (options?.invalidateQueries) {
                console.log('🔄 [usePost Hook] Invalidating queries:', options.invalidateQueries);

                options.invalidateQueries.forEach((key) => {
                    queryClient.invalidateQueries({ queryKey: [key] });
                });
            }

            // Call custom onSuccess if provided
            options?.onSuccess?.(data, variables, context);
        },

        onError: (error, variables, context) => {
            console.error('❌ [usePost Hook] Mutation failed:', error);

            // Call custom onError if provided
            options?.onError?.(error, variables, context);
        },

        ...options,
    });
}
