# Advanced API Management in React: A Senior Engineer's Guide

## Table of Contents
1. [Interceptors Explained](#1-interceptors-explained)
2. [useEffect vs TanStack React Query](#2-useeffect-vs-tanstack-react-query)
3. [Four Global Hooks for API Calls](#3-four-global-hooks-for-api-calls)
4. [Production Folder Structure](#4-production-folder-structure)
5. [Summary](#5-summary)

---

## 1. Interceptors Explained

### What is an Interceptor?

An **interceptor** is a middleware pattern that allows you to intercept and modify HTTP requests and responses before they reach their destination or before they're returned to the caller.

Think of it as a security checkpoint at an airport:
- **Request Interceptor**: Checks your passport (adds auth token) before you board
- **Response Interceptor**: Checks your luggage (validates response) when you land

### Why Use Interceptors?

✅ **Centralized Logic**: Add headers, tokens, or logging in one place  
✅ **Error Handling**: Handle 401, 403, 500 errors globally  
✅ **Token Refresh**: Automatically refresh expired tokens  
✅ **Request/Response Transformation**: Modify data before sending/receiving  
✅ **Logging & Monitoring**: Track all API calls in one place

---

### Frontend Interceptors

#### Axios Interceptor (Most Common)

```typescript
// src/config/api/axios-instance.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
axiosInstance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    // 1. Add Authorization Token
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Add Custom Headers
    if (config.headers) {
      config.headers['X-Request-ID'] = crypto.randomUUID();
      config.headers['X-Timestamp'] = new Date().toISOString();
    }

    // 3. Log Request (Development Only)
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 1. Log Response (Development Only)
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 Response:', {
        status: response.status,
        data: response.data,
      });
    }

    // 2. Transform Response (Optional)
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 3. Handle 401 Unauthorized - Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post('/auth/refresh', { refreshToken });
        
        localStorage.setItem('access_token', data.accessToken);
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 4. Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 Access Denied');
      // Optionally redirect to unauthorized page
    }

    // 5. Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('💥 Server Error');
      // Show global error toast
    }

    // 6. Handle Network Error
    if (!error.response) {
      console.error('🌐 Network Error - Check your connection');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

#### Fetch Wrapper Interceptor

```typescript
// src/config/api/fetch-wrapper.ts
type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

class FetchWrapper {
  private baseURL: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Add request interceptor
  useRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  useResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  async fetch(url: string, config: RequestInit = {}): Promise<Response> {
    // Apply request interceptors
    let finalConfig = config;
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    // Make request
    let response = await fetch(`${this.baseURL}${url}`, finalConfig);

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response);
    }

    return response;
  }
}

// Usage
const fetchClient = new FetchWrapper('http://localhost:3000/api');

// Add auth token interceptor
fetchClient.useRequestInterceptor((config) => {
  const token = localStorage.getItem('access_token');
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };
});

// Add error handling interceptor
fetchClient.useResponseInterceptor(async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Handle token refresh
      window.location.href = '/login';
    }
  }
  return response;
});

export default fetchClient;
```

---

### Backend Interceptors (NestJS)

```typescript
// src/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    this.logger.log(`📤 ${method} ${url} - Request: ${JSON.stringify(body)}`);

    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const delay = Date.now() - now;

        this.logger.log(
          `📥 ${method} ${url} - Response: ${statusCode} - ${delay}ms`
        );
      })
    );
  }
}

// Apply globally in main.ts
app.useGlobalInterceptors(new LoggingInterceptor());
```

```typescript
// src/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }))
    );
  }
}
```

---

## 2. useEffect vs TanStack React Query

### The Problem with useEffect + fetch

When developers start with React, they typically fetch data like this:

```typescript
// ❌ BAD: Traditional useEffect approach
import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        
        if (isMounted) {
          setUser(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;

  return <div>{user.name}</div>;
}
```

### Problems with useEffect Approach

| Problem | Description |
|---------|-------------|
| **No Caching** | Every component mount = new API call |
| **No Background Refetch** | Stale data stays stale |
| **Race Conditions** | Fast tab switching causes bugs |
| **Boilerplate** | Repeat loading/error/data state everywhere |
| **No Retry Logic** | Failed requests don't retry |
| **Memory Leaks** | Need manual cleanup (`isMounted`) |
| **No Deduplication** | Same request from 3 components = 3 API calls |
| **Poor UX** | No optimistic updates, no prefetching |

---

### The TanStack Query Solution

```typescript
// ✅ GOOD: TanStack Query approach
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/config/api/axios-instance';

function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/users/${userId}`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;

  return <div>{user.name}</div>;
}
```

### Why TanStack Query is Superior

#### 1. **Automatic Caching**
```typescript
// First component mounts → API call
<UserProfile userId="123" />

// Second component mounts → Uses cache (no API call!)
<UserProfile userId="123" />

// Third component mounts → Still uses cache
<UserProfile userId="123" />
```

#### 2. **Smart Refetching**
```typescript
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 30000, // Data fresh for 30s
  refetchOnWindowFocus: true, // Refetch when user returns to tab
  refetchOnReconnect: true, // Refetch when internet reconnects
  refetchInterval: 60000, // Poll every 60s
});
```

#### 3. **Automatic Retry with Exponential Backoff**
```typescript
useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  retry: 3, // Retry 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  // Attempt 1: 1s, Attempt 2: 2s, Attempt 3: 4s
});
```

#### 4. **Mutations with Optimistic Updates**
```typescript
const updateUserMutation = useMutation({
  mutationFn: (user: User) => axiosInstance.put(`/users/${user.id}`, user),
  onMutate: async (newUser) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['user', newUser.id] });

    // Snapshot previous value
    const previousUser = queryClient.getQueryData(['user', newUser.id]);

    // Optimistically update
    queryClient.setQueryData(['user', newUser.id], newUser);

    return { previousUser };
  },
  onError: (err, newUser, context) => {
    // Rollback on error
    queryClient.setQueryData(['user', newUser.id], context?.previousUser);
  },
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

#### 5. **Parallel Queries**
```typescript
function Dashboard() {
  const users = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const posts = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
  const comments = useQuery({ queryKey: ['comments'], queryFn: fetchComments });

  // All 3 requests fire in parallel!
  // No waterfall, no sequential blocking
}
```

#### 6. **Dependent Queries**
```typescript
function UserPosts({ userId }: { userId: string }) {
  // First, fetch user
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  // Then, fetch posts (only when user is loaded)
  const { data: posts } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => fetchPosts(user!.id),
    enabled: !!user, // Don't run until user exists
  });
}
```

---

### Side-by-Side Comparison

```typescript
// ============================================
// useEffect Approach (100+ lines)
// ============================================
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users?page=${page}`);
        const data = await res.json();
        if (isMounted) setUsers(data);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => { isMounted = false; };
  }, [page]);

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      // Manually refetch
      const res = await fetch(`/api/users?page=${page}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err);
    }
  };

  // ... render logic
}

// ============================================
// TanStack Query Approach (30 lines)
// ============================================
function UserList() {
  const [page, setPage] = useState(1);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', page],
    queryFn: () => fetchUsers(page),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // ... render logic
}
```

---

### When to Use Each

| Use Case | useEffect | TanStack Query |
|----------|-----------|----------------|
| **Server State** (API data) | ❌ No | ✅ Yes |
| **Client State** (UI toggles) | ✅ Yes | ❌ No |
| **Side Effects** (analytics) | ✅ Yes | ❌ No |
| **WebSocket** | ✅ Yes | ❌ No |
| **Caching Needed** | ❌ Manual | ✅ Automatic |
| **Background Sync** | ❌ Manual | ✅ Automatic |

---

## 3. Four Global Hooks for API Calls

### Why Create Global Hooks?

✅ **DRY Principle**: Don't repeat yourself  
✅ **Consistent Error Handling**: All errors handled the same way  
✅ **Type Safety**: TypeScript generics for type inference  
✅ **Easy Testing**: Mock hooks instead of API calls  
✅ **Centralized Config**: Change behavior in one place

---

### Hook 1: `useGet` - GET Requests

```typescript
// src/hooks/api/useGet.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axiosInstance from '@/config/api/axios-instance';
import { AxiosError } from 'axios';

interface UseGetOptions<TData> extends Omit<UseQueryOptions<TData, AxiosError>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
}

export function useGet<TData = any>(
  url: string,
  queryParams?: Record<string, any>,
  options?: UseGetOptions<TData>
) {
  const queryKey = queryParams 
    ? [url, queryParams] 
    : [url];

  return useQuery<TData, AxiosError>({
    queryKey,
    queryFn: async () => {
      const { data } = await axiosInstance.get<TData>(url, { params: queryParams });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options,
  });
}

// Usage Examples
function UserProfile() {
  // Simple GET
  const { data, isLoading, error } = useGet<User>('/users/me');

  // GET with query params
  const { data: users } = useGet<User[]>('/users', { 
    role: 'admin', 
    page: 1 
  });

  // Conditional GET
  const { data: posts } = useGet<Post[]>('/posts', undefined, {
    enabled: !!data?.id, // Only fetch if user exists
  });

  // Custom staleTime
  const { data: settings } = useGet<Settings>('/settings', undefined, {
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
```

---

### Hook 2: `usePost` - POST Requests

```typescript
// src/hooks/api/usePost.ts
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/config/api/axios-instance';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface UsePostOptions<TData, TVariables> 
  extends Omit<UseMutationOptions<TData, AxiosError, TVariables>, 'mutationFn'> {
  invalidateQueries?: string[];
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function usePost<TData = any, TVariables = any>(
  url: string,
  options?: UsePostOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, AxiosError, TVariables>({
    mutationFn: async (body: TVariables) => {
      const { data } = await axiosInstance.post<TData>(url, body);
      return data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }

      // Show success toast
      if (options?.showSuccessToast !== false) {
        toast.success('Success!');
      }

      // Call custom onSuccess
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Show error toast
      if (options?.showErrorToast !== false) {
        const message = error.response?.data?.message || 'Something went wrong';
        toast.error(message);
      }

      // Call custom onError
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Usage Examples
function CreateUserForm() {
  const createUser = usePost<User, CreateUserDto>('/users', {
    invalidateQueries: ['users'],
    onSuccess: (user) => {
      console.log('User created:', user);
      router.push(`/users/${user.id}`);
    },
  });

  const handleSubmit = (formData: CreateUserDto) => {
    createUser.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={createUser.isLoading}>
        {createUser.isLoading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

---

### Hook 3: `usePut` - PUT/PATCH Requests

```typescript
// src/hooks/api/usePut.ts
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/config/api/axios-instance';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface UsePutOptions<TData, TVariables> 
  extends Omit<UseMutationOptions<TData, AxiosError, TVariables>, 'mutationFn'> {
  invalidateQueries?: string[];
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  method?: 'PUT' | 'PATCH';
}

export function usePut<TData = any, TVariables = any>(
  url: string,
  options?: UsePutOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();
  const method = options?.method || 'PUT';

  return useMutation<TData, AxiosError, TVariables>({
    mutationFn: async (body: TVariables) => {
      const { data } = method === 'PUT'
        ? await axiosInstance.put<TData>(url, body)
        : await axiosInstance.patch<TData>(url, body);
      return data;
    },
    onMutate: async (variables) => {
      // Optimistic update
      if (options?.invalidateQueries) {
        await queryClient.cancelQueries({ queryKey: [options.invalidateQueries[0]] });
        
        const previousData = queryClient.getQueryData([options.invalidateQueries[0]]);
        
        queryClient.setQueryData([options.invalidateQueries[0]], variables);
        
        return { previousData };
      }
      
      return options?.onMutate?.(variables);
    },
    onSuccess: (data, variables, context) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }

      if (options?.showSuccessToast !== false) {
        toast.success('Updated successfully!');
      }

      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(
          [options?.invalidateQueries?.[0]],
          context.previousData
        );
      }

      if (options?.showErrorToast !== false) {
        const message = error.response?.data?.message || 'Update failed';
        toast.error(message);
      }

      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

// Usage Examples
function EditUserForm({ userId }: { userId: string }) {
  const updateUser = usePut<User, UpdateUserDto>(`/users/${userId}`, {
    invalidateQueries: ['users', `user-${userId}`],
    method: 'PATCH', // Use PATCH for partial updates
  });

  const handleSubmit = (formData: UpdateUserDto) => {
    updateUser.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={updateUser.isLoading}>
        Save Changes
      </button>
    </form>
  );
}
```

---

### Hook 4: `useDelete` - DELETE Requests

```typescript
// src/hooks/api/useDelete.ts
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/config/api/axios-instance';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface UseDeleteOptions<TData> 
  extends Omit<UseMutationOptions<TData, AxiosError, string>, 'mutationFn'> {
  invalidateQueries?: string[];
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  confirmMessage?: string;
}

export function useDelete<TData = any>(
  url: string,
  options?: UseDeleteOptions<TData>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, AxiosError, string>({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete<TData>(`${url}/${id}`);
      return data;
    },
    onMutate: async (id) => {
      // Show confirmation dialog
      if (options?.confirmMessage) {
        const confirmed = window.confirm(options.confirmMessage);
        if (!confirmed) {
          throw new Error('Deletion cancelled');
        }
      }

      // Optimistically remove from cache
      if (options?.invalidateQueries) {
        await queryClient.cancelQueries({ queryKey: [options.invalidateQueries[0]] });
        
        const previousData = queryClient.getQueryData([options.invalidateQueries[0]]);
        
        queryClient.setQueryData([options.invalidateQueries[0]], (old: any) => {
          if (Array.isArray(old)) {
            return old.filter((item: any) => item.id !== id);
          }
          return old;
        });
        
        return { previousData };
      }

      return options?.onMutate?.(id);
    },
    onSuccess: (data, id, context) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }

      if (options?.showSuccessToast !== false) {
        toast.success('Deleted successfully!');
      }

      options?.onSuccess?.(data, id, context);
    },
    onError: (error, id, context) => {
      // Rollback optimistic delete
      if (context?.previousData) {
        queryClient.setQueryData(
          [options?.invalidateQueries?.[0]],
          context.previousData
        );
      }

      if (options?.showErrorToast !== false) {
        const message = error.response?.data?.message || 'Delete failed';
        toast.error(message);
      }

      options?.onError?.(error, id, context);
    },
    ...options,
  });
}

// Usage Examples
function UserList() {
  const { data: users } = useGet<User[]>('/users');
  
  const deleteUser = useDelete('/users', {
    invalidateQueries: ['users'],
    confirmMessage: 'Are you sure you want to delete this user?',
    onSuccess: () => {
      console.log('User deleted');
    },
  });

  return (
    <div>
      {users?.map((user) => (
        <div key={user.id}>
          <span>{user.name}</span>
          <button onClick={() => deleteUser.mutate(user.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### How Hooks Connect with Interceptors

```typescript
// Flow Diagram:

Component
   ↓
useGet/usePost/usePut/useDelete
   ↓
axiosInstance (from interceptor)
   ↓
REQUEST INTERCEPTOR
   ├─ Add Auth Token
   ├─ Add Headers
   └─ Log Request
   ↓
API Server
   ↓
RESPONSE INTERCEPTOR
   ├─ Handle 401 (Refresh Token)
   ├─ Handle Errors
   └─ Log Response
   ↓
TanStack Query (Cache/Refetch)
   ↓
Component (Re-render)
```

**Key Benefits:**
- Hooks provide **clean API** for components
- Interceptors handle **cross-cutting concerns** (auth, logging, errors)
- TanStack Query manages **caching and synchronization**
- Components stay **simple and focused**

---

## 4. Production Folder Structure

```
src/
├── config/
│   └── api/
│       ├── axios-instance.ts          # Axios instance with interceptors
│       ├── fetch-wrapper.ts           # Fetch wrapper (alternative)
│       └── api.ts                     # API endpoint constants
│
├── hooks/
│   └── api/
│       ├── useGet.ts                  # GET hook
│       ├── usePost.ts                 # POST hook
│       ├── usePut.ts                  # PUT/PATCH hook
│       ├── useDelete.ts               # DELETE hook
│       └── index.ts                   # Export all hooks
│
├── services/
│   ├── user.service.ts                # User-specific API calls
│   ├── auth.service.ts                # Auth-specific API calls
│   └── post.service.ts                # Post-specific API calls
│
├── types/
│   ├── user.types.ts                  # User TypeScript types
│   ├── api.types.ts                   # API response types
│   └── index.ts                       # Export all types
│
├── utils/
│   ├── query-client.ts                # TanStack Query client config
│   └── error-handler.ts               # Global error handler
│
└── app/
    ├── providers.tsx                  # QueryClientProvider setup
    └── layout.tsx                     # Root layout
```

---

### File Contents

#### `src/config/api/api.ts`
```typescript
export const API = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  POSTS: {
    LIST: '/posts',
    DETAIL: (id: string) => `/posts/${id}`,
  },
};
```

#### `src/hooks/api/index.ts`
```typescript
export { useGet } from './useGet';
export { usePost } from './usePost';
export { usePut } from './usePut';
export { useDelete } from './useDelete';
```

#### `src/services/user.service.ts`
```typescript
import axiosInstance from '@/config/api/axios-instance';
import { API } from '@/config/api/api';
import { User, CreateUserDto, UpdateUserDto } from '@/types';

export const userService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await axiosInstance.get(API.USERS.LIST);
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await axiosInstance.get(API.USERS.DETAIL(id));
    return data;
  },

  create: async (user: CreateUserDto): Promise<User> => {
    const { data } = await axiosInstance.post(API.USERS.CREATE, user);
    return data;
  },

  update: async (id: string, user: UpdateUserDto): Promise<User> => {
    const { data } = await axiosInstance.patch(API.USERS.UPDATE(id), user);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(API.USERS.DELETE(id));
  },
};
```

#### `src/utils/query-client.ts`
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

#### `src/app/providers.tsx`
```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/utils/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 5. Summary

### Key Takeaways

#### Interceptors
✅ Centralize auth, logging, and error handling  
✅ Use Axios interceptors for most cases  
✅ Implement token refresh in response interceptor  
✅ Keep interceptors focused and composable

#### useEffect vs TanStack Query
✅ **Never use useEffect for server state**  
✅ TanStack Query provides caching, refetching, retry, and more  
✅ Reduces boilerplate by 70%+  
✅ Better UX with background updates and optimistic UI

#### Global Hooks
✅ `useGet` for fetching data with caching  
✅ `usePost` for creating resources  
✅ `usePut` for updating resources (with optimistic updates)  
✅ `useDelete` for deleting resources (with confirmation)  
✅ All hooks integrate with interceptors automatically

#### Architecture Benefits
✅ **Separation of Concerns**: Hooks, services, interceptors  
✅ **Type Safety**: Full TypeScript support  
✅ **DX**: Clean, reusable, testable code  
✅ **Performance**: Automatic caching and deduplication  
✅ **Maintainability**: Change behavior in one place

---

### Final Comparison Table

| Feature | useEffect | TanStack Query + Hooks |
|---------|-----------|------------------------|
| **Lines of Code** | 50-100 per component | 5-10 per component |
| **Caching** | Manual | Automatic |
| **Error Handling** | Per component | Global |
| **Loading States** | Manual | Automatic |
| **Retry Logic** | Manual | Automatic |
| **Optimistic Updates** | Complex | Built-in |
| **Type Safety** | Manual | Inferred |
| **Testing** | Mock fetch | Mock hooks |
| **DX** | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

### Next Steps for Your Team

1. **Setup TanStack Query** in your project
2. **Create the four global hooks** (`useGet`, `usePost`, `usePut`, `useDelete`)
3. **Configure axios interceptors** for auth and error handling
4. **Migrate existing useEffect calls** to TanStack Query
5. **Add TypeScript types** for all API responses
6. **Setup React Query Devtools** for debugging

---

**Remember**: This architecture scales from small projects to enterprise applications. Start simple, add complexity only when needed.

Happy coding! 🚀
