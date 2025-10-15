# 🎯 How Your AI Observability System Works

## **Simple Overview**

```
YOUR APP → sends logs → BACKEND (3 Agents) → analyzes → RESULTS
```

---

## 📊 **The Complete Picture**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                                  │
│  (Web App, API, Microservice, AI System, etc.)                      │
│                                                                      │
│  When something happens:                                             │
│  - User logs in                                                      │
│  - Payment processed                                                 │
│  - AI prompt submitted                                               │
│  - Error occurs                                                      │
│  - Security event                                                    │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
                  │ Send data via:
                  │ • HTTP POST to /api/submit-log
                  │ • Python SDK
                  │ • Batch import
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              OBSERVABILITY PLATFORM BACKEND                          │
│                  (Port 8000 - Always Listening)                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Step 1: API Receives Request (app.py)                       │  │
│  │                                                               │  │
│  │  POST /api/submit-log                                        │  │
│  │  {                                                            │  │
│  │    "message": "User login failed",                           │  │
│  │    "level": "WARNING",                                       │  │
│  │    "source": "auth-service"                                  │  │
│  │  }                                                            │  │
│  └──────────────────┬───────────────────────────────────────────┘  │
│                     │                                               │
│  ┌──────────────────▼───────────────────────────────────────────┐  │
│  │  Step 2: Log Ingestion Agent                                 │  │
│  │                                                               │  │
│  │  ✅ Validates data                                            │  │
│  │  ✅ Adds timestamp                                            │  │
│  │  ✅ Stores in queue                                           │  │
│  │  ✅ Stores in memory (or database)                            │  │
│  │  ✅ Returns log_id: 42                                        │  │
│  └──────────────────┬───────────────────────────────────────────┘  │
│                     │                                               │
│  ┌──────────────────▼───────────────────────────────────────────┐  │
│  │  Step 3: Security Analysis Agent                             │  │
│  │                                                               │  │
│  │  Rule-Based:                                                  │  │
│  │  🔍 Check 14 prompt injection patterns                       │  │
│  │  🔍 Check 8 PII patterns (email, SSN, etc.)                  │  │
│  │  🔍 Check 9 SQL injection patterns                           │  │
│  │  🔍 Check 10 XSS patterns                                    │  │
│  │  🔍 Check 22 suspicious keywords                             │  │
│  │                                                               │  │
│  │  LLM-Based (if enabled):                                      │  │
│  │  🤖 Send to AI (OpenAI/Ollama/Groq)                          │  │
│  │  🤖 Get contextual analysis                                   │  │
│  │  🤖 Natural language explanation                              │  │
│  │                                                               │  │
│  │  Result: Found 2 security issues!                            │  │
│  │  - Prompt injection (CRITICAL)                               │  │
│  │  - Suspicious keyword "admin" (MEDIUM)                       │  │
│  └──────────────────┬───────────────────────────────────────────┘  │
│                     │                                               │
│  ┌──────────────────▼───────────────────────────────────────────┐  │
│  │  Step 4: Alert Agent                                         │  │
│  │                                                               │  │
│  │  For each security issue:                                     │  │
│  │  📢 Create alert                                              │  │
│  │  📢 Assign severity (critical/high/medium/low)               │  │
│  │  📢 Add suggested actions                                     │  │
│  │  📢 Queue for delivery                                        │  │
│  │                                                               │  │
│  │  Created alerts:                                              │  │
│  │  - alert_1_123 (CRITICAL)                                    │  │
│  │  - alert_2_124 (MEDIUM)                                      │  │
│  └──────────────────┬───────────────────────────────────────────┘  │
│                     │                                               │
│  ┌──────────────────▼───────────────────────────────────────────┐  │
│  │  Step 5: Return Response                                     │  │
│  │                                                               │  │
│  │  {                                                            │  │
│  │    "status": "success",                                      │  │
│  │    "log_id": 42,                                             │  │
│  │    "security_analysis": {                                    │  │
│  │      "issues_detected": 2,                                   │  │
│  │      "issues": [...]                                         │  │
│  │    },                                                         │  │
│  │    "alerts_created": 2,                                      │  │
│  │    "alert_ids": ["alert_1_123", "alert_2_124"]              │  │
│  │  }                                                            │  │
│  └──────────────────┬───────────────────────────────────────────┘  │
└──────────────────────┼──────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  YOUR APPLICATION (Receives Response)                │
│                                                                      │
│  Now you can:                                                        │
│  ✅ See if threats were detected                                     │
│  ✅ Read the analysis                                                │
│  ✅ Get alert IDs                                                    │
│  ✅ Take action based on results                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **How Agents Receive Information From YOU**

### **Method 1: HTTP API** (Most Common) ⭐

```python
import requests

# Your app sends data to agents
response = requests.post(
    'http://localhost:8000/api/submit-log',
    json={
        'message': 'User logged in',
        'level': 'INFO',
        'source': 'my-app',
        'metadata': {'user_id': 123}
    }
)

# Agents process and return results
result = response.json()
print(f"Log ID: {result['log_id']}")
print(f"Threats found: {result['security_analysis']['issues_detected']}")
```

**Flow:**
```
Your App → HTTP POST → API Endpoint → Agent 1 → Agent 2 → Agent 3 → Response
```

---

### **Method 2: Python SDK** (Direct Integration)

```python
# Import agents directly into your Python app
from agents.log_agent import LogIngestionAgent
from agents.analysis_agent_enhanced import SecurityAnalysisAgent

# Initialize
log_agent = LogIngestionAgent()
security_agent = SecurityAnalysisAgent()

# Use directly (no HTTP)
result = await log_agent.ingest_log({'message': 'Test'})
issues = await security_agent.analyze_log({'message': 'Test'})
```

**Flow:**
```
Your App → Direct Function Call → Agents → Response
```

---

### **Method 3: Batch Import** (Existing Logs)

```python
# Import existing log files
with open('/var/log/app.log') as f:
    for line in f:
        requests.post('http://localhost:8000/api/submit-log', 
                     json=parse_log(line))
```

---

### **Method 4: Real-time Stream**

```python
async def stream_logs():
    """Stream logs in real-time"""
    async for log in your_log_stream:
        await send_to_observability(log)
```

---

## 📝 **What Data Agents Need From You**

### **Minimum Required:**

```json
{
  "message": "What happened",        // Required
  "level": "INFO",                   // Required: INFO/WARNING/ERROR/CRITICAL
  "source": "your-app-name"          // Required: identifies your app
}
```

### **Recommended (with metadata):**

```json
{
  "message": "User login failed",
  "level": "WARNING",
  "source": "auth-service",
  "metadata": {                      // Optional but useful
    "user_id": 123,
    "ip_address": "192.168.1.1",
    "attempt_count": 3,
    "timestamp": "2025-10-14T10:30:00Z",
    "endpoint": "/api/login",
    "user_agent": "Mozilla/5.0..."
  }
}
```

**The metadata field accepts ANY data you want to track!**

---

## 🎯 **Real Examples**

### **Example 1: Login Event**

```python
# When user logs in
requests.post('http://localhost:8000/api/submit-log', json={
    'message': f'User {username} logged in',
    'level': 'INFO',
    'source': 'auth-service',
    'metadata': {
        'user_id': user.id,
        'username': username,
        'ip': request.ip,
        'location': get_location(request.ip),
        'device': request.user_agent
    }
})
```

### **Example 2: Payment Processing**

```python
# When payment is processed
requests.post('http://localhost:8000/api/submit-log', json={
    'message': f'Payment processed: ${amount}',
    'level': 'INFO',
    'source': 'payment-service',
    'metadata': {
        'amount': amount,
        'currency': 'USD',
        'user_id': user_id,
        'card_last4': '1234',  # Never send full card!
        'transaction_id': txn_id,
        'payment_method': 'stripe'
    }
})
```

### **Example 3: AI Prompt (Security Critical!)**

```python
# When AI receives user prompt
result = requests.post('http://localhost:8000/api/submit-log', json={
    'message': f'AI prompt: {prompt}',
    'level': 'INFO',
    'source': 'ai-service',
    'metadata': {
        'user_id': user_id,
        'prompt': prompt,
        'model': 'gpt-4',
        'tokens': count_tokens(prompt)
    }
})

# Check for threats BEFORE processing
if result['security_analysis']['issues_detected'] > 0:
    # THREAT DETECTED! Don't process this prompt
    return {"error": "Security threat detected"}
```

### **Example 4: Error Logging**

```python
# When error occurs
try:
    process_data()
except Exception as e:
    requests.post('http://localhost:8000/api/submit-log', json={
        'message': f'Error in data processing: {str(e)}',
        'level': 'ERROR',
        'source': 'data-service',
        'metadata': {
            'error_type': type(e).__name__,
            'error_message': str(e),
            'stack_trace': traceback.format_exc(),
            'function': 'process_data',
            'input_data': safe_repr(data)
        }
    })
```

---

## 🎮 **Interactive Test**

**Try it right now:**

```bash
# Terminal 1: Your backend is already running on port 8000
# Terminal 2: Send a test log

curl -X POST http://localhost:8000/api/submit-log \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test from your terminal",
    "level": "INFO",
    "source": "test-app",
    "metadata": {
      "test": true,
      "timestamp": "2025-10-14T10:30:00Z"
    }
  }'
```

**You'll get back:**

```json
{
  "status": "success",
  "log_id": 7,
  "timestamp": "2025-10-14T15:50:23.123456",
  "security_analysis": {
    "issues_detected": 0,
    "issues": []
  },
  "alerts_created": 0,
  "alert_ids": []
}
```

---

## 🔍 **How to View What Agents Collected**

### **Option 1: Frontend Dashboard**
```
http://localhost:3000/dashboard
```
- See all logs
- See all alerts
- See statistics

### **Option 2: API Endpoints**

```bash
# Get recent logs
curl http://localhost:8000/api/logs?limit=10

# Get alerts
curl http://localhost:8000/api/alerts

# Get agent status
curl http://localhost:8000/api/agents/status
```

### **Option 3: Direct Query (with database)**

```python
from database import ObservabilityDatabase

db = ObservabilityDatabase()
logs = db.get_logs(limit=100)
alerts = db.get_alerts(severity='critical')
```

---

## 📊 **What Each Agent Does With Your Data**

### **Agent 1: Log Ingestion** 
**Input:** Your raw log data  
**Does:** 
- Validates format
- Adds timestamp
- Stores in queue/database
- Generates log_id

**Output:** `{"status": "success", "log_id": 42}`

---

### **Agent 2: Security Analysis**
**Input:** Your log message and metadata  
**Does:**
- Scans for 63 threat patterns
- Checks with AI (if enabled)
- Calculates confidence scores
- Generates explanations

**Output:** List of security issues found (0 to many)

---

### **Agent 3: Alert Management**
**Input:** Security issues from Agent 2  
**Does:**
- Creates alerts
- Assigns severity
- Queues for delivery
- Tracks status

**Output:** List of alert IDs created

---

## 🎯 **Common Integration Patterns**

### **Pattern 1: Fire and Forget**
```python
# Just send and don't wait
requests.post(url, json=log_data)
```

### **Pattern 2: Check Results**
```python
# Send and check for threats
result = requests.post(url, json=log_data)
if result['security_analysis']['issues_detected'] > 0:
    handle_threat()
```

### **Pattern 3: Async/Non-blocking**
```python
# Don't block your app
async def log_event(data):
    async with aiohttp.ClientSession() as session:
        await session.post(url, json=data)
```

### **Pattern 4: Batch Processing**
```python
# Send multiple logs efficiently
for log in logs:
    send_async(log)  # Parallel
```

---

## 💡 **Best Practices**

### **DO:**
✅ Send all security-relevant events  
✅ Include useful metadata  
✅ Use appropriate log levels  
✅ Mask sensitive data (PII, passwords)  
✅ Include context (user_id, ip, etc.)

### **DON'T:**
❌ Send passwords or API keys  
❌ Send full credit card numbers  
❌ Log too much (overwhelming)  
❌ Log too little (not useful)  
❌ Block your app waiting for response

---

## 🚀 **Quick Start Integration**

**1. Test it works:**
```bash
curl -X POST http://localhost:8000/api/submit-log \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","level":"INFO","source":"test"}'
```

**2. Add to your app:**
```python
import requests

OBSERVABILITY_URL = "http://localhost:8000/api/submit-log"

def log_event(message, level="INFO", **metadata):
    try:
        requests.post(OBSERVABILITY_URL, json={
            "message": message,
            "level": level,
            "source": "my-app",
            "metadata": metadata
        }, timeout=2)
    except:
        pass  # Don't let logging break your app
```

**3. Use everywhere:**
```python
log_event("User logged in", level="INFO", user_id=123)
log_event("Payment failed", level="ERROR", amount=99.99)
log_event("AI prompt", level="INFO", prompt=user_input)
```

**4. Check results:**
```
http://localhost:3000/dashboard
```

---

## 📚 **Full Examples**

See `examples/integrate_your_app.py` for:
- ✅ Web application integration
- ✅ AI application integration
- ✅ Microservice integration
- ✅ Batch import examples
- ✅ Error handling patterns

**Run it:**
```bash
python examples/integrate_your_app.py
```

---

## 🎯 **Summary**

**How agents get information:**
1. You send HTTP POST to `/api/submit-log`
2. FastAPI receives and routes to agents
3. Agent 1 ingests and stores
4. Agent 2 analyzes for threats
5. Agent 3 creates alerts
6. Response sent back to you

**What you need to send:**
- `message` (what happened)
- `level` (how serious)
- `source` (which app)
- `metadata` (any extra info)

**What you get back:**
- `log_id` (for reference)
- `security_analysis` (threats found)
- `alerts` (if any created)

---

## 🎉 **You're Ready!**

Your agents are listening at: `http://localhost:8000`

**Next steps:**
1. Read `ARCHITECTURE_GUIDE.md` for deep dive
2. Run `examples/integrate_your_app.py` to see it work
3. Integrate into your app using the patterns above
4. Check dashboard to see results!

**Questions?** Everything is documented in the guides! 📚

