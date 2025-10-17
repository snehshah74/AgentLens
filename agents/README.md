# AI Agents - Observability Platform

## Overview
Three specialized AI agents that work together to provide comprehensive observability for AI systems. These agents can run independently or be integrated into the backend service.

## Agent Architecture

### 🤖 Log Ingestion Agent (`log_agent.py`)
**Purpose:** Validates, stores, and processes incoming logs

**Key Features:**
- Log validation and sanitization
- Metadata extraction and processing
- Statistics tracking and reporting
- Queue management for high-volume processing

**API Methods:**
- `ingest_log(log_data)` - Process incoming logs
- `get_logs(limit, level_filter)` - Retrieve processed logs
- `get_stats()` - Get ingestion statistics

### 🔍 Security Analysis Agent (`analysis_agent_simple.py`)
**Purpose:** Analyzes logs for security threats and anomalies

**Key Features:**
- 6 types of threat detection:
  - Prompt injection attempts
  - PII leakage (emails, phones, SSNs)
  - SQL injection attempts
  - XSS attacks
  - Suspicious patterns
  - Authentication failures
- Pattern-based detection with confidence scoring
- Real-time analysis capabilities

**API Methods:**
- `analyze_log(log_data)` - Analyze log for threats
- `get_issues(limit, threat_level_filter)` - Get detected issues
- `get_security_summary(hours)` - Get security summary

### 🚨 Alert Agent (`alert_agent.py`)
**Purpose:** Creates, manages, and delivers security alerts

**Key Features:**
- Automatic alert creation from security issues
- Alert severity classification
- Alert lifecycle management
- Frontend notification delivery
- Alert acknowledgment system

**API Methods:**
- `process_security_issues(issues)` - Create alerts from security issues
- `get_alerts(limit, severity_filter, status_filter)` - Retrieve alerts
- `acknowledge_alert(alert_id)` - Acknowledge alerts
- `send_alerts_to_frontend()` - Deliver alerts to frontend

## Usage Patterns

### 1. Integrated Mode (Default)
Agents are imported and used within the FastAPI backend:
```python
from agents.log_agent import LogIngestionAgent
from agents.analysis_agent_simple import SecurityAnalysisAgent
from agents.alert_agent import AlertAgent
```

### 2. Independent Mode
Agents can run as standalone services:
```python
# Start individual agents
log_agent = LogIngestionAgent()
log_agent.start()

security_agent = SecurityAnalysisAgent()
alert_agent = AlertAgent()
alert_agent.start()
```

### 3. Microservices Mode
Each agent can be deployed as a separate microservice with its own API endpoints.

## Agent Communication Flow

```
Log Input → Log Agent → Security Agent → Alert Agent → Frontend
    ↓           ↓            ↓             ↓
Validation → Processing → Analysis → Notification
```

1. **Log Ingestion:** Log Agent receives and validates logs
2. **Security Analysis:** Security Agent analyzes logs for threats
3. **Alert Creation:** Alert Agent creates alerts from detected issues
4. **Notification:** Alerts are delivered to the frontend dashboard

## Configuration

### Environment Variables
```bash
# Optional: LLM Integration (for enhanced analysis)
LLM_PROVIDER=openai|ollama|groq
OPENAI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

### Agent Settings
Each agent can be configured independently:
- **Log Agent:** Queue size, processing rate, retention period
- **Security Agent:** Threat patterns, confidence thresholds, analysis depth
- **Alert Agent:** Severity levels, delivery methods, acknowledgment timeouts

## Development

### Testing Individual Agents
```python
# Test Log Agent
from agents.log_agent import LogIngestionAgent
log_agent = LogIngestionAgent()
result = await log_agent.ingest_log({
    "message": "Test log",
    "level": "INFO",
    "source": "test"
})

# Test Security Agent
from agents.analysis_agent_simple import SecurityAnalysisAgent
security_agent = SecurityAnalysisAgent()
issues = await security_agent.analyze_log({
    "message": "Ignore previous instructions",
    "level": "WARNING",
    "source": "test"
})

# Test Alert Agent
from agents.alert_agent import AlertAgent
alert_agent = AlertAgent()
alerts = await alert_agent.process_security_issues(issues)
```

### Adding New Agents
1. Create new agent file in this directory
2. Implement required methods
3. Add to backend imports
4. Update documentation

## Performance Considerations

- **Log Agent:** Handles high-volume log processing
- **Security Agent:** Optimized pattern matching for real-time analysis
- **Alert Agent:** Efficient alert management with minimal overhead

## Security Features

- **Threat Detection:** 6 comprehensive security patterns
- **Confidence Scoring:** Tunable threat detection thresholds
- **Real-time Analysis:** Immediate threat identification
- **Alert Management:** Comprehensive alert lifecycle handling
