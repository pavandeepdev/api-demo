import { Link } from 'react-router-dom';
import { CodeBlock } from '@/components/CodeBlock';

/**
 * QueryProviderDemo Page
 * 
 * Explains QueryClient configuration and provider setup.
 * Shows how to configure TanStack Query globally.
 */
export function QueryProviderDemo() {
    const providerCode = `// src/providers/query-provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,      // 5 minutes
          gcTime: 10 * 60 * 1000,         // 10 minutes (cache time)
          retry: 2,                        // Retry failed requests 2 times
          refetchOnWindowFocus: false,     // Don't refetch on window focus
        },
        mutations: {
          retry: 1,                        // Retry mutations once
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}`;

    const mainCode = `// src/main.tsx
import { QueryProvider } from './providers/query-provider';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryProvider>
  </StrictMode>
);`;

    const configExplanation = `// Query Configuration Explained

staleTime: 5 * 60 * 1000
// How long data is considered "fresh"
// During this time, no refetch happens
// 5 minutes = data stays fresh for 5 min

gcTime: 10 * 60 * 1000 (previously cacheTime)
// How long unused data stays in cache
// After this time, data is garbage collected
// 10 minutes = cache persists for 10 min

retry: 2
// Number of retry attempts for failed queries
// 0 = no retry, 3 = retry 3 times
// Exponential backoff between retries

refetchOnWindowFocus: false
// Whether to refetch when window regains focus
// true = refetch when user returns to tab
// false = don't refetch (better for demos)

retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
// Delay between retry attempts
// Exponential backoff: 1s, 2s, 4s, 8s...
// Max 30 seconds`;

    return (
        <div className="demo-page">
            <Link to="/" className="back-link">← Back to Home</Link>

            <header className="page-header">
                <h1>⚙️ Query Provider Setup</h1>
                <p>Learn how to configure TanStack Query globally</p>
            </header>

            <div className="demo-content">
                <section className="explanation">
                    <h2>What is QueryProvider?</h2>
                    <p>
                        The <code>QueryProvider</code> is a React Context Provider that wraps your entire
                        application and provides TanStack Query functionality to all components.
                    </p>
                    <p>
                        It creates a <code>QueryClient</code> instance that manages all queries and mutations,
                        including caching, background updates, and retry logic.
                    </p>
                </section>

                <section className="setup-steps">
                    <h2>📝 Setup Steps</h2>

                    <div className="step-card">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Install Dependencies</h3>
                            <CodeBlock
                                code="pnpm add @tanstack/react-query @tanstack/react-query-devtools"
                                language="bash"
                            />
                        </div>
                    </div>

                    <div className="step-card">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Create QueryProvider</h3>
                            <CodeBlock code={providerCode} language="typescript" title="query-provider.tsx" />
                        </div>
                    </div>

                    <div className="step-card">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Wrap Your App</h3>
                            <CodeBlock code={mainCode} language="typescript" title="main.tsx" />
                        </div>
                    </div>
                </section>

                <section className="configuration">
                    <h2>⚙️ Configuration Options</h2>
                    <CodeBlock code={configExplanation} language="typescript" title="Configuration Explained" />
                </section>

                <section className="config-table">
                    <h2>📊 Configuration Reference</h2>
                    <table className="config-reference">
                        <thead>
                            <tr>
                                <th>Option</th>
                                <th>Default</th>
                                <th>Description</th>
                                <th>When to Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>staleTime</code></td>
                                <td>0</td>
                                <td>Time before data is considered stale</td>
                                <td>Increase for rarely-changing data (user profiles, settings)</td>
                            </tr>
                            <tr>
                                <td><code>gcTime</code></td>
                                <td>5 min</td>
                                <td>Time before unused data is removed from cache</td>
                                <td>Increase for frequently-accessed data</td>
                            </tr>
                            <tr>
                                <td><code>retry</code></td>
                                <td>3</td>
                                <td>Number of retry attempts</td>
                                <td>Decrease for critical operations, increase for flaky APIs</td>
                            </tr>
                            <tr>
                                <td><code>refetchOnWindowFocus</code></td>
                                <td>true</td>
                                <td>Refetch when window regains focus</td>
                                <td>Disable for demos, enable for real-time apps</td>
                            </tr>
                            <tr>
                                <td><code>refetchOnReconnect</code></td>
                                <td>true</td>
                                <td>Refetch when internet reconnects</td>
                                <td>Keep enabled for most apps</td>
                            </tr>
                            <tr>
                                <td><code>refetchInterval</code></td>
                                <td>false</td>
                                <td>Polling interval (ms)</td>
                                <td>Set for real-time data (e.g., 30000 for 30s polling)</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="devtools">
                    <h2>🛠️ React Query DevTools</h2>
                    <div className="devtools-info">
                        <div className="devtools-screenshot">
                            <div className="devtools-placeholder">
                                <p>🔍 Look for the React Query icon in the bottom-right corner!</p>
                                <p>Click it to open DevTools and see:</p>
                                <ul>
                                    <li>All active queries</li>
                                    <li>Query states (loading, success, error)</li>
                                    <li>Cached data</li>
                                    <li>Refetch history</li>
                                    <li>Query invalidation</li>
                                </ul>
                            </div>
                        </div>
                        <div className="devtools-features">
                            <h3>DevTools Features:</h3>
                            <div className="feature-list">
                                <div className="feature-item">
                                    <span className="feature-icon">📊</span>
                                    <div>
                                        <strong>Query Explorer</strong>
                                        <p>See all queries and their states</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">💾</span>
                                    <div>
                                        <strong>Cache Inspector</strong>
                                        <p>View cached data in real-time</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">🔄</span>
                                    <div>
                                        <strong>Refetch Tracking</strong>
                                        <p>See when queries refetch</p>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">🐛</span>
                                    <div>
                                        <strong>Debug Tools</strong>
                                        <p>Manually trigger refetch/invalidate</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="best-practices">
                    <h2>💡 Best Practices</h2>
                    <div className="practices-grid">
                        <div className="practice-card">
                            <h4>🎯 Per-Query Configuration</h4>
                            <p>Override defaults for specific queries:</p>
                            <code>
                                useQuery({'{'}queryKey: ['users'], staleTime: 60000{'}'})
                            </code>
                        </div>

                        <div className="practice-card">
                            <h4>🔑 Consistent Query Keys</h4>
                            <p>Use arrays for query keys:</p>
                            <code>
                                ['users', {'{'}page: 1, limit: 10{'}'}]
                            </code>
                        </div>

                        <div className="practice-card">
                            <h4>⚡ Prefetching</h4>
                            <p>Prefetch data before it's needed:</p>
                            <code>
                                queryClient.prefetchQuery({'{'}queryKey: ['users']{'}'})</code>
                        </div>

                        <div className="practice-card">
                            <h4>🔄 Invalidation</h4>
                            <p>Invalidate queries after mutations:</p>
                            <code>
                                queryClient.invalidateQueries({'{'}queryKey: ['users']{'}'})</code>
                        </div>
                    </div>
                </section>

                <section className="common-patterns">
                    <h2>🎨 Common Patterns</h2>

                    <div className="pattern-card">
                        <h3>Pattern 1: Different staleTime for Different Data</h3>
                        <CodeBlock
                            code={`// Rarely changing data (user profile)
useQuery({ 
  queryKey: ['profile'], 
  staleTime: 60 * 60 * 1000 // 1 hour
});

// Frequently changing data (notifications)
useQuery({ 
  queryKey: ['notifications'], 
  staleTime: 30 * 1000 // 30 seconds
});`}
                            language="typescript"
                        />
                    </div>

                    <div className="pattern-card">
                        <h3>Pattern 2: Polling for Real-Time Data</h3>
                        <CodeBlock
                            code={`// Poll every 5 seconds
useQuery({ 
  queryKey: ['live-data'], 
  refetchInterval: 5000,
  refetchIntervalInBackground: true
});`}
                            language="typescript"
                        />
                    </div>

                    <div className="pattern-card">
                        <h3>Pattern 3: Dependent Queries</h3>
                        <CodeBlock
                            code={`// Fetch user first
const { data: user } = useQuery({ queryKey: ['user'] });

// Then fetch user's posts (only when user exists)
const { data: posts } = useQuery({ 
  queryKey: ['posts', user?.id],
  enabled: !!user // Don't run until user exists
});`}
                            language="typescript"
                        />
                    </div>
                </section>

                <section className="summary">
                    <h2>📝 Summary</h2>
                    <div className="summary-box">
                        <h3>Key Takeaways:</h3>
                        <ul>
                            <li>✅ QueryProvider wraps your app and provides TanStack Query functionality</li>
                            <li>✅ Configure global defaults in QueryClient for consistent behavior</li>
                            <li>✅ Override defaults per-query when needed</li>
                            <li>✅ Use DevTools for debugging and monitoring</li>
                            <li>✅ Adjust staleTime based on how often data changes</li>
                            <li>✅ Use query invalidation after mutations to keep data fresh</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}
