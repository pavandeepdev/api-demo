import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ComparisonPanel } from '@/components/ComparisonPanel';
import { CodeBlock } from '@/components/CodeBlock';
import useFetchData from '@/hooks/use-fetch-data';
import API from '@/config/api/api';
import type { User } from '@/types';

/**
 * UseEffectVsQuery Page
 * 
 * Side-by-side comparison showing the difference between
 * traditional useEffect approach and TanStack Query approach.
 */

// ============================================
// LEFT PANEL: useEffect Approach
// ============================================
function UseEffectApproach() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiCallCount, setApiCallCount] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            setApiCallCount(prev => prev + 1);

            try {
                const response = await fetch(API.demo.users);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (isMounted) {
                    setUsers(data.slice(0, 5)); // Show first 5 users
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array

    return (
        <div className="approach-content">
            <div className="metrics">
                <span className="metric-badge">API Calls: {apiCallCount}</span>
                <span className="metric-badge">Cache: ❌ None</span>
            </div>

            {loading && <div className="loading">⏳ Loading...</div>}
            {error && <div className="error">❌ Error: {error}</div>}

            {!loading && !error && (
                <div className="user-list">
                    {users.map(user => (
                        <div key={user.id} className="user-card">
                            <strong>{user.name}</strong>
                            <p>{user.email}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// RIGHT PANEL: TanStack Query Approach
// ============================================
function TanStackQueryApproach() {
    const { data: users, isLoading, error } = useFetchData<User[]>({
        url: API.demo.users,
        queryOptions: {
            select: (data: any) => data.slice(0, 5), // Show first 5 users
        },
    });

    return (
        <div className="approach-content">
            <div className="metrics">
                <span className="metric-badge success">Cache: ✅ Enabled</span>
                <span className="metric-badge success">Auto-Refetch: ✅</span>
            </div>

            {isLoading && <div className="loading">⏳ Loading...</div>}
            {error && <div className="error">❌ Error: {error.message}</div>}

            {!isLoading && !error && users && (
                <div className="user-list">
                    {users.map(user => (
                        <div key={user.id} className="user-card">
                            <strong>{user.name}</strong>
                            <p>{user.email}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function UseEffectVsQuery() {
    const useEffectCode = `// ❌ Traditional useEffect Approach
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        
        if (isMounted) {
          setUsers(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false; // Prevent memory leaks
    };
  }, []);

  // 40+ lines of boilerplate!
}`;

    const tanStackCode = `// ✅ TanStack Query Approach with Custom Hook
function UserList() {
  const { data: users, isLoading, error } = useFetchData({
    url: '/api/users'
  });

  // That's it! Only 3 lines!
  // Automatic caching, refetching, error handling, etc.
}`;

    return (
        <div className="demo-page">
            <Link to="/" className="back-link">← Back to Home</Link>

            <header className="page-header">
                <h1>⚖️ useEffect vs TanStack Query</h1>
                <p>See the difference in code and behavior</p>
            </header>

            <div className="demo-content">
                <section className="explanation">
                    <h2>The Problem with useEffect</h2>
                    <div className="problem-grid">
                        <div className="problem-card">
                            <span className="problem-icon">📝</span>
                            <h4>Too Much Boilerplate</h4>
                            <p>40+ lines for simple data fetching</p>
                        </div>
                        <div className="problem-card">
                            <span className="problem-icon">🔄</span>
                            <h4>No Caching</h4>
                            <p>Every mount = new API call</p>
                        </div>
                        <div className="problem-card">
                            <span className="problem-icon">🐛</span>
                            <h4>Memory Leaks</h4>
                            <p>Need manual cleanup with isMounted</p>
                        </div>
                        <div className="problem-card">
                            <span className="problem-icon">❌</span>
                            <h4>No Retry Logic</h4>
                            <p>Failed requests stay failed</p>
                        </div>
                    </div>
                </section>

                <section className="code-comparison">
                    <h2>📝 Code Comparison</h2>
                    <div className="code-grid">
                        <div className="code-column">
                            <h3>❌ useEffect (40+ lines)</h3>
                            <CodeBlock code={useEffectCode} language="typescript" />
                        </div>
                        <div className="code-column">
                            <h3>✅ TanStack Query (3 lines)</h3>
                            <CodeBlock code={tanStackCode} language="typescript" />
                        </div>
                    </div>
                </section>

                <section className="live-comparison">
                    <h2>🎮 Live Comparison</h2>
                    <p className="comparison-note">
                        💡 Both panels fetch the same data. Notice how TanStack Query provides
                        better developer experience with less code!
                    </p>

                    <ComparisonPanel
                        leftTitle="❌ useEffect Approach"
                        leftContent={<UseEffectApproach />}
                        rightTitle="✅ TanStack Query Approach"
                        rightContent={<TanStackQueryApproach />}
                    />
                </section>

                <section className="benefits">
                    <h2>✨ Why TanStack Query is Better</h2>
                    <div className="benefits-grid">
                        <div className="benefit-card">
                            <h4>💾 Automatic Caching</h4>
                            <p>Data is cached automatically. Same query = no new API call!</p>
                            <code>staleTime: 5 * 60 * 1000 // 5 minutes</code>
                        </div>

                        <div className="benefit-card">
                            <h4>🔄 Background Refetching</h4>
                            <p>Automatically refetches stale data in the background</p>
                            <code>refetchOnWindowFocus: true</code>
                        </div>

                        <div className="benefit-card">
                            <h4>🔁 Automatic Retry</h4>
                            <p>Failed requests are automatically retried with exponential backoff</p>
                            <code>retry: 3</code>
                        </div>

                        <div className="benefit-card">
                            <h4>🎯 Request Deduplication</h4>
                            <p>Multiple components requesting same data = 1 API call</p>
                            <code>queryKey: ['users']</code>
                        </div>

                        <div className="benefit-card">
                            <h4>⚡ Optimistic Updates</h4>
                            <p>Update UI immediately, rollback on error</p>
                            <code>onMutate: async (newData) {'=>'} {'{...}'}</code>
                        </div>

                        <div className="benefit-card">
                            <h4>🛠️ DevTools</h4>
                            <p>Built-in DevTools for debugging queries and mutations</p>
                            <code>{'<ReactQueryDevtools />'}</code>
                        </div>
                    </div>
                </section>

                <section className="comparison-table">
                    <h2>📊 Feature Comparison</h2>
                    <table className="feature-table">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>useEffect</th>
                                <th>TanStack Query</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Lines of Code</td>
                                <td className="bad">40-50 lines</td>
                                <td className="good">1-5 lines</td>
                            </tr>
                            <tr>
                                <td>Caching</td>
                                <td className="bad">❌ Manual</td>
                                <td className="good">✅ Automatic</td>
                            </tr>
                            <tr>
                                <td>Error Handling</td>
                                <td className="bad">❌ Per component</td>
                                <td className="good">✅ Global</td>
                            </tr>
                            <tr>
                                <td>Loading States</td>
                                <td className="bad">❌ Manual</td>
                                <td className="good">✅ Automatic</td>
                            </tr>
                            <tr>
                                <td>Retry Logic</td>
                                <td className="bad">❌ Manual</td>
                                <td className="good">✅ Automatic</td>
                            </tr>
                            <tr>
                                <td>Optimistic Updates</td>
                                <td className="bad">❌ Complex</td>
                                <td className="good">✅ Built-in</td>
                            </tr>
                            <tr>
                                <td>DevTools</td>
                                <td className="bad">❌ None</td>
                                <td className="good">✅ Included</td>
                            </tr>
                            <tr>
                                <td>Type Safety</td>
                                <td className="bad">⚠️ Manual</td>
                                <td className="good">✅ Inferred</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section className="conclusion">
                    <h2>🎯 Conclusion</h2>
                    <div className="conclusion-box">
                        <h3>When to use each:</h3>
                        <div className="conclusion-grid">
                            <div className="conclusion-item">
                                <h4>✅ Use TanStack Query for:</h4>
                                <ul>
                                    <li>Server state (API data)</li>
                                    <li>Data that needs caching</li>
                                    <li>Background synchronization</li>
                                    <li>CRUD operations</li>
                                </ul>
                            </div>
                            <div className="conclusion-item">
                                <h4>✅ Use useEffect for:</h4>
                                <ul>
                                    <li>Client-side state</li>
                                    <li>Side effects (analytics, logging)</li>
                                    <li>WebSocket connections</li>
                                    <li>DOM manipulations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
