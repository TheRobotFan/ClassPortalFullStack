export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type User = {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: "student" | "teacher" | "staff" | "admin"
  bio?: string
  class_id?: string
  xp_points: number
  level: number
  created_at: string
  updated_at: string
  is_active: boolean
  profile_completed: boolean
}

export type Subject = {
  id: string
  name: string
  description?: string
  color?: string
  created_at: string
}

export type Material = {
  id: string
  title: string
  description?: string
  subject_id?: string
  file_url?: string
  file_type?: string
  file_size?: number
  uploaded_by?: string
  views_count: number
  downloads_count: number
  tags?: string[]
  created_at: string
  updated_at: string
}

export type Exercise = {
  id: string
  title: string
  description: string
  subject_id?: string
  difficulty: "easy" | "medium" | "hard"
  question: string
  answer: string
  hint?: string
  created_by?: string
  views_count: number
  likes_count: number
  created_at: string
  updated_at: string
}

export type ExerciseComment = {
  id: string
  exercise_id: string
  user_id: string
  content: string
  likes_count: number
  created_at: string
  updated_at: string
}

export type Quiz = {
  id: string
  title: string
  description?: string
  subject_id?: string
  difficulty: "easy" | "medium" | "hard"
  time_limit?: number
  passing_score: number
  total_questions?: number
  created_by?: string
  created_at: string
  updated_at: string
}

export type QuizQuestion = {
  id: string
  quiz_id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation?: string
  order_index?: number
}

export type QuizAttempt = {
  id: string
  quiz_id: string
  user_id: string
  score?: number
  percentage?: number
  answers: Json
  completed_at?: string
  started_at: string
}

export type ForumDiscussion = {
  id: string
  title: string
  content: string
  subject_id?: string
  category?: string
  user_id: string
  views_count: number
  replies_count: number
  likes_count: number
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export type ForumComment = {
  id: string
  discussion_id: string
  user_id: string
  content: string
  likes_count: number
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  title: string
  description?: string
  subject_id?: string
  status: "planning" | "in_progress" | "completed"
  start_date?: string
  end_date?: string
  budget?: number
  spent: number
  progress_percentage: number
  created_by?: string
  created_at: string
  updated_at: string
}

export type ProjectMember = {
  id: string
  project_id: string
  user_id: string
  role: "leader" | "member"
  joined_at: string
}

export type ProjectDiscussion = {
  id: string
  project_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export type Badge = {
  id: string
  name: string
  description?: string
  icon_url?: string
  requirement_type?: string
  requirement_value?: number
  created_at: string
}

export type UserBadge = {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message?: string
  type?: string
  related_id?: string
  is_read: boolean
  created_at: string
}

// Enhanced types with relations
export type MaterialWithRelations = Material & {
  subject?: Subject | null
  uploaded_by_user?: Pick<User, "full_name" | "avatar_url"> | null
}

export type ExerciseWithRelations = Exercise & {
  subject?: Subject | null
  created_by_user?: Pick<User, "full_name" | "avatar_url"> | null
  exercise_comments?: Array<{
    id: string
    content: string
    likes_count: number
    created_at: string
    user: Pick<User, "full_name" | "avatar_url">
  }>
}

export type QuizWithRelations = Quiz & {
  subject?: Subject | null
  created_by_user?: Pick<User, "full_name"> | null
  quiz_questions?: QuizQuestion[]
}

export type QuizAttemptWithRelations = QuizAttempt & {
  quiz?: Pick<Quiz, "title" | "difficulty" | "passing_score">
  user?: Pick<User, "full_name" | "avatar_url">
}

export type ForumDiscussionWithRelations = ForumDiscussion & {
  subject?: Subject | null
  user: Pick<User, "full_name" | "avatar_url">
  forum_comments?: Array<{
    id: string
    content: string
    likes_count: number
    created_at: string
    user: Pick<User, "full_name" | "avatar_url">
  }>
}

export type ProjectWithRelations = Project & {
  subject?: Subject | null
  created_by_user?: Pick<User, "full_name" | "avatar_url"> | null
  project_members?: Array<{
    user_id: string
    role: "leader" | "member"
    user: Pick<User, "full_name" | "avatar_url">
  }>
}

// Dashboard analytics types
export interface DashboardStats {
  usersCount: number
  materialsCount: number
  exercisesCount: number
  quizzesCount: number
  forumCount: number
  totalViews: number
  totalContent: number
}

export interface DashboardAnalytics {
  overview: DashboardStats
  trends: {
    userRegistration: Array<{ date: string; count: number }>
    contentUpload: Array<{ date: string; materials: number; exercises: number; quizzes: number }>
    activity: Array<{ date: string; views: number; downloads: number; forum_discussions: number }>
  }
  topContributors: Array<{ id: string; full_name: string; xp_points: number; level: number }>
  mostViewedContent: Array<{ id: string; title: string; type: string; views: number; downloads: number }>
  mostActiveUsers: Array<{ id: string; full_name: string; xp_points: number; level: number; badge_count: number }>
  subjectDistribution: Array<{
    subject_name: string
    materials_count: number
    exercises_count: number
    quizzes_count: number
    total_count: number
  }>
  recentActivityFeed: Array<{ activity_type: string; title: string; user_name: string; created_at: string }>
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  error?: string
  message?: string
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface CreateMaterialForm {
  title: string
  description?: string
  subject_id?: string
  file_url?: string
  file_type?: string
  tags?: string[]
}

export interface CreateExerciseForm {
  title: string
  description: string
  subject_id?: string
  difficulty: "easy" | "medium" | "hard"
  question: string
  answer: string
  hint?: string
}

export interface CreateQuizForm {
  title: string
  description?: string
  subject_id?: string
  difficulty: "easy" | "medium" | "hard"
  time_limit?: number
  passing_score: number
  questions: Array<{
    question: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: string
    explanation?: string
  }>
}

export interface CreateProjectForm {
  title: string
  description?: string
  subject_id?: string
  status: "planning" | "in_progress" | "completed"
  start_date?: string
  end_date?: string
  budget?: number
}
