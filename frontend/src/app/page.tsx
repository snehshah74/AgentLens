'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';

const HomePage = () => {
  const { theme } = useTheme();

  const techStack = [
    { name: 'Python', icon: '🐍' },
    { name: 'FastAPI', icon: '⚡' },
    { name: 'Next.js', icon: '▲' },
    { name: 'PostgreSQL', icon: '🐘' },
    { name: 'Redis', icon: '🔴' },
    { name: 'Docker', icon: '🐳' },
    { name: 'Kubernetes', icon: '☸️' },
    { name: 'AI/ML', icon: '🤖' },
    { name: 'Grafana', icon: '📊' },
    { name: 'Prometheus', icon: '📈' },
    { name: 'Elasticsearch', icon: '🔍' },
    { name: 'AWS', icon: '☁️' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Whatever your AI stack, it runs on{' '}
                  <span className="text-green-400">AI Observability</span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Monitor, analyze, and secure your agentic AI systems with real-time observability. 
                  Get insights into performance, security threats, and system health.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="btn-primary inline-flex items-center justify-center">
                  Get started for free
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/contact" className="btn-secondary inline-flex items-center justify-center">
                  Contact sales
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Column - Tech Stack Grid */}
            <div className="relative">
              <div className="grid grid-cols-3 gap-4">
                {techStack.map((tech, index) => (
                  <div
                    key={tech.name}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center hover:border-green-400 transition-all duration-300 hover:scale-105"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div className="text-3xl mb-2">{tech.icon}</div>
                    <div className="text-white text-sm font-medium">{tech.name}</div>
                  </div>
                ))}
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - AUTOSCALING */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                  AUTOSCALING
                </div>
                <h2 className="text-4xl font-bold text-white">
                  Handle 100× burst traffic without manual tuning
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Scale AI workloads and background jobs automatically as user demand changes. 
                  Our platform handles orchestration and scales services horizontally and vertically—no cluster management required.
                </p>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-medium">Autoscaling</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm">Enabled</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Instances</span>
                    <span className="text-white">2-10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">CPU Threshold</span>
                    <span className="text-white">70%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Memory Threshold</span>
                    <span className="text-white">80%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - PLATFORM CONFIGURATION */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                  PLATFORM CONFIGURATION
                </div>
                <h2 className="text-4xl font-bold text-white">
                  Customize infrastructure with precision and control
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Define secrets, environment variables, and security policies through the dashboard or infrastructure as code. 
                  Use our Blueprints or Terraform to roll out changes safely.
                </p>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="mb-4">
                  <span className="text-white font-medium">observability.tf</span>
                </div>
                <div className="space-y-2 text-sm font-mono">
                  <div className="text-green-400">
                    resource <span className="text-white">"ai_service"</span> <span className="text-yellow-400">"monitoring"</span>
                  </div>
                  <div className="text-white ml-4">name = <span className="text-green-400">"ai-observability"</span></div>
                  <div className="text-white ml-4">region = <span className="text-green-400">"us-east-1"</span></div>
                  <div className="text-white ml-4">autoscaling = <span className="text-blue-400">true</span></div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white text-sm">ai-observability</span>
                    <span className="text-green-400 text-sm">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-green-400">99.9%</div>
              <div className="text-white font-medium">Uptime</div>
              <div className="text-gray-400">Guaranteed availability for your AI services</div>
            </div>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-green-400">100ms</div>
              <div className="text-white font-medium">Response Time</div>
              <div className="text-gray-400">Average latency for threat detection</div>
            </div>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-green-400">24/7</div>
              <div className="text-white font-medium">Monitoring</div>
              <div className="text-gray-400">Continuous security analysis and alerting</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-white">
            Ready to secure your AI infrastructure?
          </h2>
          <p className="text-xl text-green-100">
            Join thousands of developers who trust AI Observability for their production workloads.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="bg-white text-green-600 hover:bg-gray-100 font-medium px-8 py-3 rounded-lg transition-colors duration-200 inline-flex items-center justify-center">
              Start monitoring now
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/demo" className="border border-white text-white hover:bg-white hover:text-green-600 font-medium px-8 py-3 rounded-lg transition-colors duration-200 inline-flex items-center justify-center">
              Watch demo
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;