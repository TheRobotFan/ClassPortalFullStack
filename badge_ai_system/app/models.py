"""
Pydantic models for the AI Badge System API
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    id: UUID
    email: str
    full_name: str
    level: int
    xp_points: int

class BadgeBase(BaseModel):
    id: UUID
    name: str
    description: str
    rarity: str
    requirement_type: str
    requirement_value: int

class BadgeRecommendation(BaseModel):
    badge_name: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    reason: str
    estimated_days: Optional[int] = None
    priority: str = Field(..., pattern="^(low|medium|high)$")

class UserAnalysis(BaseModel):
    user_id: UUID
    activity_score: int = Field(..., ge=0)
    engagement_level: str = Field(..., pattern="^(inactive|low|medium|high|legendary)$")
    total_activities: Dict[str, int]
    badge_count: int
    last_activity: datetime
    recommendations: List[BadgeRecommendation]
    predicted_badges: List[str]
    risk_factors: List[str] = []

class EngagementMetrics(BaseModel):
    total_users: int
    active_users_24h: int
    active_users_7d: int
    active_users_30d: int
    average_engagement_score: float
    top_activities: List[Dict[str, Any]]
    badge_distribution: Dict[str, int]
    engagement_trends: List[Dict[str, Any]]

class ActivityRecord(BaseModel):
    user_id: UUID
    activity_type: str
    timestamp: datetime
    metadata: Dict[str, Any] = {}

class PredictionResult(BaseModel):
    user_id: UUID
    badge_name: str
    probability: float = Field(..., ge=0.0, le=1.0)
    confidence_interval: tuple[float, float]
    factors: List[str]

class BadgeAssignment(BaseModel):
    user_id: UUID
    badge_id: UUID
    assigned_at: datetime
    assignment_method: str = Field(..., pattern="^(manual|automatic|ai_triggered)$")
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)

class AnalyticsQuery(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    user_segment: Optional[str] = None
    metrics: List[str] = []

class SystemHealth(BaseModel):
    status: str = Field(..., pattern="^(healthy|degraded|critical)$")
    ai_engine_status: str
    database_status: str
    monitoring_status: str
    last_health_check: datetime
    response_time_ms: float

# Request/Response models for specific endpoints
class BadgeAssignmentRequest(BaseModel):
    user_ids: Optional[List[UUID]] = None
    force_reassignment: bool = False

class BadgeAssignmentResponse(BaseModel):
    assigned_badges: int
    processed_users: int
    errors: List[str] = []
    processing_time_seconds: float

class RecommendationRequest(BaseModel):
    user_id: UUID
    include_historical: bool = True
    max_recommendations: int = Field(10, ge=1, le=50)

class RecommendationResponse(BaseModel):
    user_id: UUID
    recommendations: List[BadgeRecommendation]
    generated_at: datetime
    model_version: str
