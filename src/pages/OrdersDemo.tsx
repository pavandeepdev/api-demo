import { Link } from 'react-router-dom';
import { CodeBlock } from '@/components/CodeBlock';
import { useGetOrders } from '@/features/orders/services/orders.services';

/**
 * OrdersDemo Page
 * 
 * Demonstrates real-world usage of custom hooks with order data
 * from the staging API. Shows loading states, error handling,
 * and data display.
 */

export function OrdersDemo() {
    // Fetch orders from the staging API
    const { data: orders, isLoading, error, refetch } = useGetOrders();

    const serviceCode = `// orders.services.ts
import API from '@/config/api/api';
import useFetchData from '@/hooks/use-fetch-data';
import type { Order } from '@/types';

export const useGetOrders = (params?: Record<string, unknown>) => {
  return useFetchData<Order[]>({
    url: API.order.list,
    params,
  });
};

// Usage in component
const { data: orders, isLoading, error } = useGetOrders();`;

    const hookCode = `// useFetchData Hook Implementation
const useFetchData = <TData = unknown>({ url, params }) => {
  return useQuery<TData, Error>({
    queryKey: [url, params],
    queryFn: async () => {
      const queryString = buildQueryString(params);
      const response = await instance.get({
        url: \`\${url}\${queryString}\`
      });
      
      if (response?.statusCode === 200) {
        return response.data;
      }
      
      throw new Error(response?.message || 'Failed to fetch data');
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};`;

    return (
        <div className="demo-page">
            <Link to="/" className="back-link">← Back to Home</Link>

            <header className="page-header">
                <h1>📦 Orders Demo - Real API Data</h1>
                <p>Fetching real order data from staging API</p>
            </header>

            <div className="demo-content">
                <section className="explanation">
                    <h2>🎯 What This Page Demonstrates</h2>
                    <div className="benefits-grid">
                        <div className="benefit-item">✅ <strong>Real API Integration</strong> - Connects to staging server</div>
                        <div className="benefit-item">✅ <strong>Service Layer Pattern</strong> - Organized API calls</div>
                        <div className="benefit-item">✅ <strong>Type Safety</strong> - Full TypeScript support</div>
                        <div className="benefit-item">✅ <strong>Error Handling</strong> - Graceful error states</div>
                    </div>
                </section>

                <section className="code-section">
                    <h2>📝 Service Layer Code</h2>
                    <p>
                        This is how we organize API calls in a production application.
                        Each feature has its own service file with typed hooks.
                    </p>
                    <CodeBlock code={serviceCode} language="typescript" title="orders.services.ts" />
                </section>

                <section className="code-section">
                    <h2>🔧 Hook Implementation</h2>
                    <p>
                        The <code>useFetchData</code> hook wraps TanStack Query and our axios instance,
                        providing automatic caching, error handling, and loading states.
                    </p>
                    <CodeBlock code={hookCode} language="typescript" title="use-fetch-data.ts" />
                </section>

                <section className="live-demo">
                    <h2>🎮 Live Data from Staging API</h2>

                    <div className="demo-controls">
                        <button
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="demo-button"
                        >
                            {isLoading ? '⏳ Loading...' : '🔄 Refresh Orders'}
                        </button>
                    </div>

                    {isLoading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>⏳ Fetching orders from staging API...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-state">
                            <h3>❌ Error Loading Orders</h3>
                            <p>{error.message}</p>
                            <p className="error-hint">
                                💡 This might be because:
                                <ul>
                                    <li>The staging API is down</li>
                                    <li>Network connection issues</li>
                                    <li>CORS configuration</li>
                                    <li>Authentication required</li>
                                </ul>
                            </p>
                        </div>
                    )}

                    {!isLoading && !error && orders && (
                        <>
                            <div className="data-summary">
                                <p>✅ Successfully loaded <strong>{orders.length}</strong> orders</p>
                            </div>

                            <div className="orders-grid">
                                {orders.slice(0, 10).map((order: any, index: number) => (
                                    <div key={order.id || index} className="order-card">
                                        <div className="order-header">
                                            <h4>Order #{order.orderNumber || order.id || index + 1}</h4>
                                            <span className={`status-badge ${order.status || 'pending'}`}>
                                                {order.status || 'Pending'}
                                            </span>
                                        </div>
                                        <div className="order-details">
                                            <p><strong>Customer:</strong> {order.customerName || 'N/A'}</p>
                                            <p><strong>Amount:</strong> ${order.totalAmount || '0.00'}</p>
                                            <p><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {orders.length > 10 && (
                                <p className="data-note">
                                    Showing first 10 of {orders.length} orders
                                </p>
                            )}
                        </>
                    )}

                    {!isLoading && !error && (!orders || orders.length === 0) && (
                        <div className="empty-state">
                            <p>📭 No orders found</p>
                        </div>
                    )}
                </section>

                <section className="architecture">
                    <h2>🏗️ Architecture Overview</h2>
                    <div className="architecture-diagram">
                        <div className="arch-layer">
                            <div className="arch-box">
                                <strong>Component</strong>
                                <code>OrdersDemo.tsx</code>
                            </div>
                        </div>
                        <div className="arch-arrow">↓ calls</div>
                        <div className="arch-layer">
                            <div className="arch-box highlight">
                                <strong>Service Layer</strong>
                                <code>orders.services.ts</code>
                                <p>useGetOrders()</p>
                            </div>
                        </div>
                        <div className="arch-arrow">↓ uses</div>
                        <div className="arch-layer">
                            <div className="arch-box highlight">
                                <strong>Custom Hook</strong>
                                <code>use-fetch-data.ts</code>
                                <p>Wraps TanStack Query</p>
                            </div>
                        </div>
                        <div className="arch-arrow">↓ calls</div>
                        <div className="arch-layer">
                            <div className="arch-box">
                                <strong>Axios Instance</strong>
                                <code>instance.ts</code>
                                <p>With Interceptors</p>
                            </div>
                        </div>
                        <div className="arch-arrow">↓ requests</div>
                        <div className="arch-layer">
                            <div className="arch-box">
                                <strong>Staging API</strong>
                                <code>dtep-river-api-staging.devstree.in</code>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="benefits">
                    <h2>✨ Benefits of This Approach</h2>
                    <div className="benefits-list">
                        <div className="benefit-card">
                            <h4>🎯 Separation of Concerns</h4>
                            <p>
                                API logic is separated from UI components. Services can be reused
                                across multiple components.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <h4>🔒 Type Safety</h4>
                            <p>
                                TypeScript ensures type safety from API response to UI rendering.
                                Catch errors at compile time, not runtime.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <h4>🧪 Easy Testing</h4>
                            <p>
                                Service hooks can be easily mocked in tests. Test components
                                without making real API calls.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <h4>♻️ Reusability</h4>
                            <p>
                                Same service hooks can be used in multiple components.
                                Write once, use everywhere.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <h4>📦 Automatic Caching</h4>
                            <p>
                                TanStack Query handles caching automatically. Navigate away and back
                                - data is still there!
                            </p>
                        </div>

                        <div className="benefit-card">
                            <h4>🔄 Background Refetching</h4>
                            <p>
                                Data is automatically refetched when it becomes stale or when
                                the window regains focus.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="tips">
                    <h2>💡 Best Practices</h2>
                    <div className="tips-grid">
                        <div className="tip-card">
                            <h4>📁 Organize by Feature</h4>
                            <p>Group related services together</p>
                            <code>/features/orders/services/</code>
                        </div>
                        <div className="tip-card">
                            <h4>🏷️ Use TypeScript</h4>
                            <p>Define types for all API responses</p>
                            <code>useFetchData{'<Order[]>'}</code>
                        </div>
                        <div className="tip-card">
                            <h4>🔑 Consistent Naming</h4>
                            <p>Follow naming conventions</p>
                            <code>useGet*, useCreate*, useUpdate*</code>
                        </div>
                        <div className="tip-card">
                            <h4>⚠️ Handle Errors</h4>
                            <p>Always handle loading and error states</p>
                            <code>if (error) return ...</code>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
