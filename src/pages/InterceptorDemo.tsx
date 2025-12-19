import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CodeBlock } from '@/components/CodeBlock';
import { ApiCallLogger } from '@/components/ApiCallLogger';
import axiosDemo from '@/config/axios-demo';
import API from '@/config/api/api';

/**
 * InterceptorDemo Page
 * 
 * Visual demonstration of how interceptors work.
 * Shows request/response flow with live logging.
 */
export function InterceptorDemo() {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);

    const makeApiCall = async () => {
        setLoading(true);
        setResponse(null);

        try {
            console.log('👆 User clicked button - making API call...');
            const { data } = await axiosDemo.get(API.demo.posts);
            setResponse({ success: true, data: data.slice(0, 3) }); // Show first 3 users
        } catch (error: any) {
            setResponse({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const makeErrorCall = async () => {
        setLoading(true);
        setResponse(null);

        try {
            console.log('👆 User clicked error button - making failing API call...');
            await axiosDemo.get('/invalid-endpoint-404');
        } catch (error: any) {
            setResponse({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const interceptorCode = `// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const accessToken = await getClientToken();
      if (accessToken) {
        config.headers.Authorization = 'Bearer ' + accessToken;
      }
    }
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else if (config.data) {
      config.headers["Content-Type"] = "application/json;charset=utf-8";
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  <T>(res: AxiosResponse<ApiResponse<T>>) => {
    if (!res.data) throw new Error("Error in response");
    const { statusCode, error } = res.data;
    const hasSuccess =
      (statusCode === 200 || statusCode === 201) && error === false;
    if (hasSuccess) {
      return res;
    }
    throw new Error(res.data.message || "Unknown API error");
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      if (typeof window !== "undefined") {
        await signOut();
        window.localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);;`;

    return (
        <div className="demo-page">
            <Link to="/" className="back-link">← Back to Home</Link>

            <header className="page-header">
                <h1>🔄 Interceptor Demo</h1>
                <p>See how interceptors modify requests and responses</p>
            </header>

            <div className="demo-content">
                <section className="explanation">
                    <h2>What are Interceptors?</h2>
                    <p>
                        Interceptors are middleware functions that run <strong>before</strong> requests
                        are sent and <strong>after</strong> responses are received. They allow you to:
                    </p>
                    <ul>
                        <li>✅ Add authentication tokens to all requests</li>
                        <li>✅ Log all API calls for debugging</li>
                        <li>✅ Handle errors globally (401, 403, 500)</li>
                        <li>✅ Transform request/response data</li>
                        <li>✅ Add custom headers</li>
                    </ul>
                </section>

                <section className="code-section">
                    <h2>📝 Interceptor Code</h2>
                    <CodeBlock
                        code={interceptorCode}
                        language="typescript"
                        title="axios-demo.ts"
                    />
                </section>

                <section className="interactive-section">
                    <h2>🎮 Try It Out</h2>
                    <p>Click the buttons below and watch the console logs!</p>

                    <div className="button-group">
                        <button
                            onClick={makeApiCall}
                            disabled={loading}
                            className="demo-button success"
                        >
                            {loading ? '⏳ Loading...' : '✅ Make Successful API Call'}
                        </button>

                        <button
                            onClick={makeErrorCall}
                            disabled={loading}
                            className="demo-button error"
                        >
                            {loading ? '⏳ Loading...' : '❌ Make Failing API Call'}
                        </button>
                    </div>

                    {response && (
                        <div className="response-container">
                            <h4 className={`response-title ${response.success ? 'success' : 'error'}`}>
                                {response.success ? '✅ Success Response' : '❌ Error Response'}
                            </h4>
                            <CodeBlock
                                code={JSON.stringify(response, null, 2)}
                                language="json"
                            />
                        </div>
                    )}
                </section>

                <section className="logger-section">
                    <ApiCallLogger />
                </section>

                <section className="flow-diagram">
                    <h2>📊 Request/Response Flow</h2>
                    <div className="flow-chart">
                        <div className="flow-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <strong>Component</strong>
                                <p>Makes API call</p>
                            </div>
                        </div>
                        <div className="flow-arrow">→</div>
                        <div className="flow-step highlight">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <strong>Request Interceptor</strong>
                                <p>Adds token, headers, logs</p>
                            </div>
                        </div>
                        <div className="flow-arrow">→</div>
                        <div className="flow-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <strong>Server</strong>
                                <p>Processes request</p>
                            </div>
                        </div>
                        <div className="flow-arrow">→</div>
                        <div className="flow-step highlight">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <strong>Response Interceptor</strong>
                                <p>Handles errors, logs</p>
                            </div>
                        </div>
                        <div className="flow-arrow">→</div>
                        <div className="flow-step">
                            <div className="step-number">5</div>
                            <div className="step-content">
                                <strong>Component</strong>
                                <p>Receives data</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="tips">
                    <h2>💡 Pro Tips</h2>
                    <div className="tip-card">
                        <strong>🔐 Authentication:</strong> Store tokens in session / cookie and add them in request interceptor
                    </div>
                    <div className="tip-card">
                        <strong>🔄 Token Refresh:</strong> Catch 401 errors in response interceptor and refresh token automatically
                    </div>
                    <div className="tip-card">
                        <strong>📊 Logging:</strong> Use interceptors for centralized API logging in development
                    </div>
                    <div className="tip-card">
                        <strong>🌐 Base URL:</strong> Set baseURL in axios instance to avoid repeating it in every call
                    </div>
                </section>
            </div>
        </div>
    );
}
