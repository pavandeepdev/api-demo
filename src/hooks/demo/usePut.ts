import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import axiosDemo from '@/config/axios-demo';
import type { AxiosError } from 'axios';

/**
 * usePut Hook - Simplified for Teaching
 * 
 * A custom hook for PUT/PATCH requests using TanStack Query mutations.
 * This hook demonstrates how to update data with optimistic updates,
 * automatic rollback on error, and cache invalidation.
 * 
 * @param url - API endpoint (e.g., '/users/1')
 * @param options - Optional mutation options including optimistic updates
 * 
 * @example
 * const updateUser = usePut<User, UpdateUserDto>('/users/1', {
 *   invalidateQueries: ['users'],
 *   method: 'PATCH',
 *   onSuccess: (data) => console.log('Updated:', data)
 * });
 * 
 * updateUser.mutate({ name: 'John Updated' });
 */

interface UsePutOptions<TData, TVariables>
    extends Omit<UseMutationOptions<TData, AxiosError, TVariables>, 'mutationFn'> {
    invalidateQueries?: string[]; // Query keys to invalidate after success
    method?: 'PUT' | 'PATCH'; // HTTP method (default: PUT)
}

export function usePut<TData = unknown, TVariables = unknown>(
    url: string,
    options?: UsePutOptions<TData, TVariables>
) {
    const queryClient = useQueryClient();
    const method = options?.method || 'PUT';

    console.log(`🎣 [usePut Hook] Setting up ${method} mutation for:`, url);

    return useMutation<TData, AxiosError, TVariables>({
        mutationFn: async (body: TVariables) => {
            console.log(`📡 [usePut Hook] Sending ${method} request to:`, url, 'with data:', body);

            const { data } = method === 'PUT'
                ? await axiosDemo.put<TData>(url, body)
                : await axiosDemo.patch<TData>(url, body);

            console.log('✅ [usePut Hook] Data updated successfully:', data);

            return data;
        },

        // Optimistic update - update UI before server responds
        onMutate: async (variables) => {
            console.log('⚡ [usePut Hook] Optimistic update - updating UI immediately');

            if (options?.invalidateQueries && options.invalidateQueries.length > 0) {
                const queryKey = options.invalidateQueries[0];

                // Cancel outgoing refetches to avoid overwriting optimistic update
                await queryClient.cancelQueries({ queryKey: [queryKey] });

                // Snapshot the previous value for rollback
                const previousData = queryClient.getQueryData([queryKey]);

                // Optimistically update the cache
                queryClient.setQueryData([queryKey], variables);

                console.log('💾 [usePut Hook] Saved previous data for potential rollback');

                // Return context with previous data for rollback
                return { previousData, queryKey };
            }

            return options?.onMutate?.(variables);
        },

        onSuccess: (data, variables, context) => {
            console.log('🎉 [usePut Hook] Mutation successful!');

            // Invalidate queries to refetch fresh data from server
            if (options?.invalidateQueries) {
                console.log('🔄 [usePut Hook] Invalidating queries:', options.invalidateQueries);

                options.invalidateQueries.forEach((key) => {
                    queryClient.invalidateQueries({ queryKey: [key] });
                });
            }

            options?.onSuccess?.(data, variables, context);
        },

        onError: (error, variables, context: any) => {
            console.error('❌ [usePut Hook] Mutation failed:', error);

            // Rollback optimistic update
            if (context?.previousData && context?.queryKey) {
                console.log('↩️ [usePut Hook] Rolling back optimistic update');
                queryClient.setQueryData([context.queryKey], context.previousData);
            }

            options?.onError?.(error, variables, context);
        },

        ...options,
    });
}
