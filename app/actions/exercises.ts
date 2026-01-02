"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { awardXP } from "@/lib/actions/gamification"

export async function submitExerciseComment(exerciseId: string, content: string) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Unauthorized" }
  }

  const { data, error } = await supabase
    .from("exercise_comments")
    .insert({
      exercise_id: exerciseId,
      user_id: session.user.id,
      content,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/esercizi")
  return { success: true, comment: data[0] }
}

export async function likeExercise(exerciseId: string) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // First, get current likes count
  const { data: currentExercise, error: fetchError } = await supabase
    .from("exercises")
    .select("likes_count")
    .eq("id", exerciseId)
    .single()

  if (fetchError) {
    return { error: fetchError.message }
  }

  // Then update with incremented count
  const { data, error } = await supabase
    .from("exercises")
    .update({ likes_count: (currentExercise?.likes_count || 0) + 1 })
    .eq("id", exerciseId)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/esercizi")
  return { success: true }
}

export async function unlikeExercise(exerciseId: string) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // First, get current likes count
  const { data: currentExercise, error: fetchError } = await supabase
    .from("exercises")
    .select("likes_count")
    .eq("id", exerciseId)
    .single()

  if (fetchError) {
    return { error: fetchError.message }
  }

  // Ensure likes count doesn't go below 0
  const newLikesCount = Math.max((currentExercise?.likes_count || 0) - 1, 0)

  // Then update with decremented count
  const { data, error } = await supabase
    .from("exercises")
    .update({ likes_count: newLikesCount })
    .eq("id", exerciseId)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/esercizi")
  return { success: true }
}
