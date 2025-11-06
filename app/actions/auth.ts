"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function signUp(email: string, password: string, fullName: string, role: string) {
  const supabase = await createClient()

  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  // Create user profile
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user?.id,
    email,
    full_name: fullName,
    role,
    xp_points: 0,
    level: 1,
    profile_completed: false,
    is_active: true,
    consecutive_active_days: 0,
    total_active_days: 0,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  revalidatePath("/")
  return { success: true }
}
