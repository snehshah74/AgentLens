# 🔍 AgentLens - AI Observability Platform

> **Monitor, analyze, and optimize your AI agents in real-time**

AgentLens is a production-ready observability platform for AI agents and LLM applications. Track traces, analyze performance, detect anomalies, and get AI-powered optimization suggestions.

---

## 🌟 Features

- **📊 Real-time Dashboard** - Live metrics, charts, and activity feeds
- **🔍 Distributed Tracing** - Waterfall visualizations of agent executions
- **🤖 AI-Powered Insights** - Automatic anomaly detection and optimization suggestions
- **🔐 Secure Authentication** - Email/password + OAuth (Google, GitHub)
- **🎨 Beautiful UI** - Modern glassmorphism design with smooth animations
- **📱 Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- **⚡ Fast & Scalable** - Built on Next.js 15, Supabase, and Groq

---

## 🏗️ Architecture

```
agentlens/
├── frontend/              # Next.js 15 App (UI)
│   ├── app/              # Pages and routes
│   │   ├── (auth)/       # Authentication pages
│   │   ├── dashboard/    # Protected dashboard pages
│   │   └── api/          # API route handlers (thin wrappers)
│   ├── components/       # React components
│   ├── lib/              # Client-side utilities
│   └── public/           # Static assets
│
├── backend/              # Business Logic (API Layer)
│   ├── api/             # API controllers
│   │   ├── traces.ts    # Traces business logic
│   │   ├── agents.ts    # Agents business logic
│   │   └── ai.ts        # AI operations
│   └── services/        # Core services
│       ├── ai.ts        # AI/ML functions (Groq)
│       ├── supabase.ts  # Database client
│       └── utils.ts     # Shared utilities
│
├── shared/              # Shared Types & Constants
│   └── index.ts        # TypeScript types
│
└── docs/               # Documentation
    ├── COMPLETE_SETUP.md
    ├── START_HERE.md
    └── supabase-schema.sql
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account (free tier works)
- Groq API key (free tier works)

### 1. Clone & Install

```bash
cd agentlens/frontend
npm install
```

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the SQL schema from `docs/supabase-schema.sql` in SQL Editor
3. Copy your API keys from Settings → API

### 3. Get Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign in and create an API key

### 4. Configure Environment

Create `frontend/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Groq AI
GROQ_API_KEY=gsk_your-groq-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the App

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [START_HERE.md](docs/START_HERE.md) | Complete setup guide |
| [COMPLETE_SETUP.md](docs/COMPLETE_SETUP.md) | Detailed configuration |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy to production |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI**: Shadcn/ui + Framer Motion
- **Charts**: Recharts
- **Auth**: Supabase Auth

### Backend
- **Database**: Supabase (PostgreSQL + pgvector)
- **Auth**: Supabase Auth with RLS
- **AI/ML**: Groq (Llama 3.1)
- **Real-time**: Supabase Realtime

### DevOps
- **Hosting**: Vercel (recommended)
- **CI/CD**: GitHub Actions (optional)
- **Monitoring**: Built-in observability

---

## 📊 Key Features Explained

### 1. Distributed Tracing
- Capture complete execution flows of your AI agents
- Visualize spans in a waterfall timeline
- Track LLM calls, tool executions, and more

### 2. AI-Powered Analysis
- **Anomaly Detection**: Statistical analysis to detect unusual patterns
- **Optimization Suggestions**: AI-generated tips to improve performance
- **Quality Scoring**: Automated quality assessment (A+ to F grades)
- **Natural Language Queries**: Ask questions about your traces

### 3. Real-time Dashboard
- Live metrics that update every 30 seconds
- Total traces, active agents, average latency, cost tracking
- Interactive charts and trends
- Toast notifications for important events

### 4. Agent Management
- Create and manage multiple AI agents
- Track per-agent statistics
- Monitor agent health and status
- Search and filter agents

---

## 🔌 API Integration

### Create a Trace

```typescript
const response = await fetch('/api/traces', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agent_id: 'agent-uuid',
    span_data: {
      spans: [
        {
          name: 'LLM Call',
          type: 'llm',
          duration: 1200,
          input: { prompt: '...' },
          output: { response: '...' }
        }
      ]
    },
    duration: 1200,
    tokens_used: 450,
    cost: 0.0067,
    status: 'success'
  })
})
```

### Get AI Insights

```typescript
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'summary',
    traceId: 'trace-uuid'
  })
})
```

---

## 🎯 Use Cases

- **AI Agent Developers**: Monitor and debug your AI agents
- **LLM Applications**: Track token usage and costs
- **Research Teams**: Analyze agent behavior and performance
- **Production Monitoring**: Ensure reliability and performance
- **Cost Optimization**: Identify expensive operations

---

## 📈 Roadmap

- [ ] Advanced alerting and notifications
- [ ] Custom dashboards and reports
- [ ] Team collaboration features
- [ ] Integrations with popular AI frameworks (LangChain, AutoGPT)
- [ ] Multi-tenancy support
- [ ] Advanced analytics and insights

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - feel free to use this in your projects!

---

## 🙋 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: Open a GitHub issue
- **Discussions**: Join our community discussions

---

## 🌟 Credits

Built with:
- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend platform
- [Groq](https://groq.com) - Fast AI inference
- [Shadcn/ui](https://ui.shadcn.com) - UI components
- [TailwindCSS](https://tailwindcss.com) - Styling

---

**Made with ❤️ for the AI community**

🚀 [Get Started](docs/START_HERE.md) | 📖 [Docs](docs/) | 🐛 [Report Bug](https://github.com/yourusername/agentlens/issues)

