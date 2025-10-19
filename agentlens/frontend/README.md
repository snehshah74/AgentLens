# 🚀 AgentLens Frontend

## ✅ Server is Running!

The development server is now running at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.4.88:3000

---

## 🎯 Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## ⚙️ Configuration

Create `.env.local` file in this directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Groq AI Configuration
GROQ_API_KEY=gsk_your-groq-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📁 Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login & signup pages
│   ├── dashboard/
│   │   ├── agents/         # Agents management
│   │   ├── traces/         # Trace viewer
│   │   ├── settings/       # Settings page
│   │   ├── layout.tsx      # Dashboard layout
│   │   └── page.tsx        # Dashboard home
│   ├── api/
│   │   ├── agents/         # Agents API
│   │   ├── traces/         # Traces API
│   │   └── ai/             # AI operations
│   ├── auth/
│   │   └── callback/       # OAuth callback
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
│
├── components/
│   ├── dashboard.tsx       # Dashboard component
│   ├── trace-viewer.tsx    # Trace visualization
│   ├── trace-viewer-enhanced.tsx  # AI insights
│   └── ui/                 # Shadcn UI components
│
├── lib/
│   ├── ai.ts               # AI/ML functions (Groq)
│   ├── supabase.ts         # Database client
│   └── utils.ts            # Utilities
│
├── types/
│   └── index.ts            # TypeScript types
│
├── public/                 # Static assets
└── package.json            # Dependencies
```

---

## 🎨 Features

- ✅ **Authentication** - Email/password + OAuth ready
- ✅ **Real-time Dashboard** - Live metrics and charts
- ✅ **Distributed Tracing** - Waterfall visualization
- ✅ **AI Insights** - Powered by Groq (Llama 3.1)
- ✅ **Agent Management** - Create and monitor agents
- ✅ **Responsive Design** - Mobile, tablet, desktop
- ✅ **Type-Safe** - Full TypeScript support

---

## 🔌 API Endpoints

### Traces
- `GET /api/traces` - List traces
- `POST /api/traces` - Create trace
- `PUT /api/traces?id=xxx` - Update trace
- `DELETE /api/traces?id=xxx` - Delete trace

### Agents
- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `PUT /api/agents?id=xxx` - Update agent
- `DELETE /api/agents?id=xxx` - Delete agent

### AI Operations
- `POST /api/ai` - AI operations
  - Actions: `summary`, `anomalies`, `optimizations`, `quality`, `chat`
- `GET /api/ai` - Health check

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq (Llama 3.1)
- **Charts**: Recharts
- **Animations**: Framer Motion

---

## 📝 Development

### Adding a New Page

1. Create file in `app/` directory
2. Use server or client components
3. Add to navigation if needed

### Adding a New API Route

1. Create `route.ts` in `app/api/[name]/`
2. Export GET, POST, PUT, DELETE functions
3. Use `createClientServer()` for auth

### Adding a New Component

1. Create in `components/`
2. Use TypeScript for props
3. Import and use in pages

---

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Module not found
```bash
rm -rf node_modules .next package-lock.json
npm install
```

### TypeScript errors
```bash
npm run typecheck
```

### Supabase connection failed
- Check `.env.local` has correct keys
- Verify Supabase project is active
- Run the SQL schema from `../docs/supabase-schema.sql`

---

## 📚 Documentation

- [Quick Start](../QUICK_START.md)
- [Complete Setup](../SETUP.md)
- [Project README](../README.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)

---

## ✅ Everything is Working!

Your AgentLens frontend is now running successfully. Just add your `.env.local` file with Supabase and Groq credentials, and you're ready to go!

**Happy coding!** 🚀

