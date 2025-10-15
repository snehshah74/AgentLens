# AI Observability Dashboard

A modern, minimal observability dashboard built with Next.js for monitoring agentic AI systems. This dashboard provides real-time log viewing and security alert management with a clean, responsive interface.

## Features

- **Real-time Log Viewer**: View and filter logs with search functionality
- **Security Alert Management**: Monitor and acknowledge security alerts
- **Backend Integration**: Connects to FastAPI backend via REST API
- **Demo Mode**: Shows sample data when backend is unavailable
- **Responsive Design**: Clean, modern UI built with Tailwind CSS
- **Auto-refresh**: Automatic data updates every 5-10 seconds

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Backend Integration**: REST API with fetch
- **Icons**: Heroicons (SVG)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Python FastAPI backend (optional - demo mode available)

### Installation

1. Navigate to the dashboard directory:
```bash
cd observability-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Integration

The dashboard automatically detects if the FastAPI backend is running on `http://localhost:8000`. If the backend is available, it will:

- Display real-time logs and alerts
- Show accurate statistics
- Enable full functionality

If the backend is not available, the dashboard will:

- Show demo data for logs and alerts
- Display a "Demo Mode" notification
- Still provide full UI functionality

## Project Structure

```
observability-dashboard/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles with Tailwind
│   │   ├── layout.tsx           # App layout
│   │   └── page.tsx             # Main dashboard page
│   └── components/
│       ├── LogViewer.js         # Log viewing component
│       └── AlertList.js         # Alert management component
├── public/                      # Static assets
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Components

### LogViewer Component
- Displays logs in a responsive table format
- Supports filtering by level (ERROR, WARNING, INFO, DEBUG)
- Includes search functionality
- Auto-refreshes every 5 seconds
- Shows metadata in expandable details

### AlertList Component
- Lists security alerts with severity indicators
- Supports filtering by severity and status
- Allows alert acknowledgment
- Auto-refreshes every 10 seconds
- Shows alert metadata and timestamps

### Main Dashboard
- Overview statistics (Total Logs, Total Alerts, Critical Alerts)
- Backend status indicator
- Responsive grid layout
- Demo mode notifications

## API Integration

The dashboard integrates with the FastAPI backend through these endpoints:

- `GET /health` - Backend health check
- `GET /api/logs` - Fetch logs with filtering
- `GET /api/logs/stats` - Log statistics
- `GET /api/alerts` - Fetch alerts with filtering
- `GET /api/alerts/stats` - Alert statistics
- `POST /api/alerts/{id}/acknowledge` - Acknowledge alerts

## Styling

The dashboard uses Tailwind CSS with custom components:

- **Dashboard Cards**: Consistent card styling with hover effects
- **Status Indicators**: Animated status dots
- **Responsive Tables**: Mobile-friendly table layouts
- **Custom Scrollbars**: Styled scrollbars for better UX
- **Loading States**: Spinner animations for loading states

## Demo Data

When the backend is unavailable, the dashboard shows realistic demo data:

### Demo Logs
- User authentication events
- Rate limiting warnings
- Database connection errors
- API request logs
- System monitoring alerts

### Demo Alerts
- Prompt injection attempts (Critical)
- PII leakage detection (High)
- Authentication failures (Warning)
- System overload alerts (Error)
- Suspicious pattern detection (Warning)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Customization

The dashboard is easily customizable:

1. **Colors**: Modify Tailwind color classes in components
2. **Layout**: Adjust grid layouts in `page.tsx`
3. **Components**: Extend or modify existing components
4. **API**: Update fetch URLs to point to different backends

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.