"""
Enhanced Security Analysis Agent with LangChain and LLM Integration
Scans logs for anomalies, prompt injection attempts, and PII leakage using AI
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

# LangChain imports
from langchain.schema import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_community.llms import HuggingFacePipeline
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.callbacks import StreamingStdOutCallbackHandler

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
    LLM_DETECTED_THREAT = "llm_detected_threat"

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
    llm_analysis: Optional[str] = None

class LLMProvider:
    """LLM provider abstraction for different models"""
    
    def __init__(self, provider: str = "openai", model: str = "gpt-3.5-turbo"):
        self.provider = provider
        self.model = model
        self.llm = None
        self._initialize_llm()
    
    def _initialize_llm(self):
        """Initialize the LLM based on provider"""
        try:
            if self.provider == "openai":
                api_key = os.getenv("OPENAI_API_KEY")
                if not api_key:
                    logger.warning("OPENAI_API_KEY not found. LLM analysis will be disabled.")
                    return
                
                self.llm = ChatOpenAI(
                    model=self.model,
                    temperature=0.1,
                    api_key=api_key,
                    max_tokens=1000
                )
                logger.info(f"Initialized OpenAI LLM: {self.model}")
                
            elif self.provider == "huggingface":
                api_key = os.getenv("HUGGINGFACE_API_KEY")
                if not api_key:
                    logger.warning("HUGGINGFACE_API_KEY not found. LLM analysis will be disabled.")
                    return
                
                # For HuggingFace, we'd use HuggingFacePipeline
                # This is a simplified version - in production, you'd set up the pipeline properly
                logger.info("HuggingFace LLM integration requires additional setup")
                
            elif self.provider == "ollama":
                try:
                    from langchain_community.llms import Ollama
                    self.llm = Ollama(
                        model=self.model,
                        base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
                    )
                    logger.info(f"Initialized Ollama LLM: {self.model}")
                except ImportError:
                    logger.warning("Ollama not installed. Run: pip install ollama")
                    
            elif self.provider == "groq":
                try:
                    from langchain_groq import ChatGroq
                    api_key = os.getenv("GROQ_API_KEY")
                    if not api_key:
                        logger.warning("GROQ_API_KEY not found. LLM analysis will be disabled.")
                        return
                    
                    self.llm = ChatGroq(
                        model=self.model,
                        temperature=0.1,
                        groq_api_key=api_key
                    )
                    logger.info(f"Initialized Groq LLM: {self.model}")
                except ImportError:
                    logger.warning("Groq not installed. Run: pip install groq")
                    
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {e}")
            self.llm = None
    
    async def analyze_security_threat(self, log_message: str, log_source: str) -> Dict[str, Any]:
        """Analyze log message for security threats using LLM"""
        if not self.llm:
            return {"enabled": False, "reason": "LLM not initialized"}
        
        try:
            # Create security analysis prompt
            security_prompt = PromptTemplate(
                input_variables=["log_message", "log_source"],
                template="""
You are an AI security analyst. Analyze the following log message for security threats.

Log Source: {log_source}
Log Message: {log_message}

Analyze this log for:
1. Prompt injection attempts
2. PII (Personally Identifiable Information) leakage
3. SQL injection attempts
4. XSS (Cross-Site Scripting) attempts
5. Authentication bypass attempts
6. Suspicious patterns or keywords

Respond with a JSON object in this exact format:
{{
    "threats_detected": true/false,
    "threat_level": "low/medium/high/critical",
    "threat_types": ["prompt_injection", "pii_leakage", etc.],
    "confidence": 0.0-1.0,
    "explanation": "Brief explanation of the threat",
    "suggested_action": "Recommended action to take",
    "risk_score": 0-100
}}

If no threats are detected, set threats_detected to false and threat_level to "low".
"""
            )
            
            # Create and run the chain
            chain = LLMChain(llm=self.llm, prompt=security_prompt)
            
            # Get LLM analysis
            result = await chain.arun(log_message=log_message, log_source=log_source)
            
            # Parse the JSON response
            try:
                analysis = json.loads(result)
                analysis["enabled"] = True
                return analysis
            except json.JSONDecodeError:
                # Fallback if LLM doesn't return valid JSON
                return {
                    "enabled": True,
                    "threats_detected": "threat" in result.lower() or "injection" in result.lower(),
                    "threat_level": "medium",
                    "confidence": 0.5,
                    "explanation": result[:200] + "..." if len(result) > 200 else result,
                    "suggested_action": "Review log manually",
                    "risk_score": 50
                }
                
        except Exception as e:
            logger.error(f"LLM analysis failed: {e}")
            return {"enabled": False, "error": str(e)}

class SecurityAnalysisAgent:
    """Enhanced agent responsible for analyzing logs for security threats using AI"""
    
    def __init__(self):
        self.agent_id = "security_analysis_agent"
        self.agent_name = "Security Analysis Agent"
        
        # Initialize LLM provider
        llm_provider = os.getenv("LLM_PROVIDER", "openai")
        llm_model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
        self.llm_provider = LLMProvider(llm_provider, llm_model)
        
        # Load detection patterns
        self.injection_patterns = self._load_injection_patterns()
        self.pii_patterns = self._load_pii_patterns()
        self.sql_patterns = self._load_sql_patterns()
        self.xss_patterns = self._load_xss_patterns()
        self.suspicious_keywords = self._load_suspicious_keywords()
        
        # Configuration
        self.confidence_threshold = float(os.getenv("CONFIDENCE_THRESHOLD", "0.7"))
        self.llm_analysis_enabled = os.getenv("LLM_ANALYSIS_ENABLED", "true").lower() == "true"
        
        logger.info(f"Initialized {self.agent_name} with LLM provider: {llm_provider}")
    
    def _load_injection_patterns(self) -> Dict[str, List[str]]:
        """Load injection attack patterns"""
        return {
            'prompt_injection': [
                r'ignore\s+(?:previous|above|all)\s+(?:instructions?|prompts?)',
                r'forget\s+(?:everything|all|previous)',
                r'you\s+are\s+now\s+(?:a\s+)?(?:different|new)',
                r'pretend\s+(?:to\s+be|you\s+are)',
                r'system\s*:\s*you\s+are\s+(?:now\s+)?(?:a\s+)?(?:different|new)',
                r'role\s*:\s*you\s+are\s+(?:now\s+)?(?:a\s+)?(?:different|new)',
                r'jailbreak',
                r'override\s+(?:safety|security|instructions)',
                r'act\s+as\s+(?:if\s+)?(?:you\s+are\s+)?(?:a\s+)?(?:different|new)',
                r'simulate\s+(?:being|as)\s+(?:a\s+)?(?:different|new)',
                r'disregard\s+(?:all\s+)?(?:previous\s+)?(?:instructions?|prompts?)',
                r'new\s+instructions?',
                r'override\s+instructions?',
                r'ignore\s+instructions?'
            ],
            'role_play': [
                r'you\s+are\s+(?:now\s+)?(?:a\s+)?(?:developer|admin|hacker|assistant)',
                r'act\s+as\s+(?:a\s+)?(?:developer|admin|hacker|assistant)',
                r'pretend\s+(?:to\s+be|you\s+are)\s+(?:a\s+)?(?:developer|admin|hacker)',
                r'simulate\s+(?:being|as)\s+(?:a\s+)?(developer|admin|hacker)'
            ]
        }
    
    def _load_pii_patterns(self) -> Dict[str, str]:
        """Load PII detection patterns"""
        return {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            'ssn': r'\b\d{3}-?\d{2}-?\d{4}\b',
            'credit_card': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
            'ip_address': r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
            'api_key': r'[A-Za-z0-9]{20,}',
            'password': r'password\s*[:=]\s*["\']?[^"\'\s]+["\']?',
            'token': r'token\s*[:=]\s*["\']?[A-Za-z0-9._-]+["\']?'
        }
    
    def _load_sql_patterns(self) -> List[str]:
        """Load SQL injection patterns"""
        return [
            r'(\b(?:union|select|insert|update|delete|drop|create|alter)\b.*\b(?:from|into|where|values)\b)',
            r'\b(?:or|and)\s+\d+\s*=\s*\d+',
            r'\b(?:or|and)\s+["\']?\w+["\']?\s*=\s*["\']?\w+["\']?',
            r';\s*(?:drop|delete|insert|update|create|alter)',
            r'--\s*$',
            r'/\*.*\*/',
            r'\bunion\s+(?:all\s+)?select\b',
            r'\b(?:or|and)\s+1\s*=\s*1\b',
            r'\b(?:or|and)\s+["\']\s*=\s*["\']\b'
        ]
    
    def _load_xss_patterns(self) -> List[str]:
        """Load XSS attack patterns"""
        return [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'<iframe[^>]*>',
            r'<object[^>]*>',
            r'<embed[^>]*>',
            r'on\w+\s*=',
            r'<img[^>]*onerror\s*=',
            r'<svg[^>]*onload\s*=',
            r'<link[^>]*onload\s*=',
            r'<body[^>]*onload\s*='
        ]
    
    def _load_suspicious_keywords(self) -> List[str]:
        """Load suspicious keywords"""
        return [
            'admin', 'password', 'secret', 'key', 'token', 'credential',
            'hack', 'exploit', 'vulnerability', 'bypass', 'root',
            'escalate', 'privilege', 'backdoor', 'malware', 'virus',
            'inject', 'payload', 'shell', 'cmd', 'exec', 'eval'
        ]
    
    async def analyze_log(self, log_entry: Dict[str, Any]) -> List[SecurityIssue]:
        """
        Analyze a log entry for security threats using both rule-based and LLM analysis
        """
        issues = []
        message = log_entry.get("message", "")
        source = log_entry.get("source", "unknown")
        
        logger.info(f"Analyzing log from {source}: {message[:100]}...")
        
        # Rule-based analysis (fast and reliable)
        rule_based_issues = await self._rule_based_analysis(message, source)
        issues.extend(rule_based_issues)
        
        # LLM-based analysis (intelligent and contextual)
        if self.llm_analysis_enabled:
            llm_issues = await self._llm_based_analysis(message, source)
            issues.extend(llm_issues)
        
        # Deduplicate issues
        issues = self._deduplicate_issues(issues)
        
        logger.info(f"Detected {len(issues)} security issues")
        return issues
    
    async def _rule_based_analysis(self, message: str, source: str) -> List[SecurityIssue]:
        """Perform rule-based security analysis"""
        issues = []
        
        # Check for prompt injection
        injection_issues = self._detect_prompt_injection(message, source)
        issues.extend(injection_issues)
        
        # Check for PII leakage
        pii_issues = self._detect_pii(message, source)
        issues.extend(pii_issues)
        
        # Check for SQL injection
        sql_issues = self._detect_sql_injection(message, source)
        issues.extend(sql_issues)
        
        # Check for XSS attempts
        xss_issues = self._detect_xss(message, source)
        issues.extend(xss_issues)
        
        # Check for suspicious keywords
        keyword_issues = self._detect_suspicious_keywords(message, source)
        issues.extend(keyword_issues)
        
        return issues
    
    async def _llm_based_analysis(self, message: str, source: str) -> List[SecurityIssue]:
        """Perform LLM-based security analysis"""
        issues = []
        
        try:
            # Get LLM analysis
            llm_result = await self.llm_provider.analyze_security_threat(message, source)
            
            if not llm_result.get("enabled", False):
                logger.debug("LLM analysis disabled or unavailable")
                return issues
            
            # Create security issue from LLM analysis
            if llm_result.get("threats_detected", False):
                threat_level = ThreatLevel(llm_result.get("threat_level", "medium"))
                confidence = llm_result.get("confidence", 0.5)
                
                # Only create issue if confidence meets threshold
                if confidence >= self.confidence_threshold:
                    issue = SecurityIssue(
                        issue_type=SecurityIssueType.LLM_DETECTED_THREAT,
                        threat_level=threat_level,
                        description=llm_result.get("explanation", "LLM detected potential threat"),
                        detected_at=datetime.now(),
                        log_source=source,
                        log_message=message,
                        confidence_score=confidence,
                        suggested_action=llm_result.get("suggested_action", "Review manually"),
                        llm_analysis=json.dumps(llm_result)
                    )
                    issues.append(issue)
                    logger.info(f"LLM detected threat: {threat_level.value} (confidence: {confidence:.2f})")
            
        except Exception as e:
            logger.error(f"LLM analysis failed: {e}")
        
        return issues
    
    def _detect_prompt_injection(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect prompt injection attempts"""
        issues = []
        
        for injection_type, patterns in self.injection_patterns.items():
            for pattern in patterns:
                if re.search(pattern, message, re.IGNORECASE):
                    threat_level = ThreatLevel.CRITICAL if injection_type == 'prompt_injection' else ThreatLevel.HIGH
                    
                    issue = SecurityIssue(
                        issue_type=SecurityIssueType.PROMPT_INJECTION,
                        threat_level=threat_level,
                        description=f"Potential {injection_type.replace('_', ' ')} attempt detected",
                        detected_at=datetime.now(),
                        log_source=source,
                        log_message=message,
                        confidence_score=0.8,
                        matched_pattern=pattern,
                        suggested_action=f"Block request and investigate {injection_type} attempt"
                    )
                    issues.append(issue)
                    break  # Only report one issue per injection type
        
        return issues
    
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
    
    def _detect_sql_injection(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect SQL injection attempts"""
        issues = []
        
        for pattern in self.sql_patterns:
            if re.search(pattern, message, re.IGNORECASE):
                issue = SecurityIssue(
                    issue_type=SecurityIssueType.SQL_INJECTION,
                    threat_level=ThreatLevel.HIGH,
                    description="Potential SQL injection attempt detected",
                    detected_at=datetime.now(),
                    log_source=source,
                    log_message=message,
                    confidence_score=0.8,
                    matched_pattern=pattern,
                    suggested_action="Block request and investigate SQL injection attempt"
                )
                issues.append(issue)
                break  # Only report one SQL injection issue per message
        
        return issues
    
    def _detect_xss(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect XSS attempts"""
        issues = []
        
        for pattern in self.xss_patterns:
            if re.search(pattern, message, re.IGNORECASE):
                issue = SecurityIssue(
                    issue_type=SecurityIssueType.XSS_ATTEMPT,
                    threat_level=ThreatLevel.HIGH,
                    description="Potential XSS attempt detected",
                    detected_at=datetime.now(),
                    log_source=source,
                    log_message=message,
                    confidence_score=0.8,
                    matched_pattern=pattern,
                    suggested_action="Block request and investigate XSS attempt"
                )
                issues.append(issue)
                break  # Only report one XSS issue per message
        
        return issues
    
    def _detect_suspicious_keywords(self, message: str, source: str) -> List[SecurityIssue]:
        """Detect suspicious keywords"""
        issues = []
        
        for keyword in self.suspicious_keywords:
            if re.search(r'\b' + re.escape(keyword) + r'\b', message, re.IGNORECASE):
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
    
    def _deduplicate_issues(self, issues: List[SecurityIssue]) -> List[SecurityIssue]:
        """Remove duplicate issues based on type and pattern"""
        seen = set()
        unique_issues = []
        
        for issue in issues:
            # Create a key based on issue type and matched pattern
            key = (issue.issue_type, issue.matched_pattern or issue.description)
            
            if key not in seen:
                seen.add(key)
                unique_issues.append(issue)
        
        return unique_issues
    
    async def get_agent_status(self) -> Dict[str, Any]:
        """Get agent status including LLM availability"""
        llm_status = "disabled"
        if self.llm_analysis_enabled and self.llm_provider.llm:
            llm_status = "enabled"
        elif self.llm_analysis_enabled:
            llm_status = "enabled_but_unavailable"
        
        return {
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "status": "active",
            "llm_analysis": llm_status,
            "llm_provider": self.llm_provider.provider,
            "llm_model": self.llm_provider.model,
            "confidence_threshold": self.confidence_threshold,
            "patterns_loaded": {
                "injection": len(self.injection_patterns.get('prompt_injection', [])),
                "pii": len(self.pii_patterns),
                "sql": len(self.sql_patterns),
                "xss": len(self.xss_patterns),
                "keywords": len(self.suspicious_keywords)
            }
        }


