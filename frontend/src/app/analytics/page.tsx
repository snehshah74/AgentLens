'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const AnalyticsPage = () => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState('24h');
  const [metrics, setMetrics] = useState({
    totalRequests: 45678,
    avgResponseTime: 245,
    errorRate: 0.8,
    activeUsers: 1234,
    threatDetections: 23,
    falsePositives: 2
  });

  // Mock data for charts
  const requestData = [
    { time: '00:00', requests: 1200 },
    { time: '04:00', requests: 800 },
    { time: '08:00', requests: 2400 },
    { time: '12:00', requests: 3200 },
    { time: '16:00', requests: 2800 },
    { time: '20:00', requests: 1800 },
    { time: '24:00', requests: 1400 }
  ];

  const threatData = [
    { type: 'Prompt Injection', count: 12, severity: 'high' },
    { type: 'PII Leakage', count: 5, severity: 'critical' },
    { type: 'SQL Injection', count: 3, severity: 'medium' },
    { type: 'XSS Attempts', count: 2, severity: 'medium' },
    { type: 'Auth Failures', count: 1, severity: 'low' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold text-white">Analytics</h1>
              <p className="mt-2 text-sm text-gray-400">
                Deep insights into your AI system performance and security metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="form-input w-32"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24h</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <button className="btn-primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Metrics Overview */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="dashboard-card p-6 fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Requests</p>
                  <p className="text-3xl font-bold text-white">{metrics.totalRequests.toLocaleString()}</p>
                  <p className="text-sm text-green-400">+12% from last period</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6 fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg Response Time</p>
                  <p className="text-3xl font-bold text-white">{metrics.avgResponseTime}ms</p>
                  <p className="text-sm text-red-400">+5% from last period</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6 fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Error Rate</p>
                  <p className="text-3xl font-bold text-white">{metrics.errorRate}%</p>
                  <p className="text-sm text-green-400">-0.2% from last period</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts and Analysis */}
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Request Volume Chart */}
            <div className="dashboard-card p-6 fade-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Request Volume</h3>
                <div className="text-sm text-gray-400">Last 24 hours</div>
              </div>
              
              <div className="space-y-4">
                {requestData.map((point, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-xs text-gray-400">{point.time}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(point.requests / 3500) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="w-16 text-xs text-gray-400 text-right">
                          {point.requests.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Threat Analysis */}
            <div className="dashboard-card p-6 fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Threat Analysis</h3>
                <div className="text-sm text-gray-400">Last 24 hours</div>
              </div>
              
              <div className="space-y-4">
                {threatData.map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">
                        {threat.severity === 'critical' ? '🚨' : 
                         threat.severity === 'high' ? '⚠️' : 
                         threat.severity === 'medium' ? '⚡' : 'ℹ️'}
                      </div>
                      <div>
                        <div className="text-white font-medium">{threat.type}</div>
                        <div className="text-xs text-gray-400">
                          {threat.count} detection{threat.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="dashboard-card p-6 fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-semibold text-white mb-6">Performance Metrics</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">CPU Usage</span>
                    <span className="text-white">45%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Memory Usage</span>
                    <span className="text-white">62%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Disk Usage</span>
                    <span className="text-white">28%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Network I/O</span>
                    <span className="text-white">156 MB/s</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Summary */}
            <div className="dashboard-card p-6 fade-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg font-semibold text-white mb-6">Security Summary</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">{metrics.threatDetections}</div>
                  <div className="text-xs text-gray-400">Threats Detected</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{metrics.falsePositives}</div>
                  <div className="text-xs text-gray-400">False Positives</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{metrics.activeUsers}</div>
                  <div className="text-xs text-gray-400">Active Users</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">99.2%</div>
                  <div className="text-xs text-gray-400">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;


