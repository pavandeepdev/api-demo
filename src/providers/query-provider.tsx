'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

/**
 * QueryProvider Component
 * 
 * This provider wraps your application and provides TanStack Query functionality.
 * It includes the React Query DevTools for debugging and monitoring queries.
 * 
 * Key Configuration:
 * - staleTime: How long data is considered fresh (5 minutes)
 * - cacheTime: How long unused data stays in cache (10 minutes)
 * - retry: Number of retry attempts for failed queries (2)
 * - refetchOnWindowFocus: Whether to refetch when window regains focus (false for demo)
 */

export function QueryProvider({ children }: { children: ReactNode }) {
    // Create QueryClient instance with default options
    // Using useState ensures the client is created only once per component instance
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Data is fresh for 5 minutes
                        staleTime: 5 * 60 * 1000,

                        // Unused data is kept in cache for 10 minutes
                        gcTime: 10 * 60 * 1000, // Previously called 'cacheTime'

                        // Retry failed requests 2 times
                        retry: 2,

                        // Don't refetch on window focus (better for demos)
                        refetchOnWindowFocus: false,

                        // Retry delay with exponential backoff
                        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
                    },
                    mutations: {
                        // Retry mutations once on failure
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}

            {/* React Query DevTools - Only visible in development */}
            <ReactQueryDevtools
                initialIsOpen={false}
            />
        </QueryClientProvider>
    );
}
