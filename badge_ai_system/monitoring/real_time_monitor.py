"""
Real-time User Monitoring System
Tracks user activity and triggers AI analysis
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import websockets
import redis.asyncio as redis

logger = logging.getLogger(__name__)

class UserMonitor:
    """Real-time user activity monitoring and analysis trigger"""

    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.monitoring_active = False
        self.activity_buffer: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.user_sessions: Dict[str, datetime] = {}
        self.websocket_connections: set = set()

        # Monitoring configuration
        self.buffer_size = 100  # Max activities per user in buffer
        self.session_timeout = 1800  # 30 minutes
        self.analysis_trigger_threshold = 10  # Activities before triggering AI analysis

    async def initialize(self):
        """Initialize Redis connection and monitoring"""
        try:
            # Initialize Redis for caching and pub/sub
            self.redis_client = redis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", "6379")),
                db=int(os.getenv("REDIS_DB", "0")),
                decode_responses=True
            )

            # Test connection
            await self.redis_client.ping()
            logger.info("✅ Redis connection established for monitoring")

        except Exception as e:
            logger.warning(f"Redis not available, using in-memory monitoring: {e}")
            self.redis_client = None

    async def start_monitoring(self):
        """Start the monitoring system"""
        try:
            await self.initialize()
            self.monitoring_active = True

            # Start background tasks
            asyncio.create_task(self._process_activity_buffer())
            asyncio.create_task(self._cleanup_expired_sessions())
            asyncio.create_task(self._websocket_server())

            logger.info("🚀 User monitoring system started")

        except Exception as e:
            logger.error(f"Failed to start monitoring: {e}")
            raise

    async def stop_monitoring(self):
        """Stop the monitoring system"""
        self.monitoring_active = False

        # Close WebSocket connections
        for connection in self.websocket_connections.copy():
            try:
                await connection.close()
            except:
                pass

        # Close Redis connection
        if self.redis_client:
            await self.redis_client.close()

        logger.info("🛑 User monitoring system stopped")

    async def record_activity(self, user_id: str, activity_type: str, metadata: Dict[str, Any] = None):
        """Record a user activity event"""
        if not self.monitoring_active:
            return

        try:
            activity_event = {
                "user_id": user_id,
                "activity_type": activity_type,
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": metadata or {},
                "session_id": self._get_or_create_session(user_id)
            }

            # Add to buffer
            self.activity_buffer[user_id].append(activity_event)

            # Keep buffer size manageable
            if len(self.activity_buffer[user_id]) > self.buffer_size:
                self.activity_buffer[user_id] = self.activity_buffer[user_id][-self.buffer_size:]

            # Store in Redis if available
            if self.redis_client:
                await self.redis_client.lpush(
                    f"user_activity:{user_id}",
                    json.dumps(activity_event)
                )
                # Keep only recent activities
                await self.redis_client.ltrim(f"user_activity:{user_id}", 0, self.buffer_size - 1)

            # Trigger AI analysis if threshold reached
            if len(self.activity_buffer[user_id]) >= self.analysis_trigger_threshold:
                await self._trigger_ai_analysis(user_id)

            # Update user session
            self.user_sessions[user_id] = datetime.utcnow()

            # Broadcast to WebSocket clients
            await self._broadcast_activity(activity_event)

        except Exception as e:
            logger.error(f"Error recording activity for user {user_id}: {e}")

    async def get_user_activity(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent activity for a user"""
        try:
            activities = []

            if self.redis_client:
                # Get from Redis
                redis_activities = await self.redis_client.lrange(f"user_activity:{user_id}", 0, limit - 1)
                activities = [json.loads(activity) for activity in redis_activities]
            else:
                # Get from memory buffer
                activities = self.activity_buffer[user_id][-limit:]

            return activities[::-1]  # Reverse to get chronological order

        except Exception as e:
            logger.error(f"Error getting activity for user {user_id}: {e}")
            return []

    async def get_metrics(self) -> Dict[str, Any]:
        """Get monitoring metrics"""
        try:
            metrics = {
                "monitoring_active": self.monitoring_active,
                "active_sessions": len(self.user_sessions),
                "websocket_connections": len(self.websocket_connections),
                "buffered_activities": sum(len(activities) for activities in self.activity_buffer.values()),
                "timestamp": datetime.utcnow().isoformat()
            }

            # Add Redis metrics if available
            if self.redis_client:
                redis_info = await self.redis_client.info()
                metrics["redis_connected"] = True
                metrics["redis_memory_used"] = redis_info.get("used_memory_human", "unknown")
            else:
                metrics["redis_connected"] = False

            return metrics

        except Exception as e:
            logger.error(f"Error getting monitoring metrics: {e}")
            return {"error": str(e)}

    async def get_active_users(self, minutes: int = 30) -> List[str]:
        """Get users active within the last N minutes"""
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
        return [user_id for user_id, last_seen in self.user_sessions.items()
                if last_seen > cutoff_time]

    async def get_user_engagement_score(self, user_id: str) -> float:
        """Calculate real-time engagement score for a user"""
        try:
            activities = await self.get_user_activity(user_id, 100)

            if not activities:
                return 0.0

            # Calculate engagement based on recency and frequency
            now = datetime.utcnow()
            recent_activities = [a for a in activities
                               if (now - datetime.fromisoformat(a['timestamp'])).seconds < 3600]  # Last hour

            # Base score from activity count
            base_score = min(len(activities) / 10.0, 1.0)  # Cap at 1.0

            # Recency bonus
            recency_bonus = min(len(recent_activities) / 5.0, 0.5)  # Up to 0.5 bonus

            # Diversity bonus (different activity types)
            activity_types = set(a['activity_type'] for a in activities[-20:])  # Last 20 activities
            diversity_bonus = min(len(activity_types) / 4.0, 0.3)  # Up to 0.3 bonus

            return min(base_score + recency_bonus + diversity_bonus, 2.0)  # Cap at 2.0

        except Exception as e:
            logger.error(f"Error calculating engagement for {user_id}: {e}")
            return 0.0

    # Private methods

    def _get_or_create_session(self, user_id: str) -> str:
        """Get or create a session ID for the user"""
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = datetime.utcnow()

        # Check if session is still valid
        if datetime.utcnow() - self.user_sessions[user_id] > timedelta(seconds=self.session_timeout):
            # Create new session
            self.user_sessions[user_id] = datetime.utcnow()

        return f"{user_id}_{self.user_sessions[user_id].timestamp()}"

    async def _trigger_ai_analysis(self, user_id: str):
        """Trigger AI analysis for a user"""
        try:
            # Import here to avoid circular imports
            from ai.ai_engine import ai_engine

            if ai_engine.is_ready():
                # Run analysis in background
                asyncio.create_task(ai_engine.analyze_user(user_id))
                logger.info(f"🤖 Triggered AI analysis for user {user_id}")

        except Exception as e:
            logger.error(f"Error triggering AI analysis for {user_id}: {e}")

    async def _process_activity_buffer(self):
        """Process buffered activities periodically"""
        while self.monitoring_active:
            try:
                # Process activities every 5 minutes
                await asyncio.sleep(300)

                # Analyze patterns for high-activity users
                for user_id, activities in self.activity_buffer.items():
                    if len(activities) > 20:  # High activity threshold
                        await self._analyze_user_patterns(user_id, activities)

                # Clear old activities (keep last 50 per user)
                for user_id in list(self.activity_buffer.keys()):
                    if len(self.activity_buffer[user_id]) > 50:
                        self.activity_buffer[user_id] = self.activity_buffer[user_id][-50:]

            except Exception as e:
                logger.error(f"Error processing activity buffer: {e}")

    async def _analyze_user_patterns(self, user_id: str, activities: List[Dict[str, Any]]):
        """Analyze user behavior patterns"""
        try:
            # Simple pattern analysis
            activity_counts = defaultdict(int)
            for activity in activities[-50:]:  # Last 50 activities
                activity_counts[activity['activity_type']] += 1

            # Identify dominant patterns
            dominant_activity = max(activity_counts.items(), key=lambda x: x[1])

            # Trigger special analysis for unusual patterns
            if dominant_activity[1] > 30:  # Very focused on one activity
                logger.info(f"🎯 User {user_id} shows high focus on {dominant_activity[0]}")

        except Exception as e:
            logger.error(f"Error analyzing patterns for {user_id}: {e}")

    async def _cleanup_expired_sessions(self):
        """Clean up expired user sessions"""
        while self.monitoring_active:
            try:
                await asyncio.sleep(600)  # Every 10 minutes

                expired_users = []
                cutoff_time = datetime.utcnow() - timedelta(seconds=self.session_timeout)

                for user_id, last_seen in self.user_sessions.items():
                    if last_seen < cutoff_time:
                        expired_users.append(user_id)

                # Remove expired sessions
                for user_id in expired_users:
                    del self.user_sessions[user_id]
                    # Keep some recent activities but clear buffer
                    if user_id in self.activity_buffer:
                        self.activity_buffer[user_id] = self.activity_buffer[user_id][-10:]

                if expired_users:
                    logger.info(f"🧹 Cleaned up {len(expired_users)} expired sessions")

            except Exception as e:
                logger.error(f"Error cleaning up sessions: {e}")

    async def _websocket_server(self):
        """Run WebSocket server for real-time monitoring"""
        try:
            port = int(os.getenv("WEBSOCKET_PORT", "8765"))

            async def websocket_handler(websocket, path):
                self.websocket_connections.add(websocket)
                try:
                    # Send welcome message
                    await websocket.send(json.dumps({
                        "type": "welcome",
                        "message": "Connected to AI Badge Monitor",
                        "timestamp": datetime.utcnow().isoformat()
                    }))

                    # Keep connection alive
                    async for message in websocket:
                        # Handle client messages if needed
                        pass

                except websockets.exceptions.ConnectionClosed:
                    pass
                finally:
                    self.websocket_connections.discard(websocket)

            server = await websockets.serve(websocket_handler, "0.0.0.0", port)
            logger.info(f"🌐 WebSocket server started on port {port}")

            # Keep server running
            while self.monitoring_active:
                await asyncio.sleep(1)

            server.close()
            await server.wait_closed()

        except Exception as e:
            logger.warning(f"WebSocket server failed: {e}")

    async def _broadcast_activity(self, activity: Dict[str, Any]):
        """Broadcast activity to WebSocket clients"""
        try:
            message = json.dumps({
                "type": "activity",
                "data": activity
            })

            # Send to all connected clients
            for connection in self.websocket_connections.copy():
                try:
                    await connection.send(message)
                except:
                    # Remove dead connections
                    self.websocket_connections.discard(connection)

        except Exception as e:
            logger.error(f"Error broadcasting activity: {e}")
