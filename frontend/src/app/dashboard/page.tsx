'use client';

import React, { useState, useEffect } from 'react';
import LogViewer from '../../components/LogViewer';
import AlertList from '../../components/AlertList';
import LogSubmission from '../../components/LogSubmission';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [backendStatus, setBackendStatus] = useState('checking');
  const [stats, setStats] = useState({
    totalLogs: 0,
    totalAlerts: 0,
    activeServices: 0,
    uptime: '99.9%'
  });

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      console.warn('Backend not available:', error);
      setBackendStatus('offline');
      // Set demo stats
      setStats({
        totalLogs: 1247,
        totalAlerts: 23,
        activeServices: 8,
        uptime: '99.9%'
      });
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online': return 'border-green-500 bg-green-500/10 text-green-400';
      case 'offline': return 'border-red-500 bg-red-500/10 text-red-400';
      default: return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'online': return 'Backend Online';
      case 'offline': return 'Backend Offline';
      default: return 'Checking...';
    }
  };

  const handleLogSubmitted = (result: any) => {
    console.log('Log submitted:', result);
    // Refresh stats and components
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="fade-in">
              <h1 className="text-4xl font-bold text-white">
                AI Observability Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Real-time monitoring and security analysis for agentic AI systems
              </p>
            </div>
            <div className="flex items-center gap-4 slide-in">
              <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor()}`}>
                <span className={`status-indicator ${backendStatus === 'online' ? 'online' : 'offline'}`}></span>
                {getStatusText()}
              </div>
              <button
                onClick={fetchStats}
                className="btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Stats
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="dashboard-card p-6 fade-in">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Total Logs</p>
                  <p className="text-2xl font-bold text-white">{stats.totalLogs.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6 fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Alerts</p>
                  <p className="text-2xl font-bold text-white">{stats.totalAlerts}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6 fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Active Services</p>
                  <p className="text-2xl font-bold text-white">{stats.activeServices}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6 fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">Uptime</p>
                  <p className="text-2xl font-bold text-white">{stats.uptime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Log Submission */}
          <div className="fade-in" style={{ animationDelay: '0.4s' }}>
            <LogSubmission onLogSubmitted={handleLogSubmitted} />
          </div>

          {/* Logs and Alerts Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="fade-in" style={{ animationDelay: '0.5s' }}>
              <LogViewer />
            </div>
            <div className="fade-in" style={{ animationDelay: '0.6s' }}>
              <AlertList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

