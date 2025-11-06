"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardStats() {
  const supabase = await createClient()

  // Get real counts from database
  const [
    { count: usersCount },
    { count: materialsCount },
    { count: exercisesCount },
    { count: quizzesCount },
    { count: forumCount },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("materials").select("*", { count: "exact", head: true }),
    supabase.from("exercises").select("*", { count: "exact", head: true }),
    supabase.from("quizzes").select("*", { count: "exact", head: true }),
    supabase.from("forum_discussions").select("*", { count: "exact", head: true }),
  ])

  return {
    usersCount: usersCount || 0,
    materialsCount: materialsCount || 0,
    exercisesCount: exercisesCount || 0,
    quizzesCount: quizzesCount || 0,
    forumCount: forumCount || 0,
    totalUsers: usersCount || 0,
    totalMaterials: materialsCount || 0,
    totalExercises: exercisesCount || 0,
    totalDiscussions: forumCount || 0,
    totalViews: 0,
    totalContent: (materialsCount || 0) + (exercisesCount || 0) + (quizzesCount || 0),
  }
}

export async function getUserRegistrationTrend() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_user_registration_trend")

  if (error) {
    console.error("Error fetching user registration trend:", error)
    return []
  }

  return data || []
}

export async function getContentUploadTrend() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_content_upload_trend")

  if (error) {
    console.error("Error fetching content upload trend:", error)
    return []
  }

  return data || []
}

export async function getActivityTrend() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_activity_trend")

  if (error) {
    console.error("Error fetching activity trend:", error)
    return []
  }

  return data || []
}

export async function getMostViewedContent() {
  const supabase = await createClient()
  
  try {
    // Get materials with views
    const { data: materials, error: materialsError } = await supabase
      .from("materials")
      .select(`
        id,
        title,
        views_count,
        users:users!materials_uploaded_by_fkey(full_name)
      `)
      .order("views_count", { ascending: false })
      .limit(5)

    // Get exercises with views
    const { data: exercises, error: exercisesError } = await supabase
      .from("exercises")
      .select(`
        id,
        title,
        views_count,
        users:users!exercises_created_by_fkey(full_name)
      `)
      .order("views_count", { ascending: false })
      .limit(5)

    // Get forum discussions with views
    const { data: discussions, error: discussionsError } = await supabase
      .from("forum_discussions")
      .select(`
        id,
        title,
        views_count,
        users:users!forum_discussions_user_id_fkey(full_name)
      `)
      .order("views_count", { ascending: false })
      .limit(5)

    if (materialsError || exercisesError || discussionsError) {
      console.error("Error fetching content:", { materialsError, exercisesError, discussionsError })
      return []
    }

    // Combine and format all content
    const allContent = [
      ...(materials || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        type: 'material',
        views: m.views_count || 0,
        author: m.users?.full_name || 'Unknown'
      })),
      ...(exercises || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        type: 'exercise',
        views: e.views_count || 0,
        author: e.users?.full_name || 'Unknown'
      })),
      ...(discussions || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        type: 'discussion',
        views: d.views_count || 0,
        author: d.users?.full_name || 'Unknown'
      }))
    ]

    // Sort by views and return top 10
    return allContent
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

  } catch (error) {
    console.error("Error in getMostViewedContent:", error)
    return []
  }
}

export async function getMostActiveUsers() {
  const supabase = await createClient()
  
  try {
    // Get users with their contribution counts
    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id,
        full_name,
        xp_points,
        level,
        materials_count:materials(count),
        exercises_count:exercises(count),
        discussions_count:forum_discussions(count)
      `)
      .order("xp_points", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching most active users:", error)
      return []
    }

    // Calculate total contributions
    return (users || []).map((user: any) => ({
      id: user.id,
      full_name: user.full_name,
      contributions: (user.materials_count?.[0]?.count || 0) + (user.exercises_count?.[0]?.count || 0) + (user.discussions_count?.[0]?.count || 0),
      xp_points: user.xp_points || 0
    }))

  } catch (error) {
    console.error("Error in getMostActiveUsers:", error)
    return []
  }
}

export async function getSubjectDistribution() {
  const supabase = await createClient()
  
  try {
    // Get all subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("id, name, color")

    if (subjectsError) {
      console.error("Error fetching subjects:", subjectsError)
      return []
    }

    // Get content counts for each subject
    const distribution = await Promise.all(
      (subjects || []).map(async (subject) => {
        const [
          { count: materialsCount },
          { count: exercisesCount },
          { count: quizzesCount }
        ] = await Promise.all([
          supabase.from("materials").select("*", { count: "exact", head: true }).eq("subject_id", subject.id),
          supabase.from("exercises").select("*", { count: "exact", head: true }).eq("subject_id", subject.id),
          supabase.from("quizzes").select("*", { count: "exact", head: true }).eq("subject_id", subject.id)
        ])

        const total = (materialsCount || 0) + (exercisesCount || 0) + (quizzesCount || 0)

        return {
          subject_name: subject.name,
          materials_count: materialsCount || 0,
          exercises_count: exercisesCount || 0,
          quizzes_count: quizzesCount || 0,
          total_count: total,
          color: subject.color
        }
      })
    )

    // Return only subjects with content
    return distribution.filter(item => item.total_count > 0)

  } catch (error) {
    console.error("Error in getSubjectDistribution:", error)
    return []
  }
}

export async function getRecentActivityFeed(limit = 20) {
  const supabase = await createClient()

  try {
    // Get recent materials
    const { data: materials } = await supabase
      .from("materials")
      .select(`
        id,
        title,
        created_at,
        views_count,
        downloads_count,
        uploaded_by,
        users:uploaded_by (full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(Math.ceil(limit / 3))

    // Get recent exercises
    const { data: exercises } = await supabase
      .from("exercises")
      .select(`
        id,
        title,
        created_at,
        views_count,
        likes_count,
        created_by,
        users:created_by (full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(Math.ceil(limit / 3))

    // Get recent forum discussions
    const { data: discussions } = await supabase
      .from("forum_discussions")
      .select(`
        id,
        title,
        created_at,
        views_count,
        likes_count,
        replies_count,
        user_id,
        users:user_id (full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(Math.ceil(limit / 3))

    // Combine and format all activities
    const activities = [
      ...(materials || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        activity_type: "material",
        created_at: m.created_at,
        user_name: m.users?.full_name || "Utente",
        views: m.views_count || 0,
        likes: m.downloads_count || 0,
        comments: 0,
      })),
      ...(exercises || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        activity_type: "exercise",
        created_at: e.created_at,
        user_name: e.users?.full_name || "Utente",
        views: e.views_count || 0,
        likes: e.likes_count || 0,
        comments: 0,
      })),
      ...(discussions || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        activity_type: "discussion",
        created_at: d.created_at,
        user_name: d.users?.full_name || "Utente",
        views: d.views_count || 0,
        likes: d.likes_count || 0,
        comments: d.replies_count || 0,
      })),
    ]

    // Sort by created_at and limit
    return activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  } catch (error) {
    console.error("Error fetching recent activity feed:", error)
    return []
  }
}

export async function getRecentActivity() {
  const supabase = await createClient()

  // Get recent materials, exercises, and quizzes
  const { data: recentMaterials } = await supabase
    .from("materials")
    .select("id, title, created_at, type")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentExercises } = await supabase
    .from("exercises")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentQuizzes } = await supabase
    .from("quizzes")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  return {
    materials: recentMaterials || [],
    exercises: recentExercises || [],
    quizzes: recentQuizzes || [],
  }
}

export async function getTopContributors() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("users")
    .select("id, full_name, xp_points, level")
    .order("xp_points", { ascending: false })
    .limit(5)

  return data || []
}
