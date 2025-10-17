"""
Simplified Security Analysis Agent - Works without LangChain
Scans logs for anomalies, prompt injection attempts, and PII leakage using pattern matching
"""
import re
import json
import logging
import hashlib
import os
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
    log_source: str
    confidence_score: float
    suggested_action: str
    detected_at: datetime
    matched_pattern: Optional[str] = None

class SecurityAnalysisAgent:
    """
    Enhanced Security Analysis Agent with pattern-based threat detection
    """
    
    def __init__(self):
        """Initialize the security analysis agent"""
        self.logger = logger
        self.issues_detected = []
        self.analysis_stats = {
            "total_logs_analyzed": 0,
            "threats_detected": 0,
            "false_positives": 0,
            "analysis_time_ms": 0
        }
        
        # Security patterns for threat detection
        self.security_patterns = {
            "prompt_injection": [
                r"ignore\s+(previous\s+)?instructions",
                r"forget\s+(everything|all)",
                r"you\s+are\s+now\s+a\s+different",
                r"pretend\s+to\s+be",
                r"system:\s*you\s+are",
                r"role:\s*you\s+are",
                r"jailbreak",
                r"prompt\s+injection",
                r"override\s+system",
                r"bypass\s+safety"
            ],
            "pii_leakage": [
                r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",  # Email
                r"(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})",  # Phone
                r"\b\d{3}-?\d{2}-?\d{4}\b",  # SSN
                r"\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b",  # Credit card
                r"\b[A-Z]{2}\d{6}\b"  # Driver's license
            ],
            "sql_injection": [
                r"union\s+select",
                r"drop\s+table",
                r"delete\s+from",
                r"insert\s+into",
                r"update\s+set",
                r"';?\s*drop",
                r"';?\s*delete",
                r"';?\s*insert",
                r"';?\s*update",
                r"or\s+1\s*=\s*1",
                r"and\s+1\s*=\s*1"
            ],
            "xss_attempt": [
                r"<script[^>]*>",
                r"javascript:",
                r"on\w+\s*=",
                r"<iframe[^>]*>",
                r"<object[^>]*>",
                r"<embed[^>]*>",
                r"<link[^>]*>",
                r"<meta[^>]*>",
                r"<style[^>]*>",
                r"expression\s*\("
            ],
            "suspicious_patterns": [
                r"admin\s+password",
                r"root\s+access",
                r"backdoor",
                r"malware",
                r"virus",
                r"trojan",
                r"keylogger",
                r"phishing",
                r"brute\s+force",
                r"dictionary\s+attack"
            ]
        }
        
        self.logger.info("Security Analysis Agent initialized successfully")

    async def analyze_log(self, log_data: Dict[str, Any]) -> List[SecurityIssue]:
        """
        Analyze a log entry for security threats
        
        Args:
            log_data: Dictionary containing log information
            
        Returns:
            List of SecurityIssue objects
        """
        start_time = datetime.now()
        self.analysis_stats["total_logs_analyzed"] += 1
        
        issues = []
        log_message = log_data.get("message", "").lower()
        log_source = log_data.get("source", "unknown")
        
        # Check for prompt injection
        prompt_injection_issues = self._detect_prompt_injection(log_message, log_source)
        issues.extend(prompt_injection_issues)
        
        # Check for PII leakage
        pii_issues = self._detect_pii_leakage(log_message, log_source)
        issues.extend(pii_issues)
        
        # Check for SQL injection
        sql_issues = self._detect_sql_injection(log_message, log_source)
        issues.extend(sql_issues)
        
        # Check for XSS attempts
        xss_issues = self._detect_xss_attempts(log_message, log_source)
        issues.extend(xss_issues)
        
        # Check for suspicious patterns
        suspicious_issues = self._detect_suspicious_patterns(log_message, log_source)
        issues.extend(suspicious_issues)
        
        # Update statistics
        self.analysis_stats["threats_detected"] += len(issues)
        analysis_time = (datetime.now() - start_time).total_seconds() * 1000
        self.analysis_stats["analysis_time_ms"] += analysis_time
        
        # Store issues
        self.issues_detected.extend(issues)
        
        self.logger.info(f"Analyzed log from {log_source}: {len(issues)} threats detected")
        return issues

    def _detect_prompt_injection(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect prompt injection attempts"""
        issues = []
        patterns = self.security_patterns["prompt_injection"]
        
        for pattern in patterns:
            if re.search(pattern, message, re.IGNORECASE):
                confidence = self._calculate_confidence(pattern, message)
                threat_level = ThreatLevel.CRITICAL if confidence > 0.8 else ThreatLevel.HIGH
                
                issue = SecurityIssue(
                    issue_type=SecurityIssueType.PROMPT_INJECTION,
                    threat_level=threat_level,
                    description=f"Potential prompt injection attempt detected: '{pattern}'",
                    log_source=source,
                    confidence_score=confidence,
                    suggested_action="Block request and investigate user behavior",
                    detected_at=datetime.now(),
                    matched_pattern=pattern
                )
                issues.append(issue)
                break  # Only report one prompt injection per log
        
        return issues

    def _detect_pii_leakage(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect PII leakage"""
        issues = []
        patterns = self.security_patterns["pii_leakage"]
        
        for pattern in patterns:
            matches = re.findall(pattern, message, re.IGNORECASE)
            if matches:
                confidence = min(0.9, len(matches) * 0.3)
                threat_level = ThreatLevel.HIGH if confidence > 0.6 else ThreatLevel.MEDIUM
                
                issue = SecurityIssue(
                    issue_type=SecurityIssueType.PII_LEAKAGE,
                    threat_level=threat_level,
                    description=f"PII data detected: {len(matches)} matches found",
                    log_source=source,
                    confidence_score=confidence,
                    suggested_action="Review log content and implement data masking",
                    detected_at=datetime.now(),
                    matched_pattern=pattern
                )
                issues.append(issue)
        
        return issues

    def _detect_sql_injection(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect SQL injection attempts"""
        issues = []
        patterns = self.security_patterns["sql_injection"]
        
        for pattern in patterns:
            if re.search(pattern, message, re.IGNORECASE):
                confidence = self._calculate_confidence(pattern, message)
                threat_level = ThreatLevel.CRITICAL if confidence > 0.7 else ThreatLevel.HIGH
                
                issue = SecurityIssue(
                    issue_type=SecurityIssueType.SQL_INJECTION,
                    threat_level=threat_level,
                    description=f"Potential SQL injection attempt detected",
                    log_source=source,
                    confidence_score=confidence,
                    suggested_action="Block request and audit database access",
                    detected_at=datetime.now(),
                    matched_pattern=pattern
                )
                issues.append(issue)
                break
        
        return issues

    def _detect_xss_attempts(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect XSS attempts"""
        issues = []
        patterns = self.security_patterns["xss_attempt"]
        
        for pattern in patterns:
            if re.search(pattern, message, re.IGNORECASE):
                confidence = self._calculate_confidence(pattern, message)
                threat_level = ThreatLevel.HIGH if confidence > 0.6 else ThreatLevel.MEDIUM
                
                issue = SecurityIssue(
                    issue_type=SecurityIssueType.XSS_ATTEMPT,
                    threat_level=threat_level,
                    description=f"Potential XSS attempt detected",
                    log_source=source,
                    confidence_score=confidence,
                    suggested_action="Sanitize input and implement CSP headers",
                    detected_at=datetime.now(),
                    matched_pattern=pattern
                )
                issues.append(issue)
                break
        
        return issues

    def _detect_suspicious_patterns(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect suspicious patterns"""
        issues = []
        patterns = self.security_patterns["suspicious_patterns"]
        
        for pattern in patterns:
            if re.search(pattern, message, re.IGNORECASE):
                confidence = self._calculate_confidence(pattern, message)
                threat_level = ThreatLevel.MEDIUM if confidence > 0.5 else ThreatLevel.LOW
                
                issue = SecurityIssue(
                    issue_type=SecurityIssueType.SUSPICIOUS_PATTERN,
                    threat_level=threat_level,
                    description=f"Suspicious pattern detected: '{pattern}'",
                    log_source=source,
                    confidence_score=confidence,
                    suggested_action="Monitor user activity and review logs",
                    detected_at=datetime.now(),
                    matched_pattern=pattern
                )
                issues.append(issue)
                break
        
        return issues

    def _calculate_confidence(self, pattern: str, message: str) -> float:
        """Calculate confidence score for a pattern match"""
        matches = re.findall(pattern, message, re.IGNORECASE)
        if not matches:
            return 0.0
        
        # Base confidence on pattern complexity and match frequency
        base_confidence = 0.5
        frequency_bonus = min(0.3, len(matches) * 0.1)
        complexity_bonus = min(0.2, len(pattern.split()) * 0.05)
        
        return min(1.0, base_confidence + frequency_bonus + complexity_bonus)

    def get_issues(self, limit: int = 100, threat_level_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get detected security issues"""
        issues = self.issues_detected[-limit:] if limit else self.issues_detected
        
        if threat_level_filter:
            issues = [issue for issue in issues if issue.threat_level.value == threat_level_filter]
        
        return [{
            "issue_type": issue.issue_type.value,
            "threat_level": issue.threat_level.value,
            "description": issue.description,
            "log_source": issue.log_source,
            "confidence_score": issue.confidence_score,
            "suggested_action": issue.suggested_action,
            "detected_at": issue.detected_at.isoformat(),
            "matched_pattern": issue.matched_pattern
        } for issue in issues]

    def get_security_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get security analysis summary"""
        cutoff_time = datetime.now().timestamp() - (hours * 3600)
        recent_issues = [
            issue for issue in self.issues_detected
            if issue.detected_at.timestamp() > cutoff_time
        ]
        
        threat_counts = {}
        for issue in recent_issues:
            level = issue.threat_level.value
            threat_counts[level] = threat_counts.get(level, 0) + 1
        
        return {
            "total_issues": len(recent_issues),
            "threat_levels": threat_counts,
            "analysis_stats": self.analysis_stats,
            "time_range_hours": hours
        }

    async def get_agent_status(self) -> Dict[str, Any]:
        """Get agent status information"""
        return {
            "status": "active",
            "patterns_loaded": len(self.security_patterns),
            "issues_detected": len(self.issues_detected),
            "stats": self.analysis_stats
        }
