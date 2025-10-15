'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ServicesPage = () => {
  const { theme } = useTheme();
  const [services, setServices] = useState([
    {
      id: 'app-backend',
      name: 'app-backend',
      type: 'Web Service',
      status: 'Available',
      region: 'Oregon',
      url: 'https://app-backend.onrender.com',
      lastDeploy: '2 minutes ago',
      cpu: 45,
      memory: 62,
      instances: 2,
      requests: 1247
    },
    {
      id: 'app-frontend',
      name: 'app-frontend',
      type: 'Static Site',
      status: 'Available',
      region: 'Oregon',
      url: 'https://app-frontend.onrender.com',
      lastDeploy: '5 minutes ago',
      bandwidth: 2.4,
      requests: 892
    },
    {
      id: 'app-database',
      name: 'app-database',
      type: 'PostgreSQL',
      status: 'Available',
      region: 'Oregon',
      url: 'postgres://app-database.onrender.com',
      lastDeploy: '1 hour ago',
      storage: 45,
      connections: 12
    },
    {
      id: 'ai-monitoring',
      name: 'ai-monitoring',
      type: 'Background Worker',
      status: 'Available',
      region: 'Oregon',
      lastDeploy: '30 minutes ago',
      cpu: 23,
      memory: 34,
      instances: 1
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'building': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'failed': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Web Service': return '🌐';
      case 'Static Site': return '📄';
      case 'PostgreSQL': return '🐘';
      case 'Background Worker': return '⚙️';
      default: return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-black pt-16">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold text-white">Services</h1>
              <p className="mt-2 text-sm text-gray-400">
                Manage and monitor your AI observability services
              </p>
            </div>
            <button className="btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Service
            </button>
          </div>
        </div>
      </header>

      {/* Services Grid */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="service-card fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getTypeIcon(service.type)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                      <p className="text-sm text-gray-400">{service.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                      ✓ {service.status}
                    </span>
                    <div className="text-xs text-gray-400">
                      Deployed {service.lastDeploy}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {service.cpu !== undefined && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">CPU</div>
                      <div className="text-sm text-white">{service.cpu}%</div>
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-green-400 h-1 rounded-full" 
                          style={{ width: `${service.cpu}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {service.memory !== undefined && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">MEMORY</div>
                      <div className="text-sm text-white">{service.memory}%</div>
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-400 h-1 rounded-full" 
                          style={{ width: `${service.memory}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {service.instances !== undefined && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">INSTANCES</div>
                      <div className="text-sm text-white">{service.instances}</div>
                    </div>
                  )}
                  
                  {service.requests !== undefined && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">REQUESTS</div>
                      <div className="text-sm text-white">{service.requests.toLocaleString()}</div>
                    </div>
                  )}
                  
                  {service.bandwidth !== undefined && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">BANDWIDTH</div>
                      <div className="text-sm text-white">{service.bandwidth} GB</div>
                    </div>
                  )}
                  
                  {service.storage !== undefined && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">STORAGE</div>
                      <div className="text-sm text-white">{service.storage} GB</div>
                    </div>
                  )}
                  
                  {service.connections !== undefined && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">CONNECTIONS</div>
                      <div className="text-sm text-white">{service.connections}</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{service.region}</span>
                    {service.url && (
                      <a 
                        href={service.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 transition-colors"
                      >
                        View Live Site
                      </a>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                      View Logs
                    </button>
                    <button className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServicesPage;

