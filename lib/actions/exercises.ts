"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { awardXP } from "./gamification"

export async function getExercises(subjectId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("exercises")
    .select(`
      *,
      created_by_user:users!exercises_created_by_fkey(id, full_name, avatar_url),
      subject:subjects(id, name, color)
    `)
    .order("created_at", { ascending: false })

  if (subjectId) {
    query = query.eq("subject_id", subjectId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getExerciseById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("exercises")
    .select(`
      *,
      created_by_user:users!exercises_created_by_fkey(id, full_name, avatar_url, role),
      subject:subjects(id, name, color)
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createExercise(formData: {
  title: string
  description: string
  question: string
  answer: string
  hint?: string
  difficulty: string
  subject_id: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  const { data, error } = await supabase
    .from("exercises")
    .insert({
      ...formData,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  await awardXP(user.id, 25, "Creazione esercizio")

  revalidatePath("/esercizi")
  return data
}

export async function updateExercise(
  id: string,
  formData: Partial<{
    title: string
    description: string
    question: string
    answer: string
    hint: string
    difficulty: string
  }>,
) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("exercises").update(formData).eq("id", id).select().single()

  if (error) throw error

  revalidatePath("/esercizi")
  revalidatePath(`/esercizi/${id}`)
  return data
}

export async function deleteExercise(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin" && userData?.role !== "hacker") {
    throw new Error("Solo amministratori e hacker possono eliminare esercizi")
  }

  const { error } = await supabase.from("exercises").delete().eq("id", id)

  if (error) throw error

  revalidatePath("/esercizi")
}

export async function incrementExerciseViews(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc("increment_exercise_views", {
    exercise_id: id,
  })

  if (error) console.error("Error incrementing views:", error)
}
