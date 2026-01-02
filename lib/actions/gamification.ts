"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function awardXP(userId: string, xpAmount: number, reason: string) {
  const supabase = await createClient()
  // Do not award XP to admins
  const { data: userRow } = await supabase.from("users").select("role, xp_points, level").eq("id", userId).single()

  if (userRow?.role === "admin") {
    return { success: false, xp: 0, leveledUp: false }
  }

  const { data, error: xpError } = await supabase.rpc("add_user_xp", {
    user_id: userId,
    xp_amount: xpAmount,
  })

  if (xpError) throw xpError

  // Check and award badges
  await checkAndAwardBadges(userId)

  // Create notification for XP earned
  await createNotification(userId, "xp_earned", `Hai guadagnato ${xpAmount} XP per: ${reason}`)

  // If leveled up, create level up notification
  if (data && data[0]?.leveled_up) {
    await createNotification(userId, "level_up", `Congratulazioni! Hai raggiunto il livello ${data[0].new_level}!`)
  }

  revalidatePath("/utente")
  revalidatePath("/dashboard")
  return { success: true, xp: xpAmount, leveledUp: data?.[0]?.leveled_up || false }
}

export async function checkAndAwardBadges(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc("check_and_award_badges", {
    user_id: userId,
  })

  if (error) console.error("Error checking badges:", error)

  revalidatePath("/utente")
}

export async function createNotification(userId: string, type: string, message: string, relatedId?: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    message,
    title: getNotificationTitle(type),
    related_id: relatedId,
  })

  if (error) console.error("Error creating notification:", error)

  revalidatePath("/notifiche")
}

function getNotificationTitle(type: string): string {
  const titles: Record<string, string> = {
    xp_earned: "XP Guadagnati",
    badge_earned: "Nuovo Badge",
    level_up: "Livello Aumentato",
    comment_reply: "Nuova Risposta",
    exercise_completed: "Esercizio Completato",
    quiz_completed: "Quiz Completato",
    material_uploaded: "Appunto Caricato",
    discussion_created: "Discussione Creata",
  }
  return titles[type] || "Notifica"
}

export async function getUserNotifications(userId: string, limit = 20) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

  if (error) throw error

  revalidatePath("/utente")
  revalidatePath("/notifiche")
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)

  if (error) throw error

  revalidatePath("/notifiche")
}

export async function getUserStats(userId: string) {
  const supabase = await createClient()

  // Get user data
  const { data: user } = await supabase
    .from("users")
    .select("xp_points, level, consecutive_active_days, total_active_days")
    .eq("id", userId)
    .single()

  // Get quiz attempts count
  const { count: quizCount } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  // Get materials uploaded count
  const { count: materialsCount } = await supabase
    .from("materials")
    .select("*", { count: "exact", head: true })
    .eq("uploaded_by", userId)

  // Get forum discussions count
  const { count: discussionsCount } = await supabase
    .from("forum_discussions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  // Get forum comments count
  const { count: commentsCount } = await supabase
    .from("forum_comments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  // Get projects count
  const { count: projectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  // Get exercises count
  const { count: exercisesCount } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true })
    .eq("created_by", userId)

  console.log("Stats for user", userId, {
    quizCount,
    materialsCount,
    discussionsCount,
    commentsCount,
    projectsCount,
    exercisesCount
  })

  return {
    xp: user?.xp_points || 0,
    level: user?.level || 1,
    streak: user?.consecutive_active_days || 0,
    totalActiveDays: user?.total_active_days || 0,
    quizzes: quizCount || 0,
    materials: materialsCount || 0,
    discussions: discussionsCount || 0,
    comments: commentsCount || 0,
    projects: projectsCount || 0,
    exercises: exercisesCount || 0,
    totalContributions: (materialsCount || 0) + (discussionsCount || 0) + (commentsCount || 0) + (projectsCount || 0) + (exercisesCount || 0),
  }
}

export async function getLeaderboard(limit = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, first_name, last_name, xp_points, level, avatar_url")
    .order("xp_points", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getUserRank(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_user_rank", {
    user_id: userId,
  })

  if (error) throw error
  return data
}

export async function getBadgesWithProgress(userId: string) {
  const supabase = await createClient()

  // Get all badges
  const { data: allBadges, error: badgesError } = await supabase
    .from("badges")
    .select("*")
    .order("requirement_value", { ascending: true })

  if (badgesError) throw badgesError

  // Get user's earned badges
  const { data: earnedBadges, error: earnedError } = await supabase
    .from("user_badges")
    .select("badge_id, earned_at")
    .eq("user_id", userId)

  if (earnedError) throw earnedError

  // Get user stats for progress calculation
  const stats = await getUserStats(userId)

  // Combine data
  return allBadges?.map((badge) => {
    const earned = earnedBadges?.find((eb) => eb.badge_id === badge.id)
    let progress = 0

    // Calculate progress based on requirement type
    switch (badge.requirement_type) {
      case "materials_uploaded":
        progress = stats.materials
        break
      case "discussions_created":
        progress = stats.discussions
        break
      case "comments_posted":
        progress = stats.comments
        break
      case "quizzes_completed":
        progress = stats.quizzes
        break
      case "xp_earned":
        progress = stats.xp
        break
      case "level_reached":
        progress = stats.level
        break
      case "consecutive_days":
        progress = stats.streak
        break
      case "total_active_days":
        progress = stats.totalActiveDays
        break
    }

    return {
      ...badge,
      earned: !!earned,
      earned_at: earned?.earned_at,
      progress,
      progress_percentage: Math.min((progress / badge.requirement_value) * 100, 100),
    }
  })
}
