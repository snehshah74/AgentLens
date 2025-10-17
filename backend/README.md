# Backend - AI Observability Platform

## Overview
FastAPI-based backend with three specialized AI agents for log ingestion, security analysis, and alert management.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python app.py
```

The backend will start on `http://localhost:8000`

## API Endpoints

### Health & Status
- `GET /health` - Health check
- `GET /api/agents/status` - Agent status

### Log Management
- `POST /api/submit-log` - Submit log for full pipeline processing
- `GET /api/logs` - Retrieve logs
- `GET /api/logs/stats` - Log statistics

### Security Analysis
- `POST /api/security/analyze` - Analyze log for threats
- `GET /api/security/issues` - Get detected issues
- `GET /api/security/summary` - Security summary

### Alert Management
- `GET /api/alerts` - Get alerts
- `POST /api/alerts/{id}/acknowledge` - Acknowledge alert
- `GET /api/alerts/stats` - Alert statistics

## Architecture

### Three Specialized Agents

The agents are located in the root `agents/` directory and can be shared or run independently:

1. **Log Ingestion Agent** (`../agents/log_agent.py`)
   - Validates and stores logs
   - Processes log metadata
   - Manages log statistics

2. **Security Analysis Agent** (`../agents/analysis_agent_simple.py`)
   - Detects 6 types of security threats
   - Pattern-based threat detection
   - Confidence scoring

3. **Alert Agent** (`../agents/alert_agent.py`)
   - Creates and manages alerts
   - Handles alert delivery
   - Manages alert lifecycle

## Security Threat Detection

The platform detects:
- **Prompt Injection** - Malicious AI manipulation attempts
- **PII Leakage** - Personal information exposure
- **SQL Injection** - Database attack attempts
- **XSS Attempts** - Cross-site scripting attacks
- **Suspicious Patterns** - General security threats
- **Authentication Failures** - Login security issues

## Development

### Dependencies
- FastAPI - Web framework
- Uvicorn - ASGI server
- Pydantic - Data validation
- Structlog - Structured logging

### Testing
```bash
# Test API endpoints
curl http://localhost:8000/health

# Test log submission
curl -X POST http://localhost:8000/api/submit-log \
  -H "Content-Type: application/json" \
  -d '{"message": "Test log", "level": "INFO", "source": "test"}'
```

## Deployment

The backend is ready for deployment on:
- Railway
- Render
- Heroku
- Docker containers
- Any Python hosting platform