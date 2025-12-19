import instance from '../config/instance/instance';
import { buildQueryString } from '../utils/helper-function';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

const useFetchData = <TData = unknown, TParams = Record<string, unknown>>({
  url,
  params = {} as TParams,
  queryOptions = {},
  enabled = true
}: {
  url: string;
  params?: TParams;
  queryOptions?: Omit<
    UseQueryOptions<TData, Error, TData>,
    'queryKey' | 'queryFn'
  >;
  enabled?: boolean;
}) => {
  return useQuery<TData, Error>({
    queryKey: [url, params],
    queryFn: async () => {
      const queryString = buildQueryString(params as Record<string, unknown>);
      const response = await instance.get({
        url: `${url}${queryString}`
      });
      console.log("api call", response)
      // if (response?.status === 200) {
      return response;
      // }
      throw new Error(response?.message || 'Failed to fetch data');
    },
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: enabled,
    staleTime: 0,
    ...queryOptions
  });
};

export default useFetchData;