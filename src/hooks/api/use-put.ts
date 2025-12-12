import { instance } from "@/config/instance";
import { NOTIFICATION_LIST_API_ENDPOINT } from "@/features/(admin)/notification-management/services/notification.service";
import { EnhancedError } from "@/interface";
import { extractErrorInfo } from "@/lib/error-response";
import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

interface PutDataOptions<TData, TVariables> {
  url: string;
  refetchQueries?: string[];
  headers?: Record<string, string>;
  onSuccess?: (data: TData) => void;
  onError?: (error: EnhancedError) => void;
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>;
  isShowMessage?: boolean;
}

const usePutData = <TData = unknown, TVariables = unknown>({
  url,
  refetchQueries = [],
  headers,
  mutationOptions,
  onSuccess,
  onError,
  isShowMessage = true,
}: PutDataOptions<TData, TVariables>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      let requestData: unknown;
      let finalUrl = url;

      if (
        typeof variables === "object" &&
        variables !== null &&
        "id" in variables &&
        "payload" in variables
      ) {
        const { id, payload } = variables as { id?: string; payload: unknown };
        requestData = payload;
        finalUrl = id ? `${url}/${id}` : url;
      } else {
        requestData = variables;
      }

      const response = await instance.put(finalUrl, requestData, {
        headers,
      });

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        if (isShowMessage)
          toast.success(response.message ?? "Data updated successfully");
        return response.data as TData;
      }

      const errorMessage =
        response?.message ?? "An error occurred while updating data";

      if (response?.statusCode === 400) {
        throw Object.assign(new Error(errorMessage), { statusCode: 400 });
      }
      if (response?.statusCode === 401) {
        throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
      }

      throw new Error(errorMessage);
    },

    onSuccess: (data: TData) => {

      if (refetchQueries.length > 0) {
        queryClient.refetchQueries({ queryKey: refetchQueries });
      }
      queryClient.refetchQueries({ queryKey: [NOTIFICATION_LIST_API_ENDPOINT], exact: false });
      if (onSuccess) onSuccess(data);
    },

    onError: (error: EnhancedError) => {
      const errorInfo = extractErrorInfo(error);

      toast.error(errorInfo.description);

      if (onError) onError(error);
    },

    ...mutationOptions,
  });
};

export default usePutData;
