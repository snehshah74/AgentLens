"""
Main FastAPI application for Agentic AI Observability Backend
"""
import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from agents.log_agent import LogIngestionAgent
from agents.analysis_agent_simple import SecurityAnalysisAgent
from agents.alert_agent import AlertAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for request/response
class LogEntry(BaseModel):
    message: str
    level: str = "INFO"
    source: str = "unknown"
    metadata: Optional[Dict[str, Any]] = {}

class LogIngestionResponse(BaseModel):
    status: str
    message: str
    log_id: Optional[int] = None
    timestamp: Optional[str] = None

class SecurityAnalysisResponse(BaseModel):
    status: str
    issues_detected: int
    issues: List[Dict[str, Any]]

class AlertResponse(BaseModel):
    status: str
    alerts_created: int
    alert_ids: List[str]

class AgentStatusResponse(BaseModel):
    log_ingestion: Dict[str, Any]
    security_analysis: Dict[str, Any]
    alert_agent: Dict[str, Any]

# Global agent instances
log_agent = None
security_agent = None
alert_agent = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global log_agent, security_agent, alert_agent
    
    # Initialize agents
    logger.info("Initializing agents...")
    log_agent = LogIngestionAgent()
    security_agent = SecurityAnalysisAgent()
    alert_agent = AlertAgent()
    
    # Start agents
    log_agent.start()
    # Enhanced security agent doesn't need explicit start
    alert_agent.start()
    
    logger.info("All agents started successfully")
    
    yield
    
    # Cleanup
    logger.info("Shutting down agents...")
    if log_agent:
        log_agent.stop()
    # Enhanced security agent doesn't need explicit stop
    if alert_agent:
        alert_agent.stop()
    logger.info("All agents stopped")

# Create FastAPI app
app = FastAPI(
    title="Agentic AI Observability Backend",
    description="A minimal Python backend for agentic AI observability with three specialized agents",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Agentic AI Observability Backend",
        "version": "1.0.0",
        "status": "running",
        "agents": {
            "log_ingestion": "active",
            "security_analysis": "active",
            "alert_agent": "active"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": asyncio.get_event_loop().time(),
        "agents_running": all([
            log_agent and log_agent.running,
            security_agent is not None,  # Enhanced agent doesn't have running attribute
            alert_agent and alert_agent.running
        ])
    }

# Log Ingestion Endpoints
@app.post("/api/logs/ingest", response_model=LogIngestionResponse)
async def ingest_log(log_entry: LogEntry):
    """Ingest a log entry from frontend"""
    if not log_agent:
        raise HTTPException(status_code=503, detail="Log ingestion agent not available")
    
    try:
        result = await log_agent.ingest_log(log_entry.dict())
        return LogIngestionResponse(**result)
    except Exception as e:
        logger.error(f"Error ingesting log: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to ingest log: {str(e)}")

@app.get("/api/logs")
async def get_logs(limit: int = 100, level: Optional[str] = None):
    """Get processed logs"""
    if not log_agent:
        raise HTTPException(status_code=503, detail="Log ingestion agent not available")
    
    try:
        result = log_agent.get_logs(limit=limit, level_filter=level)
        return result
    except Exception as e:
        logger.error(f"Error retrieving logs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve logs: {str(e)}")

@app.get("/api/logs/stats")
async def get_log_stats():
    """Get log ingestion statistics"""
    if not log_agent:
        raise HTTPException(status_code=503, detail="Log ingestion agent not available")
    
    try:
        stats = log_agent.get_stats()
        return stats
    except Exception as e:
        logger.error(f"Error retrieving log stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve log stats: {str(e)}")

# Security Analysis Endpoints
@app.post("/api/security/analyze", response_model=SecurityAnalysisResponse)
async def analyze_log_security(log_entry: LogEntry, background_tasks: BackgroundTasks):
    """Analyze a log entry for security threats"""
    if not security_agent:
        raise HTTPException(status_code=503, detail="Security analysis agent not available")
    
    try:
        # Analyze log for security issues
        security_issues = await security_agent.analyze_log(log_entry.dict())
        
        # If issues found, create alerts in background
        if security_issues:
            background_tasks.add_task(
                create_alerts_from_security_issues, 
                security_issues
            )
        
        return SecurityAnalysisResponse(
            status="success",
            issues_detected=len(security_issues),
            issues=[{
                "issue_type": issue.issue_type.value,
                "threat_level": issue.threat_level.value,
                "description": issue.description,
                "confidence_score": issue.confidence_score,
                "suggested_action": issue.suggested_action
            } for issue in security_issues]
        )
    except Exception as e:
        logger.error(f"Error analyzing log security: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze log security: {str(e)}")

@app.get("/api/security/issues")
async def get_security_issues(limit: int = 100, threat_level: Optional[str] = None):
    """Get detected security issues"""
    if not security_agent:
        raise HTTPException(status_code=503, detail="Security analysis agent not available")
    
    try:
        issues = security_agent.get_issues(limit=limit, threat_level_filter=threat_level)
        return {"status": "success", "issues": issues}
    except Exception as e:
        logger.error(f"Error retrieving security issues: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve security issues: {str(e)}")

@app.get("/api/security/summary")
async def get_security_summary(hours: int = 24):
    """Get security analysis summary"""
    if not security_agent:
        raise HTTPException(status_code=503, detail="Security analysis agent not available")
    
    try:
        summary = security_agent.get_security_summary(hours=hours)
        return summary
    except Exception as e:
        logger.error(f"Error retrieving security summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve security summary: {str(e)}")

# Alert Endpoints
@app.get("/api/alerts")
async def get_alerts(limit: int = 100, severity: Optional[str] = None, status: Optional[str] = None):
    """Get alerts"""
    if not alert_agent:
        raise HTTPException(status_code=503, detail="Alert agent not available")
    
    try:
        result = alert_agent.get_alerts(limit=limit, severity_filter=severity, status_filter=status)
        return result
    except Exception as e:
        logger.error(f"Error retrieving alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve alerts: {str(e)}")

@app.post("/api/alerts/send")
async def send_alerts_to_frontend(callback_url: Optional[str] = None):
    """Send pending alerts to frontend"""
    if not alert_agent:
        raise HTTPException(status_code=503, detail="Alert agent not available")
    
    try:
        result = await alert_agent.send_alerts_to_frontend(frontend_callback_url=callback_url)
        return result
    except Exception as e:
        logger.error(f"Error sending alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send alerts: {str(e)}")

@app.post("/api/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Acknowledge an alert"""
    if not alert_agent:
        raise HTTPException(status_code=503, detail="Alert agent not available")
    
    try:
        result = alert_agent.acknowledge_alert(alert_id)
        return result
    except Exception as e:
        logger.error(f"Error acknowledging alert: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to acknowledge alert: {str(e)}")

@app.get("/api/alerts/stats")
async def get_alert_stats(hours: int = 24):
    """Get alert statistics"""
    if not alert_agent:
        raise HTTPException(status_code=503, detail="Alert agent not available")
    
    try:
        stats = alert_agent.get_alert_stats(hours=hours)
        return stats
    except Exception as e:
        logger.error(f"Error retrieving alert stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve alert stats: {str(e)}")

# Agent Management Endpoints
@app.get("/api/agents/status", response_model=AgentStatusResponse)
async def get_agent_status():
    """Get status of all agents"""
    try:
        status = {
            "log_ingestion": {
                "running": log_agent.running if log_agent else False,
                "stats": log_agent.get_stats() if log_agent else {}
            },
            "security_analysis": await security_agent.get_agent_status() if security_agent else {"status": "inactive"},
            "alert_agent": {
                "running": alert_agent.running if alert_agent else False,
                "stats": alert_agent.get_alert_stats() if alert_agent else {}
            }
        }
        return AgentStatusResponse(**status)
    except Exception as e:
        logger.error(f"Error retrieving agent status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve agent status: {str(e)}")

# Background task functions
async def create_alerts_from_security_issues(security_issues: List[Any]):
    """Background task to create alerts from security issues"""
    if not alert_agent:
        return
    
    try:
        # Convert security issues to dict format
        issues_dict = []
        for issue in security_issues:
            issues_dict.append({
                "issue_type": issue.issue_type.value,
                "threat_level": issue.threat_level.value,
                "description": issue.description,
                "log_source": issue.log_source,
                "confidence_score": issue.confidence_score,
                "suggested_action": issue.suggested_action,
                "detected_at": issue.detected_at.isoformat()
            })
        
        # Create alerts
        alert_ids = await alert_agent.process_security_issues(issues_dict)
        logger.info(f"Created {len(alert_ids)} alerts from security issues")
        
        # Send alerts to frontend
        await alert_agent.send_alerts_to_frontend()
        
    except Exception as e:
        logger.error(f"Error creating alerts from security issues: {str(e)}")

# Frontend log submission endpoint
@app.post("/api/submit-log")
async def submit_log(log_entry: LogEntry, background_tasks: BackgroundTasks):
    """
    Frontend log submission endpoint that runs the complete pipeline:
    ingest -> analyze -> alert -> respond with results
    """
    try:
        # Step 1: Ingest log
        if not log_agent:
            raise HTTPException(status_code=503, detail="Log ingestion agent not available")
        
        ingestion_result = await log_agent.ingest_log(log_entry.dict())
        if ingestion_result["status"] != "success":
            raise HTTPException(status_code=500, detail="Failed to ingest log")
        
        # Step 2: Analyze for security issues
        if not security_agent:
            raise HTTPException(status_code=503, detail="Security analysis agent not available")
        
        security_issues = await security_agent.analyze_log(log_entry.dict())
        
        # Step 3: Create alerts from security issues
        alert_ids = []
        if security_issues and alert_agent:
            issues_dict = []
            for issue in security_issues:
                issues_dict.append({
                    "issue_type": issue.issue_type.value,
                    "threat_level": issue.threat_level.value,
                    "description": issue.description,
                    "log_source": issue.log_source,
                    "confidence_score": issue.confidence_score,
                    "suggested_action": issue.suggested_action,
                    "detected_at": issue.detected_at.isoformat()
                })
            
            alert_ids = await alert_agent.process_security_issues(issues_dict)
            
            # Send alerts to frontend in background
            background_tasks.add_task(
                alert_agent.send_alerts_to_frontend
            )
        
        return {
            "status": "success",
            "message": "Log processed successfully",
                "log_id": ingestion_result["log_id"],
                "timestamp": ingestion_result["timestamp"],
            "security_analysis": {
                "issues_detected": len(security_issues),
                "issues": [{
                    "issue_type": issue.issue_type.value,
                    "threat_level": issue.threat_level.value,
                    "description": issue.description,
                    "confidence_score": issue.confidence_score,
                    "suggested_action": issue.suggested_action
                } for issue in security_issues]
            },
            "alerts_created": len(alert_ids),
            "alert_ids": alert_ids
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing log submission: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process log: {str(e)}")

# Comprehensive endpoint for full observability pipeline
@app.post("/api/observability/pipeline")
async def run_observability_pipeline(log_entry: LogEntry, background_tasks: BackgroundTasks):
    """Run the complete observability pipeline: ingest -> analyze -> alert"""
    try:
        # Step 1: Ingest log
        ingestion_result = await ingest_log(log_entry)
        if ingestion_result.status != "success":
            raise HTTPException(status_code=500, detail="Failed to ingest log")
        
        # Step 2: Analyze for security issues
        security_result = await analyze_log_security(log_entry, background_tasks)
        
        # Step 3: Send alerts if any issues found
        if security_result.issues_detected > 0:
            background_tasks.add_task(
                alert_agent.send_alerts_to_frontend
            )
        
        return {
            "status": "success",
            "pipeline_results": {
                "ingestion": ingestion_result.dict(),
                "security_analysis": security_result.dict(),
                "alerts_sent": security_result.issues_detected > 0
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in observability pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
