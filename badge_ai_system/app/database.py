"""
Database connection and utilities for the AI Badge System
Supports both Supabase (primary) and PostgreSQL (fallback)
"""

import os
import asyncpg
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager
import logging
from datetime import datetime, timedelta
from supabase import create_client, Client

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Unified database manager supporting Supabase and PostgreSQL"""

    def __init__(self):
        self.supabase: Optional[Client] = None
        self.pool: Optional[asyncpg.Pool] = None
        self.use_supabase = bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_ANON_KEY"))
        self._connection_string = self._build_connection_string()

    def _build_connection_string(self) -> str:
        """Build PostgreSQL connection string from environment variables"""
        host = os.getenv("DB_HOST", "localhost")
        port = os.getenv("DB_PORT", "5432")
        database = os.getenv("DB_NAME", "classeviva")
        user = os.getenv("DB_USER", "postgres")
        password = os.getenv("DB_PASSWORD", "")

        return f"postgresql://{user}:{password}@{host}:{port}/{database}"

    async def connect(self):
        """Initialize database connections (Supabase first, PostgreSQL as fallback)"""
        if self.use_supabase:
            try:
                supabase_url = os.getenv("SUPABASE_URL")
                # Use service role key if available, otherwise anon key
                supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

                logger.info(f"🔗 Connecting to Supabase with {'service role' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else 'anon'} key")
                self.supabase = create_client(supabase_url, supabase_key)

                # Test the connection immediately
                test_result = self.supabase.table('users').select('count').limit(1).execute()
                logger.info("✅ Connected to Supabase (main site database) - connection test successful")
                return
            except Exception as e:
                logger.error(f"❌ Supabase connection failed: {e}")
                logger.error("💡 Supabase is configured but not working. Check credentials and network.")
                # Don't fall back to PostgreSQL - keep use_supabase=True but mark as unavailable
                self.supabase = None
                return

        # PostgreSQL fallback only if Supabase is not configured
        try:
            self.pool = await asyncpg.create_pool(
                self._connection_string,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            logger.info("✅ Connected to PostgreSQL (fallback)")
        except Exception as e:
            logger.error(f"❌ Failed to connect to PostgreSQL: {e}")
            raise

    async def disconnect(self):
        """Close database connections"""
        if self.supabase:
            # Supabase client doesn't need explicit closing
            self.supabase = None
            logger.info("🔌 Supabase connection closed")

        if self.pool:
            await self.pool.close()
            logger.info("🔌 PostgreSQL connection pool closed")

    async def execute_query(self, query: str, *args, table: str = None) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results"""
        if self.use_supabase and table:
            try:
                # Convert SQL query to Supabase query
                result = self.supabase.table(table).select("*").execute()
                return result.data
            except Exception as e:
                logger.error(f"Supabase query failed: {e}")
                raise

        # PostgreSQL fallback
        if not self.pool:
            raise RuntimeError("No database connection available")

        async with self.pool.acquire() as conn:
            try:
                rows = await conn.fetch(query, *args)
                return [dict(row) for row in rows]
            except Exception as e:
                logger.error(f"PostgreSQL query execution failed: {e}")
                raise

    async def execute_command(self, command: str, *args, table: str = None, data: dict = None) -> str:
        """Execute an INSERT/UPDATE/DELETE command"""
        if self.use_supabase and table and data:
            try:
                # Use Supabase client for mutations
                result = self.supabase.table(table).insert(data).execute()
                return "INSERT 1"
            except Exception as e:
                logger.error(f"Supabase command failed: {e}")
                raise

        # PostgreSQL fallback
        if not self.pool:
            raise RuntimeError("No database connection available")

        async with self.pool.acquire() as conn:
            try:
                result = await conn.execute(command, *args)
                return result
            except Exception as e:
                logger.error(f"PostgreSQL command execution failed: {e}")
                raise

# Global database instance
db_manager = DatabaseManager()

async def init_db():
    """Initialize database connection"""
    password = os.getenv("DB_PASSWORD")

    # Skip database initialization if password not set
    if not password:
        logger.warning("⚠️ Database password not configured - running in offline mode")
        return

    try:
        await db_manager.connect()
        logger.info("✅ Database connection pool initialized")
    except Exception as e:
        logger.warning(f"⚠️ Database connection failed: {e} - running in offline mode")
        # Don't raise exception, allow app to start without DB

async def close_db():
    """Close database connection"""
    await db_manager.disconnect()

async def get_db():
    """Dependency injection for FastAPI"""
    if not db_manager.pool:
        raise RuntimeError("Database not initialized - running in offline mode")

    async with db_manager.get_connection() as conn:
        yield conn

# User data queries
async def get_user_stats(user_id: str) -> Dict[str, Any]:
    """Get comprehensive user statistics"""
    logger.info(f"🔍 Getting stats for user {user_id}, using_supabase: {db_manager.use_supabase}")

    if db_manager.use_supabase:
        if db_manager.supabase is None:
            # Supabase is configured but connection failed
            error_msg = "Supabase connection configured but unavailable. Check credentials and network."
            logger.error(f"❌ {error_msg}")
            raise RuntimeError(error_msg)

        logger.info("📡 Using Supabase for user stats")
        try:
            # Use Supabase to get user data
            logger.info(f"Querying Supabase for user: {user_id}")
            user_result = db_manager.supabase.table('users').select('*').eq('id', user_id).execute()
            logger.info(f"Supabase user query result: {user_result}")

            if not user_result.data:
                logger.warning(f"No user found with ID: {user_id}")
                return {}

            user = user_result.data[0]
            logger.info(f"Found user: {user.get('email', 'unknown')}")

            # Get activity counts using Supabase
            quiz_count = len(db_manager.supabase.table('quiz_attempts').select('id').eq('user_id', user_id).execute().data or [])
            comment_count = len(db_manager.supabase.table('forum_comments').select('id').eq('user_id', user_id).execute().data or [])  # forum_comments, not exercise_comments
            material_count = len(db_manager.supabase.table('materials').select('id').eq('uploaded_by', user_id).execute().data or [])
            discussion_count = len(db_manager.supabase.table('forum_discussions').select('id').eq('user_id', user_id).execute().data or [])

            result = {
                'id': user['id'],
                'email': user.get('email'),
                'full_name': user.get('full_name'),
                'level': user.get('level', 1),
                'xp_points': user.get('xp_points', 0),
                'total_active_days': user.get('total_active_days', 0),
                'consecutive_active_days': user.get('consecutive_active_days', 0),
                'created_at': user.get('created_at'),
                'total_quizzes': quiz_count,
                'total_comments': comment_count,
                'total_materials': material_count,
                'total_discussions': discussion_count
            }

            logger.info(f"✅ Returning real Supabase data: {result}")
            return result

        except Exception as e:
            logger.error(f"❌ Supabase query failed: {e}")
            raise RuntimeError(f"Database query failed: {e}")

    # PostgreSQL fallback
    if not db_manager.pool:
        # Return mock data for offline mode
        return {
            'id': user_id,
            'xp_points': 100,
            'level': 2,
            'total_active_days': 10,
            'consecutive_active_days': 3,
            'total_quizzes': 5,
            'total_comments': 8,
            'total_materials': 2,
            'total_discussions': 1
        }

    query = """
    SELECT
        u.id,
        u.email,
        u.full_name,
        u.level,
        u.xp_points,
        u.total_active_days,
        u.consecutive_active_days,
        u.created_at,
        COALESCE(q.quiz_count, 0) as total_quizzes,
        COALESCE(c.comment_count, 0) as total_comments,
        COALESCE(m.material_count, 0) as total_materials,
        COALESCE(d.discussion_count, 0) as total_discussions
    FROM users u
    LEFT JOIN (SELECT user_id, COUNT(*) as quiz_count FROM quiz_attempts GROUP BY user_id) q ON u.id = q.user_id::uuid
    LEFT JOIN (SELECT user_id, COUNT(*) as comment_count FROM exercise_comments GROUP BY user_id) c ON u.id = c.user_id::uuid
    LEFT JOIN (SELECT uploaded_by, COUNT(*) as material_count FROM materials GROUP BY uploaded_by) m ON u.id = m.uploaded_by::uuid
    LEFT JOIN (SELECT user_id, COUNT(*) as discussion_count FROM forum_discussions GROUP BY user_id) d ON u.id = d.user_id::uuid
    WHERE u.id = $1::uuid
    """

    try:
        results = await db_manager.execute_query(query, user_id)
        return results[0] if results else {}
    except Exception as e:
        logger.warning(f"Database query failed, using mock data: {e}")
        return {
            'id': user_id,
            'xp_points': 100,
            'level': 2,
            'total_active_days': 10,
            'consecutive_active_days': 3,
            'total_quizzes': 5,
            'total_comments': 8,
            'total_materials': 2,
            'total_discussions': 1
        }

async def get_recent_user_activity(user_id: str, days: int = 30) -> List[Dict[str, Any]]:
    """Get user activity in the last N days"""
    since_date = datetime.utcnow() - timedelta(days=days)

    queries = [
        # Quiz attempts
        """
        SELECT 'quiz' as activity_type, completed_at as timestamp, score as metadata
        FROM quiz_attempts
        WHERE user_id = $1::uuid AND completed_at >= $2
        """,
        # Comments
        """
        SELECT 'comment' as activity_type, created_at as timestamp, content as metadata
        FROM forum_comments
        WHERE user_id = $1::uuid AND created_at >= $2
        """,
        # Materials
        """
        SELECT 'material' as activity_type, created_at as timestamp, title as metadata
        FROM materials
        WHERE uploaded_by = $1::uuid AND created_at >= $2
        """,
        # Discussions
        """
        SELECT 'discussion' as activity_type, created_at as timestamp, title as metadata
        FROM forum_discussions
        WHERE user_id = $1::uuid AND created_at >= $2
        """
    ]

    all_activities = []
    for query in queries:
        activities = await db_manager.execute_query(query, user_id, since_date)
        all_activities.extend(activities)

    # Sort by timestamp
    all_activities.sort(key=lambda x: x['timestamp'], reverse=True)
    return all_activities

async def get_badge_eligibility(user_id: str) -> List[Dict[str, Any]]:
    """Check which badges a user is eligible for"""
    query = """
    SELECT
        b.id,
        b.name,
        b.requirement_type,
        b.requirement_value,
        CASE
            WHEN b.requirement_type = 'xp_earned' AND u.xp_points >= b.requirement_value THEN true
            WHEN b.requirement_type = 'level_reached' AND u.level >= b.requirement_value THEN true
            WHEN b.requirement_type = 'quizzes_completed' AND (
                SELECT COUNT(*) FROM quiz_attempts WHERE user_id = u.id
            ) >= b.requirement_value THEN true
            WHEN b.requirement_type = 'comments_posted' AND (
                SELECT COUNT(*) FROM forum_comments WHERE user_id = u.id
            ) >= b.requirement_value THEN true
            WHEN b.requirement_type = 'materials_uploaded' AND (
                SELECT COUNT(*) FROM materials WHERE uploaded_by = u.id
            ) >= b.requirement_value THEN true
            WHEN b.requirement_type = 'discussions_created' AND (
                SELECT COUNT(*) FROM forum_discussions WHERE user_id = u.id
            ) >= b.requirement_value THEN true
            ELSE false
        END as is_eligible
    FROM badges b
    CROSS JOIN users u
    WHERE u.id = $1::uuid
    AND b.rarity IN ('legendary', 'admin', 'hacker')  -- Only check prestigious badges
    ORDER BY b.name
    """

    return await db_manager.execute_query(query, user_id)

async def assign_badge_to_user(user_id: str, badge_id: str, method: str = 'ai_triggered'):
    """Assign a badge to a user"""
    if db_manager.use_supabase:
        try:
            # Use Supabase to assign badge
            data = {
                'user_id': user_id,
                'badge_id': badge_id,
                'earned_at': datetime.utcnow().isoformat()
            }
            db_manager.supabase.table('user_badges').insert(data).execute()

            # Log the assignment (if system_logs table exists)
            try:
                log_data = {
                    'event_type': 'badge_assigned',
                    'message': f"Badge {badge_id} assigned to user {user_id} via {method}",
                    'created_at': datetime.utcnow().isoformat()
                }
                db_manager.supabase.table('system_logs').insert(log_data).execute()
            except:
                # Ignore logging errors if table doesn't exist
                pass

            return
        except Exception as e:
            logger.error(f"Supabase badge assignment failed: {e}")
            raise

    # PostgreSQL fallback
    command = """
    INSERT INTO user_badges (user_id, badge_id)
    VALUES ($1::uuid, $2::uuid)
    ON CONFLICT (user_id, badge_id) DO NOTHING
    """

    await db_manager.execute_command(command, user_id, badge_id)

    # Log the assignment
    log_command = """
    INSERT INTO system_logs (event_type, message, created_at)
    VALUES ('badge_assigned', $1, NOW())
    """
    log_message = f"Badge {badge_id} assigned to user {user_id} via {method}"

    try:
        await db_manager.execute_command(log_command, log_message)
    except:
        # Ignore logging errors
        pass

async def get_all_users(limit: int = 1000) -> List[Dict[str, Any]]:
    """Get all users for batch processing"""
    if db_manager.use_supabase:
        try:
            logger.info("📡 Getting users from Supabase")
            result = db_manager.supabase.table('users').select('id,email,level,xp_points,created_at').limit(limit).execute()
            users = result.data or []
            logger.info(f"✅ Found {len(users)} users in Supabase")
            return users
        except Exception as e:
            logger.error(f"❌ Supabase users query failed: {e}")
            return []

    # PostgreSQL fallback
    query = """
    SELECT id, email, level, xp_points, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT $1
    """

    try:
        results = await db_manager.execute_query(query, limit)
        return results
    except Exception as e:
        logger.warning(f"PostgreSQL query failed: {e}")
        return []

async def get_engagement_metrics() -> Dict[str, Any]:
    """Get overall engagement metrics"""
    query = """
    SELECT
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.last_login >= NOW() - INTERVAL '24 hours' THEN u.id END) as active_24h,
        COUNT(DISTINCT CASE WHEN u.last_login >= NOW() - INTERVAL '7 days' THEN u.id END) as active_7d,
        COUNT(DISTINCT CASE WHEN u.last_login >= NOW() - INTERVAL '30 days' THEN u.id END) as active_30d,
        AVG(u.level) as avg_level,
        AVG(u.xp_points) as avg_xp
    FROM users u
    """

    results = await db_manager.execute_query(query)
    return results[0] if results else {}
