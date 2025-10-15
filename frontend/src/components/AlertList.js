'use client';

import { useState, useEffect } from 'react';

const AlertList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Demo alerts for when backend is not available
  const demoAlerts = [
    {
      alert_id: 'alert_1_demo',
      title: 'Security Issue: Prompt Injection',
      message: 'Potential prompt injection attempt detected\nSource: chat_service\nThreat Level: CRITICAL\nSuggested Action: Block request and investigate prompt injection attempt',
      severity: 'critical',
      source: 'security_analysis',
      timestamp: new Date().toISOString(),
      status: 'pending',
      metadata: {
        issue_type: 'prompt_injection',
        threat_level: 'critical',
        confidence_score: 0.95,
        matched_pattern: 'ignore\\s+(?:previous|above|all)\\s+(?:instructions?|prompts?)'
      }
    },
    {
      alert_id: 'alert_2_demo',
      title: 'Security Issue: Pii Leakage',
      message: 'Potential EMAIL leakage detected\nSource: user_service\nThreat Level: HIGH\nSuggested Action: Review and redact email information from logs',
      severity: 'high',
      source: 'security_analysis',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      status: 'sent',
      metadata: {
        issue_type: 'pii_leakage',
        threat_level: 'high',
        confidence_score: 0.9,
        matched_pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'
      }
    },
    {
      alert_id: 'alert_3_demo',
      title: 'High Error Rate',
      message: 'Multiple authentication failures detected from same IP address',
      severity: 'warning',
      source: 'monitoring_service',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'acknowledged',
      metadata: {
        failure_count: 15,
        ip_address: '192.168.1.100',
        time_window: '5 minutes'
      }
    },
    {
      alert_id: 'alert_4_demo',
      title: 'System Overload',
      message: 'Memory usage exceeded 90% threshold',
      severity: 'error',
      source: 'system_monitor',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: 'sent',
      metadata: {
        memory_usage: 92,
        threshold: 90,
        affected_services: ['api_gateway', 'auth_service']
      }
    },
    {
      alert_id: 'alert_5_demo',
      title: 'Security Issue: Suspicious Pattern',
      message: 'Suspicious keyword \'admin\' detected\nSource: log_service\nThreat Level: MEDIUM\nSuggested Action: Review log context for potential security implications',
      severity: 'warning',
      source: 'security_analysis',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: 'pending',
      metadata: {
        issue_type: 'suspicious_pattern',
        threat_level: 'medium',
        confidence_score: 0.6,
        matched_pattern: 'admin'
      }
    }
  ];

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/alerts?limit=100`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setAlerts(data.alerts);
      } else {
        throw new Error(data.message || 'Failed to fetch alerts');
      }
    } catch (err) {
      console.warn('Backend not available, using demo data:', err.message);
      setAlerts(demoAlerts);
      setError('Using demo data - backend not available');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh alerts every 5 seconds
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Acknowledge alert
  const acknowledgeAlert = async (alertId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Update local state
        setAlerts(prevAlerts => 
          prevAlerts.map(alert => 
            alert.alert_id === alertId 
              ? { ...alert, status: 'acknowledged' }
              : alert
          )
        );
      }
    } catch (err) {
      console.warn('Failed to acknowledge alert:', err.message);
      // For demo mode, just update locally
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.alert_id === alertId 
            ? { ...alert, status: 'acknowledged' }
            : alert
        )
      );
    }
  };

  // Filter alerts based on severity and status
  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = severityFilter === '' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === '' || alert.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100 border-red-200';
      case 'high': return 'text-orange-800 bg-orange-100 border-orange-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      case 'info': return 'text-blue-800 bg-blue-100 border-blue-200';
      default: return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'sent': return 'text-blue-600 bg-blue-50';
      case 'acknowledged': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - alertTime) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className="dashboard-card p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold gradient-text">Security Alerts</h2>
        <div className="flex gap-4 items-center">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="form-input w-32"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input w-32"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={fetchAlerts}
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

      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div key={alert.alert_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{alert.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getStatusColor(alert.status)}`}>
                    {alert.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-line">{alert.message}</p>
              </div>
              <div className="text-right text-sm text-gray-500 ml-4">
                <div>{formatTimestamp(alert.timestamp)}</div>
                <div className="text-xs">{getTimeAgo(alert.timestamp)}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Source: <span className="font-medium">{alert.source}</span>
                </span>
                {alert.metadata && (
                  <details className="cursor-pointer">
                    <summary className="text-blue-600 hover:text-blue-800 text-sm">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-w-md">
                      {JSON.stringify(alert.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              
              {alert.status === 'pending' || alert.status === 'sent' ? (
                <button
                  onClick={() => acknowledgeAlert(alert.alert_id)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Acknowledge
                </button>
              ) : (
                <span className="text-sm text-green-600 font-medium">✓ Acknowledged</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p>No alerts found matching your criteria</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredAlerts.length} of {alerts.length} alerts
        {error && ' (Demo mode)'}
      </div>
    </div>
  );
};

export default AlertList;
