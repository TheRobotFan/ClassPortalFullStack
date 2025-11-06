import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import type { User, Material, Exercise, Quiz, ForumDiscussion, Project } from "@/lib/types/database"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user has admin or teacher role
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (!user || !["admin", "teacher"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const [
      { data: usersData, error: usersError },
      { data: materialsData, error: materialsError },
      { data: exercisesData, error: exercisesError },
      { data: quizzesData, error: quizzesError },
      { data: forumData, error: forumError },
      { data: projectsData, error: projectsError },
    ] = await Promise.all([
      supabase.from("users").select("id, created_at, role, xp_points, level, full_name"),
      supabase.from("materials").select("id, created_at, subject_id, views_count, downloads_count, title"),
      supabase.from("exercises").select("id, created_at, subject_id, views_count, likes_count, title"),
      supabase.from("quizzes").select("id, created_at, subject_id, title"),
      supabase.from("forum_discussions").select("id, created_at, subject_id, views_count, replies_count, title"),
      supabase.from("projects").select("id, created_at, subject_id, status"),
    ])

    if (usersError || materialsError || exercisesError || quizzesError || forumError || projectsError) {
      console.error("Analytics data fetch error:", { usersError, materialsError, exercisesError, quizzesError, forumError, projectsError })
      return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
    }

    // Calculate trends
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const userRegistrationTrend = calculateTrend(usersData || [], thirtyDaysAgo, now)
    const contentUploadTrend = calculateContentTrend(
      materialsData || [],
      exercisesData || [],
      quizzesData || [],
      thirtyDaysAgo,
      now
    )
    const activityTrend = calculateActivityTrend(
      materialsData || [],
      exercisesData || [],
      forumData || [],
      thirtyDaysAgo,
      now
    )

    // Subject distribution
    const subjectDistribution = await calculateSubjectDistribution(supabase)

    // Top contributors
    const topContributors = (usersData || [])
      .sort((a, b) => b.xp_points - a.xp_points)
      .slice(0, 10)
      .map(({ id, full_name, xp_points, level }) => ({ id, full_name, xp_points, level }))

    // Most viewed content
    const mostViewedContent = [
      ...(materialsData || []).map(m => ({ ...m, type: 'material' })),
      ...(exercisesData || []).map(e => ({ ...e, type: 'exercise' })),
      ...(forumData || []).map(f => ({ ...f, type: 'discussion' })),
    ]
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 10)
      .map((item) => ({
        id: item.id,
        title: item.title || `Untitled ${item.type}`,
        type: item.type,
        views: item.views_count || 0,
        downloads: (item as any).downloads_count || 0,
      }))

    // Most active users
    const mostActiveUsers = (usersData || [])
      .sort((a, b) => b.xp_points - a.xp_points)
      .slice(0, 10)
      .map(({ id, full_name, xp_points, level }) => ({
        id,
        full_name,
        xp_points,
        level,
        badge_count: 0, // TODO: Calculate from user_badges table
      }))

    // Recent activity feed
    const recentActivityFeed = await getRecentActivityFeed(supabase, 20)

    const analytics = {
      overview: {
        totalUsers: usersData?.length || 0,
        totalMaterials: materialsData?.length || 0,
        totalExercises: exercisesData?.length || 0,
        totalQuizzes: quizzesData?.length || 0,
        totalDiscussions: forumData?.length || 0,
        totalProjects: projectsData?.length || 0,
        totalViews: [
          ...(materialsData || []).map(m => m.views_count || 0),
          ...(exercisesData || []).map(e => e.views_count || 0),
          ...(forumData || []).map(f => f.views_count || 0),
        ].reduce((sum, views) => sum + views, 0),
        totalContent: (materialsData?.length || 0) + (exercisesData?.length || 0) + (quizzesData?.length || 0),
      },
      trends: {
        userRegistration: userRegistrationTrend,
        contentUpload: contentUploadTrend,
        activity: activityTrend,
      },
      topContributors,
      mostViewedContent,
      mostActiveUsers,
      subjectDistribution,
      recentActivityFeed,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function calculateTrend(data: any[], startDate: Date, endDate: Date) {
  const dailyData: Record<string, number> = {}
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dailyData[dateStr] = 0
  }

  data.forEach(item => {
    const dateStr = new Date(item.created_at).toISOString().split('T')[0]
    if (dailyData.hasOwnProperty(dateStr)) {
      dailyData[dateStr]++
    }
  })

  return Object.entries(dailyData).map(([date, count]) => ({ date, count }))
}

function calculateContentTrend(materials: any[], exercises: any[], quizzes: any[], startDate: Date, endDate: Date) {
  const dailyData: Record<string, { materials: number; exercises: number; quizzes: number }> = {}
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dailyData[dateStr] = { materials: 0, exercises: 0, quizzes: 0 }
  }

  materials.forEach(item => {
    const dateStr = new Date(item.created_at).toISOString().split('T')[0]
    if (dailyData.hasOwnProperty(dateStr)) {
      dailyData[dateStr].materials++
    }
  })

  exercises.forEach(item => {
    const dateStr = new Date(item.created_at).toISOString().split('T')[0]
    if (dailyData.hasOwnProperty(dateStr)) {
      dailyData[dateStr].exercises++
    }
  })

  quizzes.forEach(item => {
    const dateStr = new Date(item.created_at).toISOString().split('T')[0]
    if (dailyData.hasOwnProperty(dateStr)) {
      dailyData[dateStr].quizzes++
    }
  })

  return Object.entries(dailyData).map(([date, counts]) => ({ date, ...counts }))
}

function calculateActivityTrend(materials: any[], exercises: any[], forum: any[], startDate: Date, endDate: Date) {
  const dailyData: Record<string, { views: number; downloads: number; forum_discussions: number }> = {}
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    dailyData[dateStr] = { views: 0, downloads: 0, forum_discussions: 0 }
  }

  // Aggregate views and downloads
  ;[...materials, ...exercises, ...forum].forEach(item => {
    const dateStr = new Date(item.created_at).toISOString().split('T')[0]
    if (dailyData.hasOwnProperty(dateStr)) {
      dailyData[dateStr].views += item.views_count || 0
      dailyData[dateStr].downloads += item.downloads_count || 0
      if (item.replies_count !== undefined) {
        dailyData[dateStr].forum_discussions++
      }
    }
  })

  return Object.entries(dailyData).map(([date, counts]) => ({ date, ...counts }))
}

async function calculateSubjectDistribution(supabase: any) {
  const { data: subjects } = await supabase.from("subjects").select("id, name")
  
  if (!subjects) return []

  const distribution = await Promise.all(
    subjects.map(async (subject: any) => {
      const [
        { count: materialsCount },
        { count: exercisesCount },
        { count: quizzesCount },
      ] = await Promise.all([
        supabase.from("materials").select("*", { count: "exact", head: true }).eq("subject_id", subject.id),
        supabase.from("exercises").select("*", { count: "exact", head: true }).eq("subject_id", subject.id),
        supabase.from("quizzes").select("*", { count: "exact", head: true }).eq("subject_id", subject.id),
      ])

      return {
        subject_name: subject.name,
        materials_count: materialsCount || 0,
        exercises_count: exercisesCount || 0,
        quizzes_count: quizzesCount || 0,
        total_count: (materialsCount || 0) + (exercisesCount || 0) + (quizzesCount || 0),
      }
    })
  )

  return distribution
}

async function getRecentActivityFeed(supabase: any, limit: number) {
  const activities: any[] = []

  // Get recent materials
  const { data: recentMaterials } = await supabase
    .from("materials")
    .select("title, created_at, user:users(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit / 4)

  recentMaterials?.forEach((item: any) => {
    activities.push({
      activity_type: "material",
      title: item.title,
      user_name: item.user?.full_name || "Unknown",
      created_at: item.created_at,
    })
  })

  // Get recent exercises
  const { data: recentExercises } = await supabase
    .from("exercises")
    .select("title, created_at, user:users(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit / 4)

  recentExercises?.forEach((item: any) => {
    activities.push({
      activity_type: "exercise",
      title: item.title,
      user_name: item.user?.full_name || "Unknown",
      created_at: item.created_at,
    })
  })

  // Get recent quizzes
  const { data: recentQuizzes } = await supabase
    .from("quizzes")
    .select("title, created_at, user:users(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit / 4)

  recentQuizzes?.forEach((item: any) => {
    activities.push({
      activity_type: "quiz",
      title: item.title,
      user_name: item.user?.full_name || "Unknown",
      created_at: item.created_at,
    })
  })

  // Get recent forum discussions
  const { data: recentForum } = await supabase
    .from("forum_discussions")
    .select("title, created_at, user:users(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit / 4)

  recentForum?.forEach((item: any) => {
    activities.push({
      activity_type: "discussion",
      title: item.title,
      user_name: item.user?.full_name || "Unknown",
      created_at: item.created_at,
    })
  })

  return activities
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
}
