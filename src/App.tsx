import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { InterceptorDemo } from './pages/InterceptorDemo';
import { UseEffectVsQuery } from './pages/UseEffectVsQuery';
import { CustomHooksDemo } from './pages/CustomHooksDemo';
import { QueryProviderDemo } from './pages/QueryProviderDemo';
import { ProductionHooksDemo } from './pages/ProductionHooksDemo';
import './App.css';
import './styles/demo.css';


function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="app">
      {!isHomePage && (
        <nav className="main-nav">
          <Link to="/" className="nav-logo">
            🚀 API Demo
          </Link>
          <div className="nav-links">
            <Link to="/interceptor-demo" className={location.pathname === '/interceptor-demo' ? 'active' : ''}>
              🔄 Interceptors
            </Link>
            <Link to="/useeffect-vs-query" className={location.pathname === '/useeffect-vs-query' ? 'active' : ''}>
              ⚖️ Comparison
            </Link>
            <Link to="/custom-hooks-demo" className={location.pathname === '/custom-hooks-demo' ? 'active' : ''}>
              🎣 Hooks
            </Link>
            <Link to="/query-provider-demo" className={location.pathname === '/query-provider-demo' ? 'active' : ''}>
              ⚙️ Provider
            </Link>
            <Link to="/production-hooks" className={location.pathname === '/production-hooks' ? 'active' : ''}>
              🏭 Production
            </Link>
          </div>
        </nav>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/interceptor-demo" element={<InterceptorDemo />} />
          <Route path="/useeffect-vs-query" element={<UseEffectVsQuery />} />
          <Route path="/custom-hooks-demo" element={<CustomHooksDemo />} />
          <Route path="/query-provider-demo" element={<QueryProviderDemo />} />
          <Route path="/production-hooks" element={<ProductionHooksDemo />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

