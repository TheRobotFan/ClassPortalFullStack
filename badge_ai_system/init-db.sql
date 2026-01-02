-- Initialize database schema
-- This script runs automatically when PostgreSQL container starts

-- Create database and tables if they don't exist
CREATE DATABASE IF NOT EXISTS classeviva;

-- Connect to the database
\c classeviva;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with role-based access
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'student',
  bio TEXT,
  class_id UUID,
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_active_days INTEGER DEFAULT 0,
  consecutive_active_days INTEGER DEFAULT 0,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  requirement_type VARCHAR(50),
  requirement_value INTEGER,
  rarity VARCHAR(20) DEFAULT 'common',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User badges (earned achievements)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_id)
);

-- System logs
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);

-- Insert sample data for testing
INSERT INTO users (email, full_name, xp_points, level, total_active_days, consecutive_active_days)
VALUES
  ('test@example.com', 'Test User', 150, 3, 25, 7),
  ('student@example.com', 'Student Example', 75, 2, 12, 3)
ON CONFLICT (email) DO NOTHING;

-- Sample badges for testing
INSERT INTO badges (name, description, requirement_type, requirement_value, rarity)
VALUES
  ('Benvenuto', 'Primo accesso alla piattaforma', 'profile_completed', 1, 'foundation'),
  ('Mago Oscuro', '666 punti esperienza', 'xp_earned', 666, 'legendary'),
  ('Amministratore Supremo', 'Ruolo amministratore', 'profile_completed', 1, 'staff')
ON CONFLICT (name) DO NOTHING;

-- Sample user badges
INSERT INTO user_badges (user_id, badge_id)
SELECT u.id, b.id
FROM users u
CROSS JOIN badges b
WHERE u.email = 'test@example.com' AND b.name = 'Benvenuto'
ON CONFLICT (user_id, badge_id) DO NOTHING;

COMMIT;
