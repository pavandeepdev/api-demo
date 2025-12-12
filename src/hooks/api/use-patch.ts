import API from "@/config/api";
import { instance } from "@/config/instance";
import { EnhancedError } from "@/interface";
import { extractErrorInfo } from "@/lib/error-response";
import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

type PatchDataVariables = any;

interface PatchDataOptions<TData, TVariables> {
  url: string;
  refetchQueries?: string[];
  headers?: Record<string, string>;
  onSuccess?: (data: TData) => void;
  onError?: (error: EnhancedError) => void;
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>;
  isShowMessage?: boolean;
}

const usePatchData = <TData = unknown, TVariables = PatchDataVariables>({
  url,
  refetchQueries = [],
  headers,
  mutationOptions,
  onSuccess,
  onError,
  isShowMessage = true,
}: PatchDataOptions<TData, TVariables>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const response = await instance.patch(url, variables);

      if (response?.statusCode === 200) {
        if (isShowMessage)
          toast.success(response.message ?? "Operation completed successfully");
        return response.data as TData;
      }

      const errorMessage =
        response?.message ?? "An error occurred while processing the request";

      throw new Error(errorMessage);
    },
    onSuccess: (data: TData) => {
      if (refetchQueries.length > 0) {
        queryClient.refetchQueries({ queryKey: refetchQueries, exact: false });
      }
      queryClient.refetchQueries({ queryKey: [API.notification.list], exact: false });
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: EnhancedError) => {
      const errorInfo = extractErrorInfo(error);
      toast.error(errorInfo.description);

      if (onError) {
        onError(error);
      }
    },
    ...mutationOptions,
  });
};

export default usePatchData;
