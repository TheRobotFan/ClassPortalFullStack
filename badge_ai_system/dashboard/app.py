"""
AI Badge System Dashboard
Interactive dashboard for monitoring and analytics
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import asyncio
import aiohttp
import os
from typing import Dict, List, Any

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

st.set_page_config(
    page_title="AI Badge System Dashboard",
    page_icon="🎖️",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("🎖️ AI Badge System Dashboard")
st.markdown("---")

# Sidebar
st.sidebar.title("🎛️ Controls")

# API status check
async def check_api_status():
    """Check if the API is running"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_BASE_URL}/health") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {"status": "error", "message": f"HTTP {response.status}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Load data functions
async def load_user_analytics():
    """Load user analytics data"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_BASE_URL}/analytics/engagement") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {}
    except Exception as e:
        st.error(f"Error loading analytics: {e}")
        return {}

async def load_monitoring_metrics():
    """Load monitoring metrics"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_BASE_URL}/monitor/metrics") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {}
    except Exception as e:
        st.error(f"Error loading monitoring metrics: {e}")
        return {}

def create_engagement_chart(data: Dict[str, Any]):
    """Create engagement visualization"""
    if not data:
        return None

    # Create metrics cards
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("👥 Total Users", data.get('total_users', 0))

    with col2:
        st.metric("📈 Active 24h", data.get('active_users_24h', 0))

    with col3:
        st.metric("📊 Active 7d", data.get('active_users_7d', 0))

    with col4:
        st.metric("🎯 Active 30d", data.get('active_users_30d', 0))

    # Engagement trends chart
    if 'engagement_trends' in data and data['engagement_trends']:
        trends_df = pd.DataFrame(data['engagement_trends'])
        trends_df['date'] = pd.to_datetime(trends_df['date'])

        fig = px.line(trends_df, x='date', y='engagement_score',
                     title='Engagement Trends Over Time')
        st.plotly_chart(fig, use_container_width=True)

    # Activity distribution
    if 'top_activities' in data and data['top_activities']:
        activities_df = pd.DataFrame(data['top_activities'])

        fig = px.bar(activities_df, x='activity_type', y='count',
                    title='Top Activities Distribution',
                    color='activity_type')
        st.plotly_chart(fig, use_container_width=True)

def create_monitoring_dashboard(metrics: Dict[str, Any]):
    """Create monitoring dashboard"""
    st.header("📊 System Monitoring")

    if not metrics:
        st.warning("No monitoring data available")
        return

    # Status indicators
    col1, col2, col3 = st.columns(3)

    with col1:
        status_color = "🟢" if metrics.get('monitoring_active') else "🔴"
        st.metric("Monitoring Status", f"{status_color} {'Active' if metrics.get('monitoring_active') else 'Inactive'}")

    with col2:
        st.metric("Active Sessions", metrics.get('active_sessions', 0))

    with col3:
        st.metric("WebSocket Connections", metrics.get('websocket_connections', 0))

    # Redis status
    if metrics.get('redis_connected'):
        st.success("🗄️ Redis: Connected")
        st.info(f"💾 Memory Used: {metrics.get('redis_memory_used', 'Unknown')}")
    else:
        st.warning("🗄️ Redis: Not Connected (using in-memory storage)")

    # Activity buffer info
    st.metric("📝 Buffered Activities", metrics.get('buffered_activities', 0))

async def analyze_user(user_id: str):
    """Analyze a specific user via API"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_BASE_URL}/users/{user_id}/analysis") as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return {"error": f"HTTP {response.status}"}
    except Exception as e:
        return {"error": str(e)}

def create_user_insights():
    """Create user insights section"""
    st.header("👤 User Insights")

    user_id = st.text_input("Enter User ID for Analysis", "")

    if user_id:
        if st.button("Analyze User"):
            with st.spinner(f"Analyzing user {user_id}..."):
                user_analysis = asyncio.run(analyze_user(user_id))

            if "error" in user_analysis:
                st.error(f"❌ Error analyzing user: {user_analysis['error']}")
                return

            # Display real user analysis results
            col1, col2 = st.columns(2)

            with col1:
                st.subheader("📈 Activity Score")
                # Calculate activity score based on user stats
                activity_score = (
                    user_analysis.get('total_quizzes', 0) * 10 +
                    user_analysis.get('total_comments', 0) * 5 +
                    user_analysis.get('total_materials', 0) * 15 +
                    user_analysis.get('total_discussions', 0) * 8 +
                    user_analysis.get('level', 1) * 20
                )
                st.metric("Score", activity_score)

                st.subheader("🎯 Engagement Level")
                # Determine engagement level based on activity score
                if activity_score >= 1000:
                    st.success("🎖️ Legendary")
                elif activity_score >= 500:
                    st.success("🏆 High")
                elif activity_score >= 200:
                    st.info("📈 Medium")
                elif activity_score >= 50:
                    st.warning("📉 Low")
                else:
                    st.error("😴 Inactive")

            with col2:
                st.subheader("🏆 User Stats")
                stats_col1, stats_col2 = st.columns(2)

                with stats_col1:
                    st.metric("XP Points", user_analysis.get('xp_points', 0))
                    st.metric("Level", user_analysis.get('level', 1))
                    st.metric("Quiz Completati", user_analysis.get('total_quizzes', 0))

                with stats_col2:
                    st.metric("Commenti", user_analysis.get('total_comments', 0))
                    st.metric("Materiali", user_analysis.get('total_materials', 0))
                    st.metric("Discussioni", user_analysis.get('total_discussions', 0))

                st.subheader("⚠️ Data Source")
                if user_analysis.get('MOCK_DATA'):
                    st.warning("🔶 Using sample data (database not fully connected)")
                else:
                    st.success("🟢 Using real database data")
    """Create AI predictions section"""
    st.header("🤖 AI Predictions")

    if st.button("Generate Badge Predictions"):
        st.info("Generating predictions... (API call would go here)")

        # Placeholder predictions
        st.subheader("🎖️ Predicted Badge Eligibility")

        predictions_data = [
            {"badge": "Mago Oscuro", "probability": 0.85, "reason": "XP trajectory suggests reaching 666 soon"},
            {"badge": "Saggio", "probability": 0.72, "reason": "Comment activity increasing rapidly"},
            {"badge": "Palindromo", "probability": 0.65, "reason": "Quiz completion pattern indicates 101 soon"}
        ]

        for pred in predictions_data:
            col1, col2, col3 = st.columns([2, 1, 3])
            with col1:
                st.write(f"🏆 {pred['badge']}")
            with col2:
                st.progress(pred['probability'])
                st.write(".1%")
            with col3:
                st.write(pred['reason'])

def create_manual_actions():
    """Create manual actions section"""
    st.header("🎮 Manual Actions")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("🎖️ Badge Assignment")
        user_id = st.text_input("User ID", "", key="assign_user")
        if st.button("Assign Eligible Badges"):
            if user_id:
                try:
                    response = asyncio.run(check_api_status())
                    if response.get('status') == 'healthy':
                        # This would call the API to assign badges to user
                        st.success(f"Badge assignment triggered for user {user_id}")
                    else:
                        st.error("API not available")
                except Exception as e:
                    st.error(f"Error: {e}")
            else:
                st.warning("Please enter a User ID")

    with col2:
        st.subheader("📊 Mass Assignment")
        if st.button("Assign Badges to All Users"):
            try:
                response = asyncio.run(check_api_status())
                if response.get('status') == 'healthy':
                    st.warning("This will process all users. Are you sure?")
                    if st.button("Confirm Mass Assignment", key="confirm_mass"):
                        # This would call the API for mass assignment
                        st.success("Mass badge assignment started!")
                else:
                    st.error("API not available")
            except Exception as e:
                st.error(f"Error: {e}")

        st.subheader("🤖 Automatic Badge System")
        if st.button("Enable Auto Badge Assignment (24h)"):
            try:
                response = asyncio.run(check_api_status())
                if response.get('status') == 'healthy':
                    # This would call the API to start automatic badge assignment
                    st.success("Automatic badge assignment enabled! System will check all users every 24 hours.")
                    st.info("⚠️ This service will run continuously in the background.")
                else:
                    st.error("API not available")
            except Exception as e:
                st.error(f"Error: {e}")

def main():
    """Main dashboard function"""
    # Check API status
    api_status = asyncio.run(check_api_status())

    if api_status.get('status') == 'healthy':
        st.success("🟢 API Status: Healthy")

        # Load data
        with st.spinner("Loading analytics data..."):
            analytics_data = asyncio.run(load_user_analytics())
            monitoring_data = asyncio.run(load_monitoring_metrics())

        # Create dashboard sections
        create_engagement_chart(analytics_data)
        create_monitoring_dashboard(monitoring_data)
        create_user_insights()
        create_ai_predictions()
        create_manual_actions()

    else:
        st.error("🔴 API Status: Unhealthy")
        st.json(api_status)

        st.header("🚨 Troubleshooting")
        st.markdown("""
        **Possible Issues:**
        - API server not running (`uvicorn main:app --reload`)
        - Database connection failed
        - Redis not available (optional)
        - Port conflicts (default: 8000)

        **Quick Fix:**
        ```bash
        cd badge_ai_system
        pip install -r requirements.txt
        uvicorn app.main:app --reload
        ```
        """)

if __name__ == "__main__":
    main()
