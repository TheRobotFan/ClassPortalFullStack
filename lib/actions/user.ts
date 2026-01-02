"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  if (error) {
    // User doesn't exist in users table, create it
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        id: authUser.id,
        email: authUser.email!,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        role: authUser.user_metadata?.role || "student",
        xp_points: 0,
        level: 1,
        profile_completed: false,
      })
      .select()
      .single()

    if (createError) throw createError
    return newUser
  }

  return data
}

export async function getUserById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export async function completeUserProfile(formData: {
  first_name: string
  last_name: string
  city?: string
  phone?: string
  birth_date?: string
  bio?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  const full_name = `${formData.first_name} ${formData.last_name}`

  const { data, error } = await supabase
    .from("users")
    .update({
      ...formData,
      full_name,
      profile_completed: true,
    })
    .eq("id", user.id)
    .select()
    .single()

  if (error) throw error

  // Award XP for completing profile (best-effort: non bloccare se fallisce)
  try {
    await supabase.rpc("add_user_xp", {
      user_id: user.id,
      xp_amount: 100,
    })
  } catch (xpError) {
    console.error("Error awarding XP for profile completion:", xpError)
  }

  // Check for badges (best-effort)
  try {
    await supabase.rpc("check_and_award_badges", {
      user_id: user.id,
    })
  } catch (badgeError) {
    console.error("Error checking/awarding badges after profile completion:", badgeError)
  }

  revalidatePath("/utente")
  revalidatePath("/dashboard")
  return data
}

export async function updateUserProfile(formData: {
  first_name?: string
  last_name?: string
  city?: string
  phone?: string
  birth_date?: string
  bio?: string
  avatar_url?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  // Update full_name if first_name or last_name changed
  const updateData: any = { ...formData }
  if (formData.first_name || formData.last_name) {
    const { data: currentUser } = await supabase
      .from("users")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single()

    const firstName = formData.first_name || currentUser?.first_name || ""
    const lastName = formData.last_name || currentUser?.last_name || ""
    updateData.full_name = `${firstName} ${lastName}`.trim()
  }

  const { data, error } = await supabase.from("users").update(updateData).eq("id", user.id).select().single()

  if (error) throw error

  revalidatePath("/utente")
  return data
}

export async function getLeaderboard(limit = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, avatar_url, xp_points, level")
    .order("xp_points", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getUserBadges(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_badges")
    .select(`
      *,
      badge:badges(*)
    `)
    .eq("user_id", userId)
    .order("earned_at", { ascending: false })

  if (error) throw error
  return data
}
