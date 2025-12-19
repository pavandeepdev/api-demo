import API from '@/config/api/api';
import useFetchData from '@/hooks/use-fetch-data';
import usePostData from '@/hooks/use-post-data';
import usePutData from '@/hooks/use-put-data';
import useDeleteData from '@/hooks/use-delete-data';
import type { Order } from '@/types';

/**
 * Orders Service Hooks
 * 
 * These hooks encapsulate all order-related API calls.
 * This is a best practice for organizing your API layer.
 */

// Fetch all orders
export const useGetOrders = (params?: Record<string, unknown>) => {
    return useFetchData<Order[]>({
        url: API.order.list,
        params,
    });
};

// Fetch single order by ID
export const useGetOrderById = (id: string) => {
    return useFetchData<Order>({
        url: API.order.getById(id),
        enabled: !!id, // Only fetch if ID exists
    });
};

// Create new order
export const useCreateOrder = () => {
    return usePostData<Order, Partial<Order>>({
        url: API.order.create,
        refetchQueries: [API.order.list],
        isShowSuccessMessage: true,
    });
};

// Update existing order
export const useUpdateOrder = () => {
    return usePutData<Order, { id: string; payload: Partial<Order> }>({
        url: API.order.list,
        refetchQueries: [API.order.list],
        isShowMessage: true,
    });
};

// Delete order
export const useDeleteOrder = (id: string) => {
    return useDeleteData<void>({
        url: API.order.delete(id),
        refetchQueries: [API.order.list],
    });
};