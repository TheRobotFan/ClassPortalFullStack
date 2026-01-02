"""
AI Model Training Script
Train machine learning models for user behavior analysis
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report
import joblib
import os
import logging
from datetime import datetime
import asyncio

from app.database import db_manager

logger = logging.getLogger(__name__)

class ModelTrainer:
    """Train and update AI models for the badge system"""

    def __init__(self):
        self.models_path = "ai/models"
        self.scaler = StandardScaler()
        os.makedirs(self.models_path, exist_ok=True)

    async def collect_training_data(self) -> pd.DataFrame:
        """Collect training data from the database"""
        logger.info("📊 Collecting training data...")

        try:
            # Query to get comprehensive user data
            query = """
            SELECT
                u.id,
                u.xp_points,
                u.level,
                u.total_active_days,
                u.consecutive_active_days,
                u.created_at,
                EXTRACT(EPOCH FROM (NOW() - u.created_at)) / 86400 as account_age_days,
                COALESCE(q.quiz_count, 0) as total_quizzes,
                COALESCE(c.comment_count, 0) as total_comments,
                COALESCE(m.material_count, 0) as total_materials,
                COALESCE(d.discussion_count, 0) as total_discussions,
                COALESCE(b.badge_count, 0) as badge_count,
                -- Activity in last 7 days
                COALESCE(a7.quiz_7d, 0) as quizzes_7d,
                COALESCE(a7.comments_7d, 0) as comments_7d,
                COALESCE(a7.materials_7d, 0) as materials_7d,
                -- Activity in last 30 days
                COALESCE(a30.quiz_30d, 0) as quizzes_30d,
                COALESCE(a30.comments_30d, 0) as comments_30d,
                COALESCE(a30.materials_30d, 0) as materials_30d
            FROM users u
            LEFT JOIN (SELECT user_id, COUNT(*) as quiz_count FROM quiz_attempts GROUP BY user_id) q ON u.id = q.user_id
            LEFT JOIN (SELECT user_id, COUNT(*) as comment_count FROM forum_comments GROUP BY user_id) c ON u.id = c.user_id
            LEFT JOIN (SELECT uploaded_by, COUNT(*) as material_count FROM materials GROUP BY uploaded_by) m ON u.id = m.uploaded_by
            LEFT JOIN (SELECT user_id, COUNT(*) as discussion_count FROM forum_discussions GROUP BY user_id) d ON u.id = d.user_id
            LEFT JOIN (SELECT user_id, COUNT(*) as badge_count FROM user_badges GROUP BY user_id) b ON u.id = b.user_id
            -- 7-day activity
            LEFT JOIN (
                SELECT user_id,
                       COUNT(CASE WHEN activity_type = 'quiz' THEN 1 END) as quiz_7d,
                       COUNT(CASE WHEN activity_type = 'comment' THEN 1 END) as comments_7d,
                       COUNT(CASE WHEN activity_type = 'material' THEN 1 END) as materials_7d
                FROM (
                    SELECT qa.user_id, 'quiz' as activity_type, qa.completed_at as activity_date
                    FROM quiz_attempts qa
                    UNION ALL
                    SELECT ec.user_id, 'comment', ec.created_at
                    FROM forum_comments ec
                    UNION ALL
                    SELECT m.uploaded_by, 'material', m.created_at
                    FROM materials m
                ) activities
                WHERE activity_date >= NOW() - INTERVAL '7 days'
                GROUP BY user_id
            ) a7 ON u.id = a7.user_id
            -- 30-day activity
            LEFT JOIN (
                SELECT user_id,
                       COUNT(CASE WHEN activity_type = 'quiz' THEN 1 END) as quiz_30d,
                       COUNT(CASE WHEN activity_type = 'comment' THEN 1 END) as comments_30d,
                       COUNT(CASE WHEN activity_type = 'material' THEN 1 END) as materials_30d
                FROM (
                    SELECT qa.user_id, 'quiz' as activity_type, qa.completed_at as activity_date
                    FROM quiz_attempts qa
                    UNION ALL
                    SELECT ec.user_id, 'comment', ec.created_at
                    FROM forum_comments ec
                    UNION ALL
                    SELECT m.uploaded_by, 'material', m.created_at
                    FROM materials m
                ) activities
                WHERE activity_date >= NOW() - INTERVAL '30 days'
                GROUP BY user_id
            ) a30 ON u.id = a30.user_id
            WHERE u.created_at < NOW() - INTERVAL '1 day'  -- Users older than 1 day
            LIMIT 10000  -- Limit for training
            """

            rows = await db_manager.execute_query(query)
            df = pd.DataFrame(rows)

            logger.info(f"✅ Collected {len(df)} training samples")
            return df

        except Exception as e:
            logger.error(f"❌ Error collecting training data: {e}")
            raise

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create additional features for ML models"""
        logger.info("🔧 Engineering features...")

        # Activity ratios
        df['quiz_ratio'] = df['total_quizzes'] / (df['account_age_days'] + 1)
        df['comment_ratio'] = df['total_comments'] / (df['account_age_days'] + 1)
        df['material_ratio'] = df['total_materials'] / (df['account_age_days'] + 1)

        # Engagement scores
        df['activity_score'] = (
            df['total_quizzes'] * 10 +
            df['total_comments'] * 5 +
            df['total_materials'] * 15 +
            df['total_discussions'] * 8 +
            df['level'] * 20
        )

        # Recent activity indicators
        df['recent_quiz_ratio'] = df['quizzes_7d'] / (df['quizzes_30d'] + 1)
        df['recent_comment_ratio'] = df['comments_7d'] / (df['comments_30d'] + 1)

        # Engagement level (target variable)
        df['engagement_level'] = pd.cut(
            df['activity_score'],
            bins=[0, 50, 200, 500, 1000, float('inf')],
            labels=['inactive', 'low', 'medium', 'high', 'legendary']
        )

        # Badge progression potential
        df['xp_to_next_milestone'] = np.where(
            df['xp_points'] < 666,
            666 - df['xp_points'],
            np.where(df['xp_points'] < 7777, 7777 - df['xp_points'], 0)
        )

        logger.info(f"✅ Engineered {len(df.columns)} features")
        return df

    def train_user_behavior_model(self, df: pd.DataFrame) -> RandomForestClassifier:
        """Train model to predict user engagement level"""
        logger.info("🧠 Training user behavior model...")

        # Features for prediction
        feature_cols = [
            'xp_points', 'level', 'total_active_days', 'consecutive_active_days',
            'account_age_days', 'total_quizzes', 'total_comments', 'total_materials',
            'total_discussions', 'badge_count', 'quizzes_7d', 'comments_7d',
            'materials_7d', 'quizzes_30d', 'comments_30d', 'materials_30d',
            'quiz_ratio', 'comment_ratio', 'material_ratio', 'activity_score',
            'recent_quiz_ratio', 'recent_comment_ratio'
        ]

        # Prepare data
        X = df[feature_cols].fillna(0)
        y = df['engagement_level']

        # Handle missing values and scale
        X_scaled = self.scaler.fit_transform(X)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )

        # Train model
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )

        model.fit(X_train, y_train)

        # Evaluate
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)

        logger.info(f"🎯 User Behavior Model Accuracy: {accuracy:.2f}")
        logger.info("📊 Classification Report:")
        logger.info("\n" + classification_report(y_test, y_pred))

        return model

    def train_badge_predictor_model(self, df: pd.DataFrame) -> GradientBoostingRegressor:
        """Train model to predict badge earning potential"""
        logger.info("🎖️ Training badge predictor model...")

        # Target: how close user is to earning legendary badges
        df['badge_potential'] = (
            (df['xp_points'] >= 600).astype(int) * 0.3 +
            (df['total_comments'] >= 750).astype(int) * 0.3 +
            (df['total_quizzes'] >= 95).astype(int) * 0.4
        )

        feature_cols = [
            'xp_points', 'level', 'total_quizzes', 'total_comments',
            'total_materials', 'badge_count', 'activity_score'
        ]

        X = df[feature_cols].fillna(0)
        y = df['badge_potential']

        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )

        model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )

        model.fit(X_train, y_train)

        # Evaluate
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)

        logger.info(f"🎖️ Badge Predictor Model - MSE: {mse:.3f}, RMSE: {rmse:.3f}")
        return model

    async def train_all_models(self):
        """Train all AI models"""
        logger.info("🚀 Starting AI model training...")

        try:
            # Collect training data
            df = await self.collect_training_data()

            if len(df) < 100:
                logger.warning("⚠️ Insufficient training data, using synthetic data")
                df = self.generate_synthetic_data()

            # Engineer features
            df = self.engineer_features(df)

            # Train models
            user_behavior_model = self.train_user_behavior_model(df)
            badge_predictor_model = self.train_badge_predictor_model(df)

            # Save models
            joblib.dump(user_behavior_model, os.path.join(self.models_path, 'user_behavior_model.pkl'))
            joblib.dump(badge_predictor_model, os.path.join(self.models_path, 'badge_predictor_model.pkl'))
            joblib.dump(self.scaler, os.path.join(self.models_path, 'feature_scaler.pkl'))

            logger.info("💾 Models saved successfully")

            # Update training metadata
            metadata = {
                'training_date': datetime.utcnow().isoformat(),
                'samples_used': len(df),
                'features_count': len(df.columns),
                'models_trained': ['user_behavior', 'badge_predictor']
            }

            with open(os.path.join(self.models_path, 'training_metadata.json'), 'w') as f:
                import json
                json.dump(metadata, f, indent=2)

            logger.info("✅ AI model training completed!")

        except Exception as e:
            logger.error(f"❌ Training failed: {e}")
            raise

    def generate_synthetic_data(self) -> pd.DataFrame:
        """Generate synthetic training data when real data is insufficient"""
        logger.info("🧪 Generating synthetic training data...")

        np.random.seed(42)
        n_samples = 1000

        data = {
            'xp_points': np.random.exponential(500, n_samples),
            'level': np.random.poisson(5, n_samples) + 1,
            'total_active_days': np.random.exponential(50, n_samples),
            'consecutive_active_days': np.random.exponential(10, n_samples),
            'account_age_days': np.random.exponential(100, n_samples),
            'total_quizzes': np.random.poisson(20, n_samples),
            'total_comments': np.random.poisson(15, n_samples),
            'total_materials': np.random.poisson(5, n_samples),
            'total_discussions': np.random.poisson(8, n_samples),
            'badge_count': np.random.poisson(3, n_samples),
            'quizzes_7d': np.random.poisson(3, n_samples),
            'comments_7d': np.random.poisson(2, n_samples),
            'materials_7d': np.random.poisson(1, n_samples),
            'quizzes_30d': np.random.poisson(10, n_samples),
            'comments_30d': np.random.poisson(8, n_samples),
            'materials_30d': np.random.poisson(3, n_samples)
        }

        df = pd.DataFrame(data)
        return df

async def main():
    """Main training function"""
    trainer = ModelTrainer()
    await trainer.train_all_models()

if __name__ == "__main__":
    asyncio.run(main())
