"""
Security Analysis Agent - Scans logs for anomalies, prompt injection attempts, and PII leakage
"""
import re
import json
import logging
import hashlib
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ThreatLevel(Enum):
    """Threat level enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class SecurityIssueType(Enum):
    """Types of security issues"""
    PROMPT_INJECTION = "prompt_injection"
    PII_LEAKAGE = "pii_leakage"
    SUSPICIOUS_PATTERN = "suspicious_pattern"
    AUTHENTICATION_FAILURE = "authentication_failure"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    SQL_INJECTION = "sql_injection"
    XSS_ATTEMPT = "xss_attempt"

@dataclass
class SecurityIssue:
    """Data class for security issues"""
    issue_type: SecurityIssueType
    threat_level: ThreatLevel
    description: str
    detected_at: datetime
    log_source: str
    log_message: str
    confidence_score: float
    matched_pattern: Optional[str] = None
    suggested_action: Optional[str] = None

class SecurityAnalysisAgent:
    """Agent responsible for analyzing logs for security threats"""
    
    def __init__(self):
        self.detected_issues = []
        self.analysis_rules = self._load_analysis_rules()
        self.pii_patterns = self._load_pii_patterns()
        self.injection_patterns = self._load_injection_patterns()
        self.running = False
    
    def _load_analysis_rules(self) -> Dict[str, Any]:
        """Load security analysis rules"""
        return {
            'max_issues_per_hour': 100,
            'suspicious_keywords': [
                'admin', 'password', 'token', 'secret', 'key',
                'hack', 'exploit', 'vulnerability', 'backdoor'
            ],
            'rate_limit_threshold': 100,  # requests per minute
            'failed_auth_threshold': 5    # failed attempts per minute
        }
    
    def _load_pii_patterns(self) -> Dict[str, str]:
        """Load PII detection patterns"""
        return {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            'ssn': r'\b\d{3}-?\d{2}-?\d{4}\b',
            'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
            'ip_address': r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
            'mac_address': r'\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b'
        }
    
    def _load_injection_patterns(self) -> Dict[str, List[str]]:
        """Load injection attack patterns"""
        return {
            'prompt_injection': [
                r'ignore\s+(?:previous|above|all)\s+(?:instructions?|prompts?)',
                r'forget\s+(?:everything|all|previous)',
                r'you\s+are\s+now\s+(?:a\s+)?(?:different|new)',
                r'pretend\s+(?:to\s+be|you\s+are)',
                r'system\s*:\s*you\s+are\s+(?:now\s+)?(?:a\s+)?(?:different|new)',
                r'role\s*:\s*you\s+are\s+(?:now\s+)?(?:a\s+)?(?:different|new)'
            ],
            'sql_injection': [
                r'(union|select|insert|update|delete|drop|create|alter)\s+',
                r';\s*(drop|delete|update|insert)',
                r'or\s+1\s*=\s*1',
                r'and\s+1\s*=\s*1'
            ],
            'xss': [
                r'<script[^>]*>.*?</script>',
                r'javascript\s*:',
                r'on\w+\s*=',
                r'<iframe[^>]*>.*?</iframe>'
            ]
        }
    
    def start(self):
        """Start the security analysis agent"""
        self.running = True
        logger.info("Security Analysis Agent started")
    
    def stop(self):
        """Stop the security analysis agent"""
        self.running = False
        logger.info("Security Analysis Agent stopped")
    
    async def analyze_log(self, log_data: Dict[str, Any]) -> List[SecurityIssue]:
        """
        Analyze a single log entry for security threats
        
        Args:
            log_data: Log data to analyze
            
        Returns:
            List of detected security issues
        """
        issues = []
        
        try:
            log_message = log_data.get('message', '').lower()
            log_source = log_data.get('source', 'unknown')
            
            # Check for PII leakage
            pii_issues = self._detect_pii(log_message, log_source)
            issues.extend(pii_issues)
            
            # Check for prompt injection attempts
            injection_issues = self._detect_injection_attempts(log_message, log_source)
            issues.extend(injection_issues)
            
            # Check for suspicious patterns
            suspicious_issues = self._detect_suspicious_patterns(log_message, log_source)
            issues.extend(suspicious_issues)
            
            # Check for authentication failures
            auth_issues = self._detect_auth_failures(log_message, log_source)
            issues.extend(auth_issues)
            
            # Store detected issues
            for issue in issues:
                self.detected_issues.append(issue)
                
                # Keep only last 1000 issues
                if len(self.detected_issues) > 1000:
                    self.detected_issues = self.detected_issues[-1000:]
            
            if issues:
                logger.warning(f"Detected {len(issues)} security issues in log from {log_source}")
            
            return issues
            
        except Exception as e:
            logger.error(f"Error analyzing log for security threats: {str(e)}")
            return []
    
    def _detect_pii(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect PII leakage in log message"""
        issues = []
        
        for pii_type, pattern in self.pii_patterns.items():
            matches = re.findall(pattern, message, re.IGNORECASE)
            if matches:
                threat_level = ThreatLevel.HIGH if pii_type in ['ssn', 'credit_card'] else ThreatLevel.MEDIUM
                
                issue = SecurityIssue(
                    issue_type=SecurityIssueType.PII_LEAKAGE,
                    threat_level=threat_level,
                    description=f"Potential {pii_type.upper()} leakage detected",
                    detected_at=datetime.now(),
                    log_source=source,
                    log_message=message,
                    confidence_score=0.9,
                    matched_pattern=pattern,
                    suggested_action=f"Review and redact {pii_type} information from logs"
                )
                issues.append(issue)
        
        return issues
    
    def _detect_injection_attempts(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect injection attack attempts"""
        issues = []
        
        for injection_type, patterns in self.injection_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, message, re.IGNORECASE)
                if matches:
                    issue_type_map = {
                        'prompt_injection': SecurityIssueType.PROMPT_INJECTION,
                        'sql_injection': SecurityIssueType.SQL_INJECTION,
                        'xss': SecurityIssueType.XSS_ATTEMPT
                    }
                    
                    threat_level_map = {
                        'prompt_injection': ThreatLevel.CRITICAL,
                        'sql_injection': ThreatLevel.HIGH,
                        'xss': ThreatLevel.HIGH
                    }
                    
                    issue = SecurityIssue(
                        issue_type=issue_type_map.get(injection_type, SecurityIssueType.SUSPICIOUS_PATTERN),
                        threat_level=threat_level_map.get(injection_type, ThreatLevel.MEDIUM),
                        description=f"Potential {injection_type.replace('_', ' ')} attempt detected",
                        detected_at=datetime.now(),
                        log_source=source,
                        log_message=message,
                        confidence_score=0.8,
                        matched_pattern=pattern,
                        suggested_action=f"Block request and investigate {injection_type} attempt"
                    )
                    issues.append(issue)
        
        return issues
    
    def _detect_suspicious_patterns(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect suspicious patterns in log messages"""
        issues = []
        
        for keyword in self.analysis_rules['suspicious_keywords']:
            if keyword in message:
                issue = SecurityIssue(
                    issue_type=SecurityIssueType.SUSPICIOUS_PATTERN,
                    threat_level=ThreatLevel.MEDIUM,
                    description=f"Suspicious keyword '{keyword}' detected",
                    detected_at=datetime.now(),
                    log_source=source,
                    log_message=message,
                    confidence_score=0.6,
                    matched_pattern=keyword,
                    suggested_action="Review log context for potential security implications"
                )
                issues.append(issue)
        
        return issues
    
    def _detect_auth_failures(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect authentication failures"""
        issues = []
        
        auth_failure_patterns = [
            r'authentication\s+failed',
            r'login\s+failed',
            r'invalid\s+credentials',
            r'access\s+denied',
            r'unauthorized'
        ]
        
        for pattern in auth_failure_patterns:
            if re.search(pattern, message, re.IGNORECASE):
                issue = SecurityIssue(
                    issue_type=SecurityIssueType.AUTHENTICATION_FAILURE,
                    threat_level=ThreatLevel.MEDIUM,
                    description="Authentication failure detected",
                    detected_at=datetime.now(),
                    log_source=source,
                    log_message=message,
                    confidence_score=0.7,
                    matched_pattern=pattern,
                    suggested_action="Monitor for brute force attacks"
                )
                issues.append(issue)
        
        return issues
    
    def get_security_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get security analysis summary"""
        cutoff_time = datetime.now().timestamp() - (hours * 3600)
        
        recent_issues = [
            issue for issue in self.detected_issues
            if issue.detected_at.timestamp() > cutoff_time
        ]
        
        # Group by issue type and threat level
        issue_type_counts = {}
        threat_level_counts = {}
        
        for issue in recent_issues:
            issue_type = issue.issue_type.value
            threat_level = issue.threat_level.value
            
            issue_type_counts[issue_type] = issue_type_counts.get(issue_type, 0) + 1
            threat_level_counts[threat_level] = threat_level_counts.get(threat_level, 0) + 1
        
        return {
            'total_issues': len(recent_issues),
            'time_period_hours': hours,
            'issue_type_distribution': issue_type_counts,
            'threat_level_distribution': threat_level_counts,
            'most_common_issues': sorted(issue_type_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        }
    
    def get_issues(self, limit: int = 100, threat_level_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get recent security issues"""
        issues = self.detected_issues.copy()
        
        # Apply threat level filter
        if threat_level_filter:
            issues = [issue for issue in issues if issue.threat_level.value == threat_level_filter.lower()]
        
        # Limit results
        issues = issues[-limit:] if limit else issues
        
        # Convert to serializable format
        serialized_issues = []
        for issue in issues:
            serialized_issues.append({
                'issue_type': issue.issue_type.value,
                'threat_level': issue.threat_level.value,
                'description': issue.description,
                'detected_at': issue.detected_at.isoformat(),
                'log_source': issue.log_source,
                'confidence_score': issue.confidence_score,
                'matched_pattern': issue.matched_pattern,
                'suggested_action': issue.suggested_action
            })
        
        return serialized_issues
