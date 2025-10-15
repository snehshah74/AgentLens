"""
Alert Agent - Sends alerts via API back to frontend
"""
import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import threading
from queue import Queue

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class AlertStatus(Enum):
    """Alert status"""
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    ACKNOWLEDGED = "acknowledged"

@dataclass
class Alert:
    """Data class for alerts"""
    alert_id: str
    title: str
    message: str
    severity: AlertSeverity
    source: str
    timestamp: datetime
    metadata: Dict[str, Any]
    status: AlertStatus = AlertStatus.PENDING
    retry_count: int = 0
    max_retries: int = 3

@dataclass
class AlertRule:
    """Data class for alert rules"""
    rule_id: str
    name: str
    condition: str
    severity: AlertSeverity
    enabled: bool = True
    cooldown_minutes: int = 5
    last_triggered: Optional[datetime] = None

class AlertAgent:
    """Agent responsible for managing and sending alerts"""
    
    def __init__(self):
        self.alert_queue = Queue()
        self.sent_alerts = []
        self.alert_rules = self._initialize_default_rules()
        self.running = False
        self._lock = threading.Lock()
        self._alert_counter = 0
    
    def _initialize_default_rules(self) -> List[AlertRule]:
        """Initialize default alert rules"""
        return [
            AlertRule(
                rule_id="security_threat",
                name="Security Threat Detected",
                condition="security_issue_detected",
                severity=AlertSeverity.CRITICAL,
                cooldown_minutes=0
            ),
            AlertRule(
                rule_id="pii_leakage",
                name="PII Leakage Detected",
                condition="pii_detected",
                severity=AlertSeverity.WARNING,
                cooldown_minutes=10
            ),
            AlertRule(
                rule_id="prompt_injection",
                name="Prompt Injection Attempt",
                condition="prompt_injection_detected",
                severity=AlertSeverity.CRITICAL,
                cooldown_minutes=0
            ),
            AlertRule(
                rule_id="high_error_rate",
                name="High Error Rate",
                condition="error_rate_high",
                severity=AlertSeverity.WARNING,
                cooldown_minutes=15
            ),
            AlertRule(
                rule_id="system_overload",
                name="System Overload",
                condition="system_overload",
                severity=AlertSeverity.ERROR,
                cooldown_minutes=5
            )
        ]
    
    def start(self):
        """Start the alert agent"""
        self.running = True
        logger.info("Alert Agent started")
    
    def stop(self):
        """Stop the alert agent"""
        self.running = False
        logger.info("Alert Agent stopped")
    
    def create_alert(self, title: str, message: str, severity: AlertSeverity, 
                    source: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Create a new alert
        
        Args:
            title: Alert title
            message: Alert message
            severity: Alert severity level
            source: Source of the alert
            metadata: Additional metadata
            
        Returns:
            Alert ID
        """
        with self._lock:
            self._alert_counter += 1
            alert_id = f"alert_{self._alert_counter}_{int(datetime.now().timestamp())}"
        
        alert = Alert(
            alert_id=alert_id,
            title=title,
            message=message,
            severity=severity,
            source=source,
            timestamp=datetime.now(),
            metadata=metadata or {}
        )
        
        self.alert_queue.put(alert)
        logger.info(f"Alert created: {alert_id} - {title}")
        
        return alert_id
    
    async def process_security_issues(self, security_issues: List[Dict[str, Any]]) -> List[str]:
        """
        Process security issues and create appropriate alerts
        
        Args:
            security_issues: List of security issues from Security Analysis Agent
            
        Returns:
            List of created alert IDs
        """
        alert_ids = []
        
        for issue in security_issues:
            issue_type = issue.get('issue_type')
            threat_level = issue.get('threat_level')
            description = issue.get('description')
            log_source = issue.get('log_source')
            
            # Map threat level to alert severity
            severity_map = {
                'low': AlertSeverity.INFO,
                'medium': AlertSeverity.WARNING,
                'high': AlertSeverity.ERROR,
                'critical': AlertSeverity.CRITICAL
            }
            
            severity = severity_map.get(threat_level, AlertSeverity.WARNING)
            
            # Create alert title and message
            title = f"Security Issue: {issue_type.replace('_', ' ').title()}"
            message = f"{description}\nSource: {log_source}\nThreat Level: {threat_level.upper()}"
            
            if issue.get('suggested_action'):
                message += f"\nSuggested Action: {issue['suggested_action']}"
            
            metadata = {
                'issue_type': issue_type,
                'threat_level': threat_level,
                'confidence_score': issue.get('confidence_score'),
                'matched_pattern': issue.get('matched_pattern'),
                'detected_at': issue.get('detected_at')
            }
            
            alert_id = self.create_alert(title, message, severity, "security_analysis", metadata)
            alert_ids.append(alert_id)
        
        return alert_ids
    
    async def send_alerts_to_frontend(self, frontend_callback_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Send pending alerts to frontend
        
        Args:
            frontend_callback_url: Optional callback URL for frontend
            
        Returns:
            Summary of sent alerts
        """
        sent_count = 0
        failed_count = 0
        
        try:
            # Process alerts from queue
            alerts_to_send = []
            while not self.alert_queue.empty():
                try:
                    alert = self.alert_queue.get_nowait()
                    alerts_to_send.append(alert)
                except:
                    break
            
            for alert in alerts_to_send:
                try:
                    # In a real implementation, this would send HTTP requests to frontend
                    # For now, we'll simulate the sending process
                    await self._send_alert_to_frontend(alert, frontend_callback_url)
                    
                    alert.status = AlertStatus.SENT
                    sent_count += 1
                    
                    with self._lock:
                        self.sent_alerts.append(alert)
                        # Keep only last 1000 sent alerts
                        if len(self.sent_alerts) > 1000:
                            self.sent_alerts = self.sent_alerts[-1000:]
                    
                    logger.info(f"Alert sent successfully: {alert.alert_id}")
                    
                except Exception as e:
                    logger.error(f"Failed to send alert {alert.alert_id}: {str(e)}")
                    alert.retry_count += 1
                    
                    if alert.retry_count < alert.max_retries:
                        # Put back in queue for retry
                        self.alert_queue.put(alert)
                    else:
                        alert.status = AlertStatus.FAILED
                        failed_count += 1
            
            return {
                'status': 'success',
                'sent_count': sent_count,
                'failed_count': failed_count,
                'total_processed': len(alerts_to_send)
            }
            
        except Exception as e:
            logger.error(f"Error sending alerts to frontend: {str(e)}")
            return {
                'status': 'error',
                'message': f'Failed to send alerts: {str(e)}',
                'sent_count': sent_count,
                'failed_count': failed_count
            }
    
    async def _send_alert_to_frontend(self, alert: Alert, callback_url: Optional[str] = None):
        """
        Send a single alert to frontend (simulated)
        
        Args:
            alert: Alert to send
            callback_url: Optional callback URL
        """
        # Simulate network delay
        await asyncio.sleep(0.1)
        
        # In a real implementation, you would:
        # 1. Make HTTP POST request to callback_url
        # 2. Include alert data in request body
        # 3. Handle response and errors
        
        alert_data = {
            'alert_id': alert.alert_id,
            'title': alert.title,
            'message': alert.message,
            'severity': alert.severity.value,
            'source': alert.source,
            'timestamp': alert.timestamp.isoformat(),
            'metadata': alert.metadata
        }
        
        # Simulate successful sending
        logger.debug(f"Simulated sending alert to frontend: {json.dumps(alert_data, indent=2)}")
    
    def get_alerts(self, limit: int = 100, severity_filter: Optional[str] = None, 
                  status_filter: Optional[str] = None) -> Dict[str, Any]:
        """
        Get alerts
        
        Args:
            limit: Maximum number of alerts to return
            severity_filter: Filter by severity level
            status_filter: Filter by status
            
        Returns:
            Dict containing alerts and metadata
        """
        try:
            with self._lock:
                alerts = self.sent_alerts.copy()
            
            # Apply filters
            if severity_filter:
                alerts = [alert for alert in alerts if alert.severity.value == severity_filter.lower()]
            
            if status_filter:
                alerts = [alert for alert in alerts if alert.status.value == status_filter.lower()]
            
            # Limit results
            alerts = alerts[-limit:] if limit else alerts
            
            # Convert to serializable format
            serialized_alerts = []
            for alert in alerts:
                serialized_alerts.append({
                    'alert_id': alert.alert_id,
                    'title': alert.title,
                    'message': alert.message,
                    'severity': alert.severity.value,
                    'source': alert.source,
                    'timestamp': alert.timestamp.isoformat(),
                    'status': alert.status.value,
                    'metadata': alert.metadata
                })
            
            return {
                'status': 'success',
                'alerts': serialized_alerts,
                'total_count': len(serialized_alerts),
                'filters': {
                    'severity': severity_filter,
                    'status': status_filter
                }
            }
            
        except Exception as e:
            logger.error(f"Error retrieving alerts: {str(e)}")
            return {
                'status': 'error',
                'message': f'Failed to retrieve alerts: {str(e)}'
            }
    
    def get_alert_stats(self, hours: int = 24) -> Dict[str, Any]:
        """Get alert statistics"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        recent_alerts = [
            alert for alert in self.sent_alerts
            if alert.timestamp > cutoff_time
        ]
        
        # Group by severity and status
        severity_counts = {}
        status_counts = {}
        
        for alert in recent_alerts:
            severity = alert.severity.value
            status = alert.status.value
            
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            'total_alerts': len(recent_alerts),
            'time_period_hours': hours,
            'severity_distribution': severity_counts,
            'status_distribution': status_counts,
            'queue_size': self.alert_queue.qsize(),
            'running': self.running
        }
    
    def acknowledge_alert(self, alert_id: str) -> Dict[str, Any]:
        """Acknowledge an alert"""
        try:
            with self._lock:
                for alert in self.sent_alerts:
                    if alert.alert_id == alert_id:
                        alert.status = AlertStatus.ACKNOWLEDGED
                        return {
                            'status': 'success',
                            'message': f'Alert {alert_id} acknowledged'
                        }
            
            return {
                'status': 'error',
                'message': f'Alert {alert_id} not found'
            }
            
        except Exception as e:
            logger.error(f"Error acknowledging alert: {str(e)}")
            return {
                'status': 'error',
                'message': f'Failed to acknowledge alert: {str(e)}'
            }
