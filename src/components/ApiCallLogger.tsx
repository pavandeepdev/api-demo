import { useEffect, useState } from 'react';

interface ApiLog {
    id: string;
    timestamp: string;
    type: 'request' | 'response' | 'error';
    method?: string;
    url?: string;
    status?: number;
    data?: any;
}

/**
 * ApiCallLogger Component
 * 
 * Real-time logger that displays API calls as they happen.
 * Useful for teaching how interceptors work.
 */
export function ApiCallLogger() {
    const [logs, setLogs] = useState<ApiLog[]>([]);

    useEffect(() => {
        // In a real implementation, you'd hook into axios interceptors
        // For demo purposes, we'll just show the structure

        const originalConsoleLog = console.log;

        // Intercept console.log to capture our custom logs
        console.log = (...args: any[]) => {
            originalConsoleLog(...args);

            // Check if this is one of our interceptor logs
            const message = args[0];
            if (typeof message === 'string' && message.includes('[REQUEST INTERCEPTOR]')) {
                setLogs(prev => [...prev, {
                    id: Date.now().toString(),
                    timestamp: new Date().toLocaleTimeString(),
                    type: 'request',
                    method: args[1]?.method,
                    url: args[1]?.url,
                }]);
            } else if (typeof message === 'string' && message.includes('[RESPONSE INTERCEPTOR]')) {
                setLogs(prev => [...prev, {
                    id: Date.now().toString(),
                    timestamp: new Date().toLocaleTimeString(),
                    type: 'response',
                    status: args[1]?.status,
                    data: args[1]?.data,
                }]);
            }
        };

        return () => {
            console.log = originalConsoleLog;
        };
    }, []);

    const clearLogs = () => setLogs([]);

    return (
        <div className="api-logger">
            <div className="logger-header">
                <h3>📡 API Call Logger</h3>
                <button onClick={clearLogs} className="clear-button">Clear</button>
            </div>

            <div className="logger-content">
                {logs.length === 0 ? (
                    <p className="no-logs">No API calls yet. Trigger an API call to see logs here.</p>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className={`log-entry ${log.type}`}>
                            <span className="log-time">{log.timestamp}</span>
                            <span className={`log-type ${log.type}`}>
                                {log.type === 'request' ? '📤' : log.type === 'response' ? '📥' : '❌'}
                                {log.type.toUpperCase()}
                            </span>
                            {log.method && <span className="log-method">{log.method}</span>}
                            {log.url && <span className="log-url">{log.url}</span>}
                            {log.status && <span className="log-status">{log.status}</span>}
                        </div>
                    ))
                )}
            </div>

            <div className="logger-footer">
                <small>💡 Open browser console for detailed logs</small>
            </div>
        </div>
    );
}
