import { Link } from 'react-router-dom';
import { CodeBlock } from '@/components/CodeBlock';

/**
 * ProductionHooksDemo Page
 * 
 * Explains the production-grade API hooks used in the actual application.
 * These are more advanced than the demo hooks with features like:
 * - Toast notifications
 * - Error handling with extractErrorInfo
 * - Automatic notification refetching
 * - Flexible URL construction
 * - Custom headers support
 */
export function ProductionHooksDemo() {
    const useFetchDataCode = `import { useFetchData } from '@/hooks/api/use-fetch';

// Basic usage - Fetch users
const { data, isLoading, error } = useFetchData<User[]>({
  url: '/users',
  params: { page: 1, limit: 10 }
});

// With custom query options
const { data: user } = useFetchData<User>({
  url: '/users/123',
  queryOptions: {
    staleTime: 60000, // 1 minute
    retry: 3
  }
});

// Conditional fetching
const { data: posts } = useFetchData<Post[]>({
  url: '/posts',
  enabled: !!userId // Only fetch when userId exists
});`;

    const usePostDataCode = `import { usePostData } from '@/hooks/api/use-post';

// Create a new user
const createUser = usePostData<User, CreateUserDto>({
  url: '/users',
  refetchQueries: ['users'], // Auto-refetch users list
  isShowSuccessMessage: true, // Show success toast
  isShowErrorToast: true, // Show error toast
  onSuccess: (data) => {
    console.log('User created:', data);
    router.push(\`/users/\${data.id}\`);
  }
});

// Usage
const handleSubmit = (formData: CreateUserDto) => {
  createUser.mutate(formData);
};`;

    const usePutDataCode = `import usePutData from '@/hooks/api/use-put';

// Update user - Method 1: Simple
const updateUser = usePutData<User, UpdateUserDto>({
  url: '/users/123',
  refetchQueries: ['users', 'user-123'],
  isSuccessShowMessage: true,
  onSuccess: (data) => {
    console.log('Updated:', data);
  }
});

updateUser.mutate({ name: 'John Doe' });

// Update user - Method 2: Dynamic ID
const updateUserDynamic = usePutData<User, { id: string; payload: UpdateUserDto }>({
  url: '/users', // Base URL
  refetchQueries: ['users']
});

// Automatically constructs /users/123
updateUserDynamic.mutate({
  id: '123',
  payload: { name: 'John Doe' }
});`;

    const usePatchDataCode = `import usePatchData from '@/hooks/api/use-patch';

// Partial update (PATCH vs PUT)
const patchUser = usePatchData<User, Partial<User>>({
  url: '/users/123',
  refetchQueries: ['users'],
  isSuccessShowMessage: true,
  headers: {
    'X-Custom-Header': 'value'
  }
});

// Only update specific fields
patchUser.mutate({ 
  status: 'active' 
  // Other fields remain unchanged
});`;

    const useDeleteDataCode = `import useDeleteData from '@/hooks/api/use-delete';

// Delete user
const deleteUser = useDeleteData<void>({
  url: '/users/123',
  refetchQueries: ['users'],
  onSuccess: () => {
    console.log('User deleted');
    router.push('/users');
  },
  onError: (error) => {
    console.error('Delete failed:', error);
  }
});

// Trigger deletion
deleteUser.mutate();`;

    const realWorldExample = `// Real-world example: User Management Component
import { useFetchData } from '@/hooks/api/use-fetch';
import { usePostData } from '@/hooks/api/use-post';
import usePutData from '@/hooks/api/use-put';
import useDeleteData from '@/hooks/api/use-delete';

function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users list
  const { data: users, isLoading } = useFetchData<User[]>({
    url: '/users',
    params: { status: 'active' }
  });

  // Create user
  const createUser = usePostData<User, CreateUserDto>({
    url: '/users',
    refetchQueries: ['users'],
    isShowSuccessMessage: true,
    isShowErrorToast: true
  });

  // Update user
  const updateUser = usePutData<User, { id: string; payload: UpdateUserDto }>({
    url: '/users',
    refetchQueries: ['users'],
    isSuccessShowMessage: true
  });

  // Delete user
  const deleteUser = useDeleteData<void>({
    url: \`/users/\${selectedUser?.id}\`,
    refetchQueries: ['users']
  });

  const handleCreate = (data: CreateUserDto) => {
    createUser.mutate(data);
  };

  const handleUpdate = (id: string, data: UpdateUserDto) => {
    updateUser.mutate({ id, payload: data });
  };

  const handleDelete = () => {
    if (selectedUser) {
      deleteUser.mutate();
    }
  };

  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}`;

    return (
        <div className="demo-page">
            <Link to="/" className="back-link">← Back to Home</Link>

            <header className="page-header">
                <h1>🏭 Production API Hooks</h1>
                <p>Advanced hooks used in the actual application</p>
            </header>

            <div className="demo-content">
                <section className="explanation">
                    <h2>Production vs Demo Hooks</h2>
                    <p>
                        The production hooks in <code>src/hooks/api/</code> are more feature-rich than the demo hooks.
                        They include enterprise-grade features for real-world applications.
                    </p>

                    <div className="comparison-grid">
                        <div className="comparison-item">
                            <h3>Demo Hooks Features</h3>
                            <ul>
                                <li>✅ Basic CRUD operations</li>
                                <li>✅ Simple error handling</li>
                                <li>✅ Console logging for teaching</li>
                                <li>✅ Type-safe with generics</li>
                            </ul>
                        </div>
                        <div className="comparison-item">
                            <h3>Production Hooks Features</h3>
                            <ul>
                                <li>✅ All demo features PLUS:</li>
                                <li>✅ Toast notifications (Sonner)</li>
                                <li>✅ Advanced error extraction</li>
                                <li>✅ Automatic notification refetching</li>
                                <li>✅ Custom headers support</li>
                                <li>✅ Flexible URL construction</li>
                                <li>✅ Status code handling (400, 401, etc.)</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="hooks-overview">
                    <h2>📚 The Five Production Hooks</h2>

                    <div className="hook-card">
                        <h3>1️⃣ useFetchData - GET Requests</h3>
                        <p className="hook-description">
                            Fetches data with automatic caching, query string building, and placeholder data support.
                        </p>
                        <CodeBlock code={useFetchDataCode} language="typescript" title="use-fetch.ts" />

                        <div className="features-list">
                            <h4>Key Features:</h4>
                            <ul>
                                <li><strong>buildQueryString</strong> - Automatically converts params to query string</li>
                                <li><strong>placeholderData</strong> - Keeps previous data while refetching</li>
                                <li><strong>staleTime: 0</strong> - Always considers data stale (refetch on mount)</li>
                                <li><strong>Custom instance</strong> - Uses your production axios instance with interceptors</li>
                            </ul>
                        </div>
                    </div>

                    <div className="hook-card">
                        <h3>2️⃣ usePostData - POST Requests</h3>
                        <p className="hook-description">
                            Creates resources with automatic toast notifications and notification list refetching.
                        </p>
                        <CodeBlock code={usePostDataCode} language="typescript" title="use-post.ts" />

                        <div className="features-list">
                            <h4>Key Features:</h4>
                            <ul>
                                <li><strong>isShowSuccessMessage</strong> - Toggle success toast</li>
                                <li><strong>isShowErrorToast</strong> - Toggle error toast</li>
                                <li><strong>Auto-refetch notifications</strong> - Always refetches notification list</li>
                                <li><strong>Status code validation</strong> - Checks for 200 or 201</li>
                                <li><strong>Custom headers</strong> - Pass additional headers</li>
                            </ul>
                        </div>
                    </div>

                    <div className="hook-card">
                        <h3>3️⃣ usePutData - PUT Requests</h3>
                        <p className="hook-description">
                            Updates resources with flexible URL construction and comprehensive error handling.
                        </p>
                        <CodeBlock code={usePutDataCode} language="typescript" title="use-put.ts" />

                        <div className="features-list">
                            <h4>Key Features:</h4>
                            <ul>
                                <li><strong>Flexible URL construction</strong> - Pass id + payload or just payload</li>
                                <li><strong>Status code handling</strong> - Special handling for 400, 401</li>
                                <li><strong>isShowSuccessMessage</strong> - Toggle success toast (default: true)</li>
                                <li><strong>isShowErrorToast</strong> - Toggle error toast (default: true)</li>
                                <li><strong>Enhanced error objects</strong> - Includes statusCode in error</li>
                            </ul>
                        </div>
                    </div>

                    <div className="hook-card">
                        <h3>4️⃣ usePatchData - PATCH Requests</h3>
                        <p className="hook-description">
                            Partial updates with the same features as PUT but using PATCH method.
                        </p>
                        <CodeBlock code={usePatchDataCode} language="typescript" title="use-patch.ts" />

                        <div className="features-list">
                            <h4>Key Differences from PUT:</h4>
                            <ul>
                                <li><strong>PATCH vs PUT</strong> - Partial update vs full replacement</li>
                                <li><strong>Same features</strong> - Toast, error handling, refetching</li>
                                <li><strong>Use case</strong> - When you only want to update specific fields</li>
                            </ul>
                        </div>
                    </div>

                    <div className="hook-card">
                        <h3>5️⃣ useDeleteData - DELETE Requests</h3>
                        <p className="hook-description">
                            Deletes resources with automatic success toast and notification refetching.
                        </p>
                        <CodeBlock code={useDeleteDataCode} language="typescript" title="use-delete.ts" />

                        <div className="features-list">
                            <h4>Key Features:</h4>
                            <ul>
                                <li><strong>No variables needed</strong> - URL already contains the ID</li>
                                <li><strong>Auto success toast</strong> - Always shows success message</li>
                                <li><strong>Error extraction</strong> - Uses extractErrorInfo for detailed errors</li>
                                <li><strong>Notification refetch</strong> - Always refetches notification list</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="real-world-example">
                    <h2>🌍 Real-World Example</h2>
                    <p>Here's how all hooks work together in a complete component:</p>
                    <CodeBlock code={realWorldExample} language="typescript" title="UserManagement.tsx" />
                </section>

                <section className="advanced-features">
                    <h2>🚀 Advanced Features</h2>

                    <div className="feature-grid">
                        <div className="feature-card">
                            <h3>🔔 Toast Notification</h3>
                            <p>All hooks integrate with Sonner for beautiful toast notifications:</p>
                            <ul>
                                <li>Success toasts on successful operations</li>
                                <li>Error toasts with detailed error messages</li>
                                <li>Configurable via <code>isShowSuccessMessage</code> and <code>isShowErrorMessage</code> flags</li>
                            </ul>
                        </div>

                        <div className="feature-card">
                            <h3>🔄 Auto Notification Refetch</h3>
                            <p>All mutation hooks automatically refetch the notification list:</p>
                            <ul>
                                <li>Keeps notification bell up-to-date</li>
                                <li>No manual refetch needed</li>
                                <li>Uses <code>NOTIFICATION_LIST_API_ENDPOINT</code></li>
                            </ul>
                        </div>

                        <div className="feature-card">
                            <h3>❌ Enhanced Error Handling</h3>
                            <p>Uses <code>extractErrorInfo</code> utility for detailed errors:</p>
                            <ul>
                                <li>Extracts error description from response</li>
                                <li>Handles different error formats</li>
                                <li>Provides user-friendly error messages</li>
                            </ul>
                        </div>

                        <div className="feature-card">
                            <h3>🎯 Status Code Validation</h3>
                            <p>Validates response status codes:</p>
                            <ul>
                                <li>200/201 for success</li>
                                <li>400 for bad request (with custom error)</li>
                                <li>401 for unauthorized</li>
                                <li>Throws appropriate errors</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="comparison-table">
                    <h2>📊 Hook Comparison Table</h2>
                    <table className="feature-table">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>useFetchData</th>
                                <th>usePostData</th>
                                <th>usePutData</th>
                                <th>usePatchData</th>
                                <th>useDeleteData</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>HTTP Method</td>
                                <td>GET</td>
                                <td>POST</td>
                                <td>PUT</td>
                                <td>PATCH</td>
                                <td>DELETE</td>
                            </tr>
                            <tr>
                                <td>Toast Notifications</td>
                                <td>❌</td>
                                <td>✅</td>
                                <td>✅</td>
                                <td>✅</td>
                                <td>✅</td>
                            </tr>
                            <tr>
                                <td>Auto Refetch Queries</td>
                                <td>N/A</td>
                                <td>✅</td>
                                <td>✅</td>
                                <td>✅</td>
                                <td>✅</td>
                            </tr>
                            <tr>
                                <td>Custom Headers</td>
                                <td>❌</td>
                                <td>✅</td>
                                <td>✅</td>
                                <td>✅</td>
                                <td>❌</td>
                            </tr>
                            <tr>
                                <td>Query String Building</td>
                                <td>✅</td>
                                <td>❌</td>
                                <td>❌</td>
                                <td>❌</td>
                                <td>❌</td>
                            </tr>
                            <tr>
                                <td>Placeholder Data</td>
                                <td>✅</td>
                                <td>❌</td>
                                <td>❌</td>
                                <td>❌</td>
                                <td>❌</td>
                            </tr>
                            <tr>
                                <td>Flexible URL</td>
                                <td>❌</td>
                                <td>❌</td>
                                <td>✅</td>
                                <td>❌</td>
                                <td>❌</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="best-practices">
                    <h2>💡 Best Practices</h2>

                    <div className="tips-grid">
                        <div className="tip-card">
                            <h4>1. Always Specify Types</h4>
                            <code>useFetchData{'<User[]>'}({'{...}'})</code>
                            <p>Use TypeScript generics for type safety</p>
                        </div>

                        <div className="tip-card">
                            <h4>2. Refetch Related Queries</h4>
                            <code>refetchQueries: ['users', 'user-detail']</code>
                            <p>Keep all related data in sync</p>
                        </div>

                        <div className="tip-card">
                            <h4>3. Handle Errors Gracefully</h4>
                            <code>onError: (error) {'=>'} {'{...}'}</code>
                            <p>Provide custom error handling when needed</p>
                        </div>

                        <div className="tip-card">
                            <h4>4. Use Conditional Fetching</h4>
                            <code>enabled: !!userId</code>
                            <p>Prevent unnecessary API calls</p>
                        </div>

                        <div className="tip-card">
                            <h4>5. Control Toast Visibility</h4>
                            <code>isSuccessShowMessage: false</code>
                            <p>Disable toasts for background operations</p>
                        </div>

                        <div className="tip-card">
                            <h4>6. Leverage Placeholder Data</h4>
                            <code>placeholderData: (prev) {'=>'} prev</code>
                            <p>Prevent UI flickering during refetch</p>
                        </div>
                    </div>
                </section>

                <section className="migration-guide">
                    <h2>🔄 Migration from Demo to Production</h2>

                    <div className="migration-comparison">
                        <div className="migration-column">
                            <h3>Demo Hook</h3>
                            <CodeBlock
                                code={`import { useGet } from '@/hooks/demo/useGet';

const { data } = useGet<User[]>('/users');`}
                                language="typescript"
                            />
                        </div>

                        <div className="migration-arrow">→</div>

                        <div className="migration-column">
                            <h3>Production Hook</h3>
                            <CodeBlock
                                code={`import { useFetchData } from '@/hooks/api/use-fetch';

const { data } = useFetchData<User[]>({
  url: '/users'
});`}
                                language="typescript"
                            />
                        </div>
                    </div>

                    <div className="migration-notes">
                        <h4>Key Differences:</h4>
                        <ul>
                            <li>Production hooks use object parameter instead of multiple arguments</li>
                            <li>Production hooks include toast notifications by default</li>
                            <li>Production hooks auto-refetch notification list</li>
                            <li>Production hooks use your custom axios instance with interceptors</li>
                        </ul>
                    </div>
                </section>

                <section className="summary">
                    <h2>📝 Summary</h2>
                    <div className="summary-box">
                        <h3>When to Use Production Hooks:</h3>
                        <ul>
                            <li>✅ In your actual application code</li>
                            <li>✅ When you need toast notifications</li>
                            <li>✅ When you need automatic notification updates</li>
                            <li>✅ When you need advanced error handling</li>
                            <li>✅ When you need custom headers or flexible URLs</li>
                        </ul>

                        <h3>When to Use Demo Hooks:</h3>
                        <ul>
                            <li>✅ For teaching and learning</li>
                            <li>✅ For simple prototypes</li>
                            <li>✅ When you want minimal dependencies</li>
                            <li>✅ When you need console logging for debugging</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}
