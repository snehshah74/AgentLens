# 🔍 AgentLens - AI Observability Platform

> **Production-ready observability for AI agents and LLM applications**

Monitor, analyze, and optimize your AI agents with real-time distributed tracing, AI-powered insights, and beautiful visualizations.

---

## 🚀 Quick Start

```bash
cd agentlens/frontend
npm install
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 📁 Project Structure

```
agentlens/
├── frontend/              # Next.js 15 Application
│   ├── app/              # Pages & API routes
│   ├── components/       # React components
│   ├── lib/              # Services (AI, Supabase, utils)
│   └── types/            # TypeScript types
│
├── backend/              # Business Logic Layer
│   ├── api/             # API controllers (TracesAPI, AgentsAPI, AIAPI)
│   └── services/        # Core services (AI, Database, Utils)
│
└── docs/                # Documentation
    ├── COMPLETE_SETUP.md
    └── DEPLOYMENT.md
```

---

## ⚙️ Configuration

Create `agentlens/frontend/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Groq AI
GROQ_API_KEY=gsk_your-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🌟 Features

- 📊 **Real-time Dashboard** - Live metrics, charts, and activity feeds
- 🔍 **Distributed Tracing** - Waterfall timeline visualization
- 🤖 **AI-Powered Insights** - Anomaly detection, optimization suggestions, quality scoring
- 🔐 **Secure Authentication** - Email/password + OAuth (Google, GitHub)
- 📱 **Fully Responsive** - Works on mobile, tablet, and desktop
- ⚡ **Fast & Scalable** - Built on Next.js 15, Supabase, and Groq

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, Shadcn/ui
- **Backend**: Next.js API Routes, Business Logic Layer
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI**: Groq (Llama 3.1)
- **Deployment**: Vercel (recommended)

---

## 📚 Documentation

- [Complete Setup Guide](agentlens/docs/COMPLETE_SETUP.md) - Detailed setup instructions
- [Deployment Guide](agentlens/docs/DEPLOYMENT.md) - Deploy to production
- [Frontend README](agentlens/frontend/README.md) - Frontend-specific docs
- [Backend README](agentlens/backend/README.md) - Backend architecture

---

## 🐛 Troubleshooting

### Port already in use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Module not found
```bash
rm -rf node_modules .next package-lock.json
npm install
```

### Node.js v24 networking issue
```bash
NODE_OPTIONS="--dns-result-order=ipv4first" npm run dev -- --hostname 0.0.0.0 --port 3000
```

---

## 🎯 Use Cases

- **AI Agent Developers** - Monitor and debug AI agents in production
- **LLM Applications** - Track token usage, costs, and performance
- **Research Teams** - Analyze agent behavior patterns
- **Production Systems** - Ensure reliability and optimize costs

---

## 📈 Roadmap

- [ ] Advanced alerting (email, Slack, webhooks)
- [ ] Team collaboration features
- [ ] LangChain & AutoGPT integrations
- [ ] Multi-tenancy support
- [ ] Custom dashboards
- [ ] A/B testing for prompts

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📄 License

MIT License

---

## 🙋 Support

- **Documentation**: Check the `agentlens/docs/` folder
- **Issues**: Open a GitHub issue
- **Questions**: Start a discussion

---

**Made with ❤️ for the AI community**

🚀 **Get Started**: `cd agentlens/frontend && npm install && npm run dev`
