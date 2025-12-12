
import { instance } from '@/config/instance';
import { buildQueryString } from '@/lib/commonFunction';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface FetchDataOptions<TData, TParams> {
  url: string;
  params?: TParams;
  queryOptions?: Omit<UseQueryOptions<TData, Error, TData>, 'queryKey' | 'queryFn'>;
  enabled?: boolean;
}
const useFetchData = <TData = unknown, TParams = Record<string, unknown>>({
  url,
  params = {} as TParams,
  queryOptions = {},
  enabled = true
}: FetchDataOptions<TData, TParams>) => {
  return useQuery<TData, Error>({
    queryKey: [url, params],
    queryFn: async (): Promise<TData> => {
      const queryString = buildQueryString(params as Record<string, unknown>);
      const response = await instance.get<TData>(`${url}${queryString}`);

      if (response?.statusCode === 200) {
        return response.data as TData;
      }

      throw new Error(response?.message || 'Failed to fetch data');
    },

    retry: 1,
    refetchOnWindowFocus: false,
    enabled: enabled,

    staleTime: 0,
    placeholderData: (prevData) => prevData,
    ...queryOptions
  });
};

export { useFetchData };
