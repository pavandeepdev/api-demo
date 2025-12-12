import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import axiosDemo from '@/config/axios-demo';
import type { AxiosError } from 'axios';

/**
 * useDelete Hook - Simplified for Teaching
 * 
 * A custom hook for DELETE requests using TanStack Query mutations.
 * This hook demonstrates how to delete data with confirmation dialogs,
 * optimistic updates, and automatic cache invalidation.
 * 
 * @param url - Base API endpoint (e.g., '/users')
 * @param options - Optional mutation options including confirmation
 * 
 * @example
 * const deleteUser = useDelete('/users', {
 *   invalidateQueries: ['users'],
 *   confirmMessage: 'Are you sure you want to delete this user?',
 *   onSuccess: () => console.log('Deleted successfully')
 * });
 * 
 * deleteUser.mutate('123'); // Delete user with ID 123
 */

interface UseDeleteOptions<TData>
    extends Omit<UseMutationOptions<TData, AxiosError, string>, 'mutationFn'> {
    invalidateQueries?: string[]; // Query keys to invalidate after success
    confirmMessage?: string; // Optional confirmation dialog message
}

export function useDelete<TData = unknown>(
    url: string,
    options?: UseDeleteOptions<TData>
) {
    const queryClient = useQueryClient();

    console.log('🎣 [useDelete Hook] Setting up DELETE mutation for:', url);

    return useMutation<TData, AxiosError, string>({
        mutationFn: async (id: string) => {
            // Show confirmation dialog if message provided
            if (options?.confirmMessage) {
                const confirmed = window.confirm(options.confirmMessage);
                if (!confirmed) {
                    console.log('🚫 [useDelete Hook] Deletion cancelled by user');
                    throw new Error('Deletion cancelled');
                }
            }

            console.log('📡 [useDelete Hook] Sending DELETE request to:', `${url}/${id}`);

            const { data } = await axiosDemo.delete<TData>(`${url}/${id}`);

            console.log('✅ [useDelete Hook] Data deleted successfully');

            return data;
        },

        // Optimistic delete - remove from UI immediately
        onMutate: async (id) => {
            console.log('⚡ [useDelete Hook] Optimistic delete - removing from UI immediately');

            if (options?.invalidateQueries && options.invalidateQueries.length > 0) {
                const queryKey = options.invalidateQueries[0];

                // Cancel outgoing refetches
                await queryClient.cancelQueries({ queryKey: [queryKey] });

                // Snapshot previous value
                const previousData = queryClient.getQueryData([queryKey]);

                // Optimistically remove item from cache
                queryClient.setQueryData([queryKey], (old: any) => {
                    if (Array.isArray(old)) {
                        console.log('🗑️ [useDelete Hook] Removing item with ID:', id, 'from cache');
                        return old.filter((item: any) => item.id?.toString() !== id);
                    }
                    return old;
                });

                console.log('💾 [useDelete Hook] Saved previous data for potential rollback');

                return { previousData, queryKey };
            }

            return options?.onMutate?.(id);
        },

        onSuccess: (data, id, context) => {
            console.log('🎉 [useDelete Hook] Mutation successful!');

            // Invalidate queries to refetch fresh data
            if (options?.invalidateQueries) {
                console.log('🔄 [useDelete Hook] Invalidating queries:', options.invalidateQueries);

                options.invalidateQueries.forEach((key) => {
                    queryClient.invalidateQueries({ queryKey: [key] });
                });
            }

            options?.onSuccess?.(data, id, context);
        },

        onError: (error, id, context: any) => {
            console.error('❌ [useDelete Hook] Mutation failed:', error);

            // Rollback optimistic delete
            if (context?.previousData && context?.queryKey) {
                console.log('↩️ [useDelete Hook] Rolling back optimistic delete');
                queryClient.setQueryData([context.queryKey], context.previousData);
            }

            options?.onError?.(error, id, context);
        },

        ...options,
    });
}
