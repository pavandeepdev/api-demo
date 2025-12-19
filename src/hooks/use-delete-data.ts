import instance from '../config/instance/instance';
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeleteDataOptions<TData> {
  url: string;
  refetchQueries?: string[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  mutationOptions?: UseMutationOptions<TData, Error, void>;
}

const useDeleteData = <TData = unknown>({
  url,
  refetchQueries = [],
  mutationOptions,
  onSuccess,
  onError,
}: DeleteDataOptions<TData>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, void>({
    mutationFn: async (): Promise<TData> => {
      const response = await instance.delete({ url });

      if (response?.statusCode === 200) {
        toast.success(response.message ?? 'Data deleted successfully');
        return response.data as TData;
      }

      const errorMessage = response?.message || 'Failed to delete data';

      throw new Error(errorMessage);
    },
    onSuccess: () => {
      if (refetchQueries) {
        queryClient.refetchQueries({ queryKey: refetchQueries, exact: false });
      }
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);

      if (onError) {
        onError(error);
      }
    },
    ...mutationOptions,
  });
};

export default useDeleteData;