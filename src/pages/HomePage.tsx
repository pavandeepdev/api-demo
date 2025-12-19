import { Link } from 'react-router-dom';

export function HomePage() {
    return (
        <div className="home-page">
            <header className="hero">
                <h1>🚀 API Management in React</h1>
                <p className="description">
                    Learn about interceptors, custom hooks, and TanStack Query through hands-on examples
                </p>
            </header>

            <div className="demo-cards">
                <Link to="/interceptor-demo" className="demo-card">
                    <div className="card-icon">🔄</div>
                    <h3>Interceptor Demo</h3>
                    <p>See how request and response interceptors work in real-time</p>
                    <ul className="card-features">
                        <li>Request logging</li>
                        <li>Auth token injection</li>
                        <li>Error handling</li>
                    </ul>
                </Link>

                <Link to="/useeffect-vs-query" className="demo-card">
                    <div className="card-icon">⚖️</div>
                    <h3>useEffect vs TanStack Query</h3>
                    <p>Side-by-side comparison of both approaches</p>
                    <ul className="card-features">
                        <li>Code comparison</li>
                        <li>Caching demonstration</li>
                        <li>Performance metrics</li>
                    </ul>
                </Link>

                <Link to="/custom-hooks-demo" className="demo-card">
                    <div className="card-icon">🎣</div>
                    <h3>Custom Hooks Demo</h3>
                    <p>Interactive CRUD operations with custom hooks</p>
                    <ul className="card-features">
                        <li>useFetchData - Fetch data</li>
                        <li>usePostData - Create items</li>
                        <li>usePutData - Update items</li>
                        <li>usePatchData - Partial update</li>
                        <li>useDeleteData - Remove items</li>
                    </ul>
                </Link>

                <Link to="/query-provider-demo" className="demo-card">
                    <div className="card-icon">⚙️</div>
                    <h3>Query Provider Setup</h3>
                    <p>Learn about QueryClient configuration</p>
                    <ul className="card-features">
                        <li>Provider setup</li>
                        <li>Global settings</li>
                        <li>DevTools usage</li>
                    </ul>
                </Link>

                <Link to="/production-hooks" className="demo-card">
                    <div className="card-icon">🏭</div>
                    <h3>Production API Hooks</h3>
                    <p>Advanced hooks used in real applications</p>
                    <ul className="card-features">
                        <li>Toast notifications</li>
                        <li>Error handling</li>
                        <li>Auto refetching</li>
                        <li>Custom headers</li>
                    </ul>
                </Link>
            </div>

            <section className="concepts-overview">
                <h2>📚 What You'll Learn</h2>
                <div className="concepts-grid">
                    <div className="concept">
                        <h4>🔌 Interceptors</h4>
                        <p>Middleware pattern for HTTP requests/responses</p>
                    </div>
                    <div className="concept">
                        <h4>💾 Caching</h4>
                        <p>Automatic data caching and invalidation</p>
                    </div>
                    <div className="concept">
                        <h4>⚡ Optimistic Updates</h4>
                        <p>Update UI before server responds</p>
                    </div>
                    <div className="concept">
                        <h4>🔄 Auto Refetch</h4>
                        <p>Keep data fresh automatically</p>
                    </div>
                </div>
            </section>

            <footer className="home-footer">
                <p>💡 Open your browser console to see detailed logs</p>
                <p>🛠️ Check React Query DevTools (bottom-right corner)</p>
            </footer>
        </div>
    );
}
