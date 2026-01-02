"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { awardXP } from "./gamification"

export async function addForumComment(discussionId: string, content: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Non autenticato")
  }

  const { data, error } = await supabase
    .from("forum_comments")
    .insert({
      discussion_id: discussionId,
      user_id: user.id,
      content,
    })
    .select()
    .single()

  if (error) throw error

  await awardXP(user.id, 8, "Commento su discussione")

  revalidatePath("/forum")
  return data
}

export async function getForumComments(discussionId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("forum_comments")
    .select(
      `
      *,
      user:users(id, full_name, avatar_url)
    `,
    )
    .eq("discussion_id", discussionId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data
}

export async function addMaterialComment(materialId: string, content: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Non autenticato")
  }

  const { data, error } = await supabase
    .from("material_comments")
    .insert({
      material_id: materialId,
      user_id: user.id,
      content,
    })
    .select()
    .single()

  if (error) throw error

  await awardXP(user.id, 5, "Commento su appunto")

  revalidatePath("/appunti")
  return data
}

export async function getMaterialComments(materialId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("material_comments")
    .select(
      `
      *,
      user:users(id, full_name, avatar_url)
    `,
    )
    .eq("material_id", materialId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data
}

export async function deleteForumComment(commentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin" && userData?.role !== "hacker") {
    throw new Error("Solo amministratori e hacker possono eliminare commenti")
  }

  const { error } = await supabase.from("forum_comments").delete().eq("id", commentId)

  if (error) throw error

  revalidatePath("/forum")
  return { success: true }
}

export async function deleteMaterialComment(commentId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin" && userData?.role !== "hacker") {
    throw new Error("Solo amministratori e hacker possono eliminare commenti")
  }

  const { error } = await supabase.from("material_comments").delete().eq("id", commentId)

  if (error) throw error

  revalidatePath("/appunti")
  return { success: true }
}
