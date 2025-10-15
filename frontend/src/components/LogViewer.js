'use client';

import { useState, useEffect } from 'react';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Demo data for when backend is not available
  const demoLogs = [
    {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'User login successful',
      source: 'auth_service',
      metadata: { user_id: '12345', ip: '192.168.1.1' }
    },
    {
      timestamp: new Date(Date.now() - 30000).toISOString(),
      level: 'WARNING',
      message: 'Rate limit exceeded for user',
      source: 'rate_limiter',
      metadata: { user_id: '67890', attempts: 15 }
    },
    {
      timestamp: new Date(Date.now() - 60000).toISOString(),
      level: 'ERROR',
      message: 'Database connection failed',
      source: 'database_service',
      metadata: { connection_pool: 'exhausted', retry_count: 3 }
    },
    {
      timestamp: new Date(Date.now() - 90000).toISOString(),
      level: 'INFO',
      message: 'API request processed',
      source: 'api_gateway',
      metadata: { endpoint: '/api/users', method: 'GET', duration: 150 }
    },
    {
      timestamp: new Date(Date.now() - 120000).toISOString(),
      level: 'WARNING',
      message: 'High memory usage detected',
      source: 'monitoring_service',
      metadata: { usage_percent: 85, threshold: 80 }
    }
  ];


  // Fetch logs from backend
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/logs?limit=100`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setLogs(data.logs);
      } else {
        throw new Error(data.message || 'Failed to fetch logs');
      }
    } catch (err) {
      console.warn('Backend not available, using demo data:', err.message);
      setLogs(demoLogs);
      setError('Using demo data - backend not available');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh logs every 5 seconds
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter logs based on search and level
  const filteredLogs = logs.filter(log => {
    const matchesSearch = filter === '' || 
      log.message.toLowerCase().includes(filter.toLowerCase()) ||
      log.source.toLowerCase().includes(filter.toLowerCase());
    
    const matchesLevel = levelFilter === '' || log.level === levelFilter;
    
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return 'text-red-600 bg-red-50 border-red-200';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'INFO': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'DEBUG': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="dashboard-card p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold gradient-text">Real-time Logs</h2>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search logs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input w-48"
          />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="form-input w-32"
          >
            <option value="">All Levels</option>
            <option value="ERROR">ERROR</option>
            <option value="WARNING">WARNING</option>
            <option value="INFO">INFO</option>
            <option value="DEBUG">DEBUG</option>
          </select>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metadata
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.map((log, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatTimestamp(log.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {log.message}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.source}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {log.metadata ? (
                    <details className="cursor-pointer">
                      <summary className="text-blue-600 hover:text-blue-800">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  ) : (
                    <span className="text-gray-400">No metadata</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p>No logs found matching your criteria</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredLogs.length} of {logs.length} logs
        {error && ' (Demo mode)'}
      </div>
    </div>
  );
};

export default LogViewer;
