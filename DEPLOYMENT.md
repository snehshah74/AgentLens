# 🚀 Free Deployment Guide

Complete step-by-step instructions for deploying the AI Observability Platform for free using Render.com, Railway.app, and Vercel.

## 📋 Prerequisites

- GitHub account
- Render.com account (free)
- Railway.app account (free)
- Vercel account (free)

## 🔧 Backend Deployment

### Option 1: Render.com (Recommended)

**Step 1: Prepare Repository**
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Step 2: Deploy on Render**
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ai-observability-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)
7. Note your backend URL: `https://ai-observability-backend.onrender.com`

**Render Configuration Files:**
```python
# Procfile (already created)
web: uvicorn app:app --host 0.0.0.0 --port $PORT

# runtime.txt (already created)
python-3.11.0
```

### Option 2: Railway.app

**Step 1: Deploy on Railway**
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Python and use the `railway.json` config
5. Wait for deployment (3-5 minutes)
6. Note your backend URL: `https://your-app.railway.app`

**Railway Configuration:**
```json
// railway.json (already created)
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🎨 Frontend Deployment (Vercel)

**Step 1: Deploy Frontend**
```bash
cd frontend

# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from frontend directory)
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: ai-observability-dashboard
# - Directory: ./
# - Override settings? N
```

**Step 2: Configure Environment Variables**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project: `ai-observability-dashboard`
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (or railway.app URL)
   - **Environment**: Production, Preview, Development

**Step 3: Redeploy**
```bash
# Trigger a new deployment with environment variables
vercel --prod
```

**Vercel Configuration:**
```json
// frontend/vercel.json (already created)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

## 🔗 Connect Frontend to Backend

### Update Frontend Environment Variables

**For Production:**
```bash
# In Vercel dashboard, set:
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com

# Or for Railway:
NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

**For Local Development:**
```bash
# Create frontend/.env.local
cd frontend
echo "NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com" > .env.local
```

## 🧪 Testing Deployment

### Test Backend
```bash
# Health check
curl https://your-backend-url.onrender.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": 1234567890.123,
  "agents_running": true
}
```

### Test Frontend
1. Visit your Vercel URL: `https://your-dashboard.vercel.app`
2. Check that backend status shows "Backend Online"
3. Try submitting a demo log
4. Verify alerts appear in real-time

## 🔄 Automatic Deployments

### GitHub Integration
Both platforms support automatic deployments:

**Render:**
- Push to main branch → Auto-deploy backend
- Manual deploys available in dashboard

**Railway:**
- Push to main branch → Auto-deploy backend
- Pull request previews available

**Vercel:**
- Push to main branch → Auto-deploy frontend
- Pull request previews available
- Branch deployments for testing

## 💰 Cost Breakdown (Free Tier)

### Render.com (Backend)
- **Free Tier**: 750 hours/month
- **Sleep Mode**: App sleeps after 15 minutes of inactivity
- **Wake Time**: ~30 seconds to wake from sleep
- **Perfect for**: Development and demos

### Railway.app (Backend Alternative)
- **Free Tier**: $5 credit/month
- **Always On**: No sleep mode
- **Better for**: Production use

### Vercel (Frontend)
- **Free Tier**: Unlimited deployments
- **Bandwidth**: 100GB/month
- **Perfect for**: Any frontend deployment

## 🚨 Important Notes

### Render.com Limitations
- Apps sleep after 15 minutes of inactivity
- Cold start takes ~30 seconds
- Free tier has 750 hours/month limit

### Railway.app Benefits
- No sleep mode on free tier
- Faster cold starts
- Better for production use

### Vercel Benefits
- Excellent performance
- Global CDN
- Automatic HTTPS

## 🔧 Troubleshooting

### Backend Issues

**Deployment Failed:**
```bash
# Check build logs in Render/Railway dashboard
# Common issues:
# - Missing requirements.txt
# - Wrong Python version
# - Import errors
```

**App Not Starting:**
```bash
# Check start command in Procfile
# Ensure PORT environment variable is used
# Verify uvicorn command syntax
```

### Frontend Issues

**Environment Variables Not Working:**
```bash
# Ensure variables start with NEXT_PUBLIC_
# Redeploy after adding variables
# Check Vercel dashboard for variable values
```

**API Connection Failed:**
```bash
# Verify backend URL is correct
# Check CORS settings in backend
# Ensure backend is not sleeping (Render)
```

### CORS Issues
If you encounter CORS errors, the backend already includes:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 Monitoring

### Backend Monitoring
- **Render**: Built-in metrics and logs
- **Railway**: Application logs and metrics
- **Health Check**: `/health` endpoint

### Frontend Monitoring
- **Vercel**: Built-in analytics
- **Real-time**: Backend connection status
- **Error Tracking**: Browser console logs

## 🎯 Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] Health check passing
- [ ] Demo log submission working
- [ ] Alerts appearing in real-time
- [ ] CORS working properly
- [ ] HTTPS enabled (automatic on all platforms)

## 🔄 Updates and Maintenance

### Updating Backend
```bash
# Make changes to code
git add .
git commit -m "Update backend"
git push origin main
# Auto-deploy will trigger
```

### Updating Frontend
```bash
cd frontend
# Make changes to code
git add .
git commit -m "Update frontend"
git push origin main
# Auto-deploy will trigger
```

Your AI Observability Platform is now deployed and ready to monitor agentic AI systems in production! 🎉

