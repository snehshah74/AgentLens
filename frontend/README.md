# Frontend - AI Observability Dashboard

## Overview
Modern Next.js 15 dashboard for real-time monitoring and management of AI observability data.

## Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Features

### Dashboard Pages
- **Home** (`/`) - Landing page with platform overview
- **Dashboard** (`/dashboard`) - Main monitoring interface
- **Services** (`/services`) - Service management
- **Analytics** (`/analytics`) - Data analytics and insights
- **Alerts** (`/alerts`) - Alert management

### Key Components
- **LogSubmission** - Manual log submission form
- **LogViewer** - Real-time log display
- **AlertList** - Alert management interface
- **Navigation** - Responsive navigation bar
- **ThemeContext** - Dark/light theme support

## Technology Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Turbopack** - Fast bundling

## Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure
```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx        # Home page
│   │   ├── dashboard/      # Dashboard pages
│   │   ├── analytics/      # Analytics pages
│   │   └── services/       # Services pages
│   ├── components/         # Reusable components
│   │   ├── Navigation.js   # Navigation bar
│   │   ├── LogSubmission.js # Log form
│   │   ├── LogViewer.js    # Log display
│   │   └── AlertList.js    # Alert management
│   └── contexts/           # React contexts
│       └── ThemeContext.js # Theme management
├── public/                 # Static assets
├── package.json           # Dependencies
└── next.config.ts         # Next.js configuration
```

## API Integration

The frontend communicates with the backend API:
- **Base URL**: `http://localhost:8000`
- **Endpoints**: All backend API endpoints
- **CORS**: Configured for cross-origin requests

### Example API Calls
```javascript
// Submit log
const response = await fetch('http://localhost:8000/api/submit-log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'User login',
    level: 'INFO',
    source: 'auth-service'
  })
});

// Get logs
const logs = await fetch('http://localhost:8000/api/logs');
```

## Styling

### Design System
- **Dark Theme** - Primary theme with dark backgrounds
- **Green Accents** - Primary color for highlights
- **Responsive** - Mobile-first design
- **Modern UI** - Clean, professional interface

### Tailwind Classes
- `dashboard-card` - Card components
- `btn-primary` - Primary buttons
- `btn-secondary` - Secondary buttons
- `form-input` - Form inputs
- `alert-badge` - Alert status badges

## Deployment

The frontend is ready for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Docker containers**

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
```

## Performance

- **Turbopack** - Fast development builds
- **Image Optimization** - Next.js automatic optimization
- **Code Splitting** - Automatic route-based splitting
- **Static Generation** - Pre-rendered pages where possible