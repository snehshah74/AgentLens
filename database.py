"""
Database layer for persistent storage
"""
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)

class ObservabilityDatabase:
    """SQLite database for observability data"""
    
    def __init__(self, db_path: str = "observability.db"):
        self.db_path = db_path
        self.init_database()
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            conn.close()
    
    def init_database(self):
        """Initialize database schema"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME NOT NULL,
                    level TEXT NOT NULL,
                    message TEXT NOT NULL,
                    source TEXT NOT NULL,
                    metadata TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Security issues table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS security_issues (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    log_id INTEGER,
                    issue_type TEXT NOT NULL,
                    threat_level TEXT NOT NULL,
                    description TEXT NOT NULL,
                    confidence_score REAL NOT NULL,
                    matched_pattern TEXT,
                    suggested_action TEXT,
                    llm_analysis TEXT,
                    detected_at DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (log_id) REFERENCES logs (id)
                )
            """)
            
            # Alerts table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    alert_id TEXT UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    source TEXT NOT NULL,
                    status TEXT NOT NULL,
                    metadata TEXT,
                    timestamp DATETIME NOT NULL,
                    acknowledged_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes for performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status)")
            
            logger.info("Database initialized successfully")
    
    # Log operations
    def insert_log(self, log_data: Dict[str, Any]) -> int:
        """Insert a log entry and return its ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO logs (timestamp, level, message, source, metadata)
                VALUES (?, ?, ?, ?, ?)
            """, (
                log_data.get('timestamp', datetime.now().isoformat()),
                log_data.get('level', 'INFO'),
                log_data.get('message', ''),
                log_data.get('source', 'unknown'),
                json.dumps(log_data.get('metadata', {}))
            ))
            return cursor.lastrowid
    
    def get_logs(self, limit: int = 100, level_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve logs with optional filtering"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            query = "SELECT * FROM logs"
            params = []
            
            if level_filter:
                query += " WHERE level = ?"
                params.append(level_filter.upper())
            
            query += " ORDER BY timestamp DESC LIMIT ?"
            params.append(limit)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            return [
                {
                    'id': row['id'],
                    'timestamp': row['timestamp'],
                    'level': row['level'],
                    'message': row['message'],
                    'source': row['source'],
                    'metadata': json.loads(row['metadata']) if row['metadata'] else {}
                }
                for row in rows
            ]
    
    def get_log_stats(self) -> Dict[str, Any]:
        """Get log statistics"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Total count
            cursor.execute("SELECT COUNT(*) as count FROM logs")
            total = cursor.fetchone()['count']
            
            # Level distribution
            cursor.execute("""
                SELECT level, COUNT(*) as count 
                FROM logs 
                GROUP BY level
            """)
            level_dist = {row['level']: row['count'] for row in cursor.fetchall()}
            
            return {
                'total_logs': total,
                'level_distribution': level_dist
            }
    
    # Security issue operations
    def insert_security_issue(self, issue_data: Dict[str, Any]) -> int:
        """Insert a security issue"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO security_issues (
                    log_id, issue_type, threat_level, description,
                    confidence_score, matched_pattern, suggested_action,
                    llm_analysis, detected_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                issue_data.get('log_id'),
                issue_data.get('issue_type'),
                issue_data.get('threat_level'),
                issue_data.get('description'),
                issue_data.get('confidence_score'),
                issue_data.get('matched_pattern'),
                issue_data.get('suggested_action'),
                issue_data.get('llm_analysis'),
                issue_data.get('detected_at', datetime.now().isoformat())
            ))
            return cursor.lastrowid
    
    # Alert operations
    def insert_alert(self, alert_data: Dict[str, Any]) -> int:
        """Insert an alert"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO alerts (
                    alert_id, title, message, severity, source, status, metadata, timestamp
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                alert_data['alert_id'],
                alert_data['title'],
                alert_data['message'],
                alert_data['severity'],
                alert_data['source'],
                alert_data.get('status', 'pending'),
                json.dumps(alert_data.get('metadata', {})),
                alert_data.get('timestamp', datetime.now().isoformat())
            ))
            return cursor.lastrowid
    
    def get_alerts(self, limit: int = 100, severity_filter: Optional[str] = None,
                   status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve alerts with optional filtering"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            query = "SELECT * FROM alerts"
            params = []
            conditions = []
            
            if severity_filter:
                conditions.append("severity = ?")
                params.append(severity_filter.lower())
            
            if status_filter:
                conditions.append("status = ?")
                params.append(status_filter.lower())
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY timestamp DESC LIMIT ?"
            params.append(limit)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            return [
                {
                    'alert_id': row['alert_id'],
                    'title': row['title'],
                    'message': row['message'],
                    'severity': row['severity'],
                    'source': row['source'],
                    'status': row['status'],
                    'timestamp': row['timestamp'],
                    'metadata': json.loads(row['metadata']) if row['metadata'] else {}
                }
                for row in rows
            ]
    
    def acknowledge_alert(self, alert_id: str) -> bool:
        """Mark an alert as acknowledged"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE alerts 
                SET status = 'acknowledged', acknowledged_at = ?
                WHERE alert_id = ?
            """, (datetime.now().isoformat(), alert_id))
            return cursor.rowcount > 0
    
    def get_alert_stats(self, hours: int = 24) -> Dict[str, Any]:
        """Get alert statistics"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cutoff = datetime.now().timestamp() - (hours * 3600)
            
            # Total recent alerts
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM alerts 
                WHERE datetime(timestamp) >= datetime(?, 'unixepoch')
            """, (cutoff,))
            total = cursor.fetchone()['count']
            
            # Severity distribution
            cursor.execute("""
                SELECT severity, COUNT(*) as count 
                FROM alerts 
                WHERE datetime(timestamp) >= datetime(?, 'unixepoch')
                GROUP BY severity
            """, (cutoff,))
            severity_dist = {row['severity']: row['count'] for row in cursor.fetchall()}
            
            # Status distribution
            cursor.execute("""
                SELECT status, COUNT(*) as count 
                FROM alerts 
                WHERE datetime(timestamp) >= datetime(?, 'unixepoch')
                GROUP BY status
            """, (cutoff,))
            status_dist = {row['status']: row['count'] for row in cursor.fetchall()}
            
            return {
                'total_alerts': total,
                'time_period_hours': hours,
                'severity_distribution': severity_dist,
                'status_distribution': status_dist
            }

