"""
Log Ingestion Agent - Receives and processes logs from frontend
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass
from queue import Queue
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LogEntry:
    """Data class for log entries"""
    timestamp: datetime
    level: str
    message: str
    source: str
    metadata: Dict[str, Any]
    raw_log: str

class LogIngestionAgent:
    """Agent responsible for receiving and processing logs"""
    
    def __init__(self):
        self.log_queue = Queue()
        self.processed_logs = []
        self.running = False
        self._lock = threading.Lock()
    
    def start(self):
        """Start the log ingestion agent"""
        self.running = True
        logger.info("Log Ingestion Agent started")
    
    def stop(self):
        """Stop the log ingestion agent"""
        self.running = False
        logger.info("Log Ingestion Agent stopped")
    
    async def ingest_log(self, log_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingest a single log entry from frontend
        
        Args:
            log_data: Log data from frontend
            
        Returns:
            Response dict with status and log_id
        """
        try:
            # Validate required fields
            required_fields = ['message', 'level', 'source']
            for field in required_fields:
                if field not in log_data:
                    return {
                        'status': 'error',
                        'message': f'Missing required field: {field}'
                    }
            
            # Create log entry
            log_entry = LogEntry(
                timestamp=datetime.now(),
                level=log_data.get('level', 'INFO'),
                message=log_data.get('message', ''),
                source=log_data.get('source', 'unknown'),
                metadata=log_data.get('metadata', {}),
                raw_log=json.dumps(log_data)
            )
            
            # Add to queue for processing
            with self._lock:
                self.log_queue.put(log_entry)
                self.processed_logs.append(log_entry)
                
                # Keep only last 1000 logs in memory
                if len(self.processed_logs) > 1000:
                    self.processed_logs = self.processed_logs[-1000:]
            
            log_id = len(self.processed_logs) - 1
            
            logger.info(f"Log ingested successfully: ID={log_id}, Level={log_entry.level}, Source={log_entry.source}")
            
            return {
                'status': 'success',
                'message': 'Log ingested successfully',
                'log_id': log_id,
                'timestamp': log_entry.timestamp.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error ingesting log: {str(e)}")
            return {
                'status': 'error',
                'message': f'Failed to ingest log: {str(e)}'
            }
    
    def get_logs(self, limit: int = 100, level_filter: Optional[str] = None) -> Dict[str, Any]:
        """
        Retrieve processed logs
        
        Args:
            limit: Maximum number of logs to return
            level_filter: Optional level filter (INFO, WARNING, ERROR, etc.)
            
        Returns:
            Dict containing logs and metadata
        """
        try:
            with self._lock:
                logs = self.processed_logs.copy()
            
            # Apply level filter if specified
            if level_filter:
                logs = [log for log in logs if log.level.upper() == level_filter.upper()]
            
            # Limit results
            logs = logs[-limit:] if limit else logs
            
            # Convert to serializable format
            serialized_logs = []
            for log in logs:
                serialized_logs.append({
                    'timestamp': log.timestamp.isoformat(),
                    'level': log.level,
                    'message': log.message,
                    'source': log.source,
                    'metadata': log.metadata
                })
            
            return {
                'status': 'success',
                'logs': serialized_logs,
                'total_count': len(serialized_logs),
                'filtered_level': level_filter
            }
            
        except Exception as e:
            logger.error(f"Error retrieving logs: {str(e)}")
            return {
                'status': 'error',
                'message': f'Failed to retrieve logs: {str(e)}'
            }
    
    def get_queue_size(self) -> int:
        """Get current queue size"""
        return self.log_queue.qsize()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get ingestion statistics"""
        with self._lock:
            total_logs = len(self.processed_logs)
            level_counts = {}
            
            for log in self.processed_logs:
                level = log.level
                level_counts[level] = level_counts.get(level, 0) + 1
        
        return {
            'total_logs': total_logs,
            'queue_size': self.get_queue_size(),
            'level_distribution': level_counts,
            'running': self.running
        }
