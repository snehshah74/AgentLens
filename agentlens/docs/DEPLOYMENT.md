# 🚀 Deployment Guide

Complete guide to deploying your AI Observability Platform.

## 🎯 Quick Deploy (5 minutes)

### 1. Supabase Setup
```bash
# 1. Create account at https://supabase.com
# 2. Create new project
# 3. Copy project URL and API keys
# 4. Go to SQL Editor and run supabase-schema.sql
```

### 2. Get API Keys

**Supabase** (https://supabase.com/dashboard/project/_/settings/api):
- Copy `Project URL`
- Copy `anon public` key
- Copy `service_role` key (keep secret!)

**Groq** (https://console.groq.com/keys):
- Create new API key
- Copy the key (starts with `gsk_`)

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: observability-saas
# - Directory: ./
# - Override settings? No

# Add environment variables (one by one)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_KEY
vercel env add GROQ_API_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

### 4. Update Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:
```
Site URL: https://your-app.vercel.app
Redirect URLs:
  - https://your-app.vercel.app/auth/callback
  - http://localhost:3000/auth/callback (for local dev)
```

### 5. Done! 🎉
Visit your deployed app at `https://your-app.vercel.app`

---

## 🌐 Vercel Dashboard Deployment

### Step 1: Connect GitHub
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Vercel auto-detects Next.js configuration

### Step 2: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_KEY` | Your service key | Production only |
| `GROQ_API_KEY` | Your Groq key | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | https://your-app.vercel.app | Production |

### Step 3: Deploy
Click "Deploy" - Vercel handles the rest!

---

## 🐳 Docker Deployment (Optional)

### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Build & Run
```bash
docker build -t observability-saas .
docker run -p 3000:3000 --env-file .env.local observability-saas
```

---

## 🔧 Advanced Configuration

### Custom Domain (Vercel)
1. Go to Project Settings → Domains
2. Add your domain (e.g., observability.yourdomain.com)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` in environment variables
5. Update Supabase redirect URLs

### Edge Functions
Already using Next.js API routes on Vercel Edge Network!

### Database Backups
In Supabase Dashboard → Database → Backups:
- Enable daily backups
- Set retention period

### Monitoring
Vercel automatically provides:
- Analytics
- Real-time logs
- Performance insights

Access at: Project → Analytics / Logs

---

## 🚨 Pre-Deployment Checklist

- [ ] Database schema applied (`supabase-schema.sql`)
- [ ] Environment variables set in Vercel
- [ ] Supabase RLS policies enabled
- [ ] Supabase redirect URLs configured
- [ ] Groq API key valid and has quota
- [ ] Production build tested locally (`npm run build`)
- [ ] No console errors in browser
- [ ] Authentication flow tested
- [ ] API routes working

---

## 🔒 Security Checklist

- [ ] Service role key kept secret (never in client code)
- [ ] RLS policies enabled on all tables
- [ ] CORS configured in Supabase
- [ ] Environment variables in Vercel (not committed)
- [ ] OAuth providers configured properly
- [ ] Rate limiting enabled (Vercel Edge Config)

---

## 📊 Post-Deployment

### 1. Test Authentication
- Sign up with email/password
- Test OAuth (Google, GitHub)
- Verify email confirmation works

### 2. Test Core Features
- Create an agent
- Create a trace
- View dashboard (real-time updates)
- View trace viewer
- Test AI insights

### 3. Monitor Performance
- Check Vercel Analytics
- Monitor Supabase usage
- Check Groq API usage

---

## 🐛 Common Issues

### Build Fails
```bash
# Test locally first
npm run build

# Check for TypeScript errors
npm run lint

# Clear cache
rm -rf .next node_modules
npm install
```

### Environment Variables Not Working
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side
- Redeploy after adding variables
- Check spelling and formatting

### Supabase Connection Issues
- Verify project is active
- Check API keys are correct
- Ensure RLS policies allow access
- Check Supabase project region matches your users

### OAuth Not Working
- Update redirect URLs in Supabase
- Configure OAuth providers in Supabase
- Ensure `NEXT_PUBLIC_APP_URL` matches deployed URL

---

## 📈 Scaling

### Database
Supabase handles scaling automatically. For heavy usage:
- Upgrade Supabase plan
- Enable connection pooling
- Add database indexes (already optimized in schema)

### API Routes
Vercel scales automatically:
- Edge Functions run globally
- Auto-scales based on traffic
- No server management needed

### Frontend
- Already optimized with Next.js
- Static generation where possible
- Image optimization built-in

---

## 💰 Cost Estimates

### Free Tier (Perfect for MVP)
- **Vercel**: Free (hobby plan)
- **Supabase**: Free (500MB database, 2GB bandwidth)
- **Groq**: Free tier available

### Production (< $50/month)
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Groq**: Pay-as-you-go (very affordable)

---

## 🎉 Success!

Your AI Observability Platform is now live!

**Next Steps:**
1. Share with users
2. Monitor usage
3. Collect feedback
4. Iterate and improve

**Need Help?**
- Check documentation in `/docs`
- Review troubleshooting guides
- Open an issue on GitHub

---

**Deploy time: ~5 minutes**
**Downtime: 0 seconds (with Vercel)**
**Complexity: Minimal**

🚀 **Happy Deploying!**

