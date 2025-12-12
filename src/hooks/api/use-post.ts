import { instance } from "@/config/instance";
import { EnhancedError } from "@/interface";
import { extractErrorInfo } from "@/lib/error-response";
import {
  useMutation,
  UseMutationOptions,
  useQueryClient
} from "@tanstack/react-query";
import { toast } from "sonner";
import { NOTIFICATION_LIST_API_ENDPOINT } from "@/features/(admin)/notification-management/services/notification.service";
interface UsePostDataProps<TData, TVariables> {
  url: string;
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>;
  headers?: Record<string, string>;
  refetchQueries?: string[];
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  isShowErrorToast?: boolean;
  isShowSuccessMessage?: boolean;
}


export const usePostData = <TData = unknown, TVariables = unknown>({
  url,
  mutationOptions,
  headers = {},
  refetchQueries,
  onSuccess,
  onError,
  isShowErrorToast,
  isShowSuccessMessage,
}: UsePostDataProps<TData, TVariables>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const response = await instance.post<TData>(url, variables, { headers });

      if (
        !response?.error &&
        (response?.statusCode === 200 || response?.statusCode === 201)
      ) {
        if (isShowSuccessMessage) {
          toast.success(response?.message || "Success");
        }
        return response.data as TData;
      }

      throw new Error(response?.message || "Failed to post data");
    },

    onSuccess: (data) => {
      if (refetchQueries) {
        queryClient.refetchQueries({ queryKey: refetchQueries, exact: false });
      }
      queryClient.refetchQueries({ queryKey: [NOTIFICATION_LIST_API_ENDPOINT], exact: false });
      if (onSuccess) {
        onSuccess(data);
      }
    },

    onError: (error: EnhancedError) => {
      const errorInfo = extractErrorInfo(error);
      if (isShowErrorToast) {
        toast.error(errorInfo.description);
      }

      if (onError) {
        onError(error);
      }
    },
    ...mutationOptions,
  });
};
