"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { awardXP } from "./gamification"

export async function getDiscussions(subjectId?: string, category?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("forum_discussions")
    .select(`
      *,
      user:users!forum_discussions_user_id_fkey(id, full_name, avatar_url),
      subject:subjects(id, name, color)
    `)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })

  if (subjectId) {
    query = query.eq("subject_id", subjectId)
  }

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getDiscussionById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("forum_discussions")
    .select(`
      *,
      user:users!forum_discussions_user_id_fkey(id, full_name, avatar_url, role),
      subject:subjects(id, name, color)
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createDiscussion(formData: {
  title: string
  content: string
  category: string
  subject_id: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  const { data, error } = await supabase
    .from("forum_discussions")
    .insert({
      ...formData,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  await awardXP(user.id, 15, "Creazione discussione")

  revalidatePath("/forum")
  return data
}

export async function getForumComments(discussionId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("forum_comments")
    .select(`
      *,
      user:users!forum_comments_user_id_fkey(id, full_name, avatar_url, role)
    `)
    .eq("discussion_id", discussionId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return data
}

export async function createForumComment(discussionId: string, content: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

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

  revalidatePath(`/forum/${discussionId}`)
  return data
}

export async function deleteDiscussion(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin" && userData?.role !== "hacker") {
    throw new Error("Solo amministratori e hacker possono eliminare discussioni")
  }

  // Delete comments first (due to foreign key constraint)
  const { error: commentsError } = await supabase
    .from("forum_comments")
    .delete()
    .eq("discussion_id", id)

  if (commentsError) {
    console.error("Error deleting forum comments:", commentsError)
    throw new Error("Errore nell'eliminazione dei commenti della discussione")
  }

  // Delete the discussion
  const { error: discussionError } = await supabase
    .from("forum_discussions")
    .delete()
    .eq("id", id)

  if (discussionError) {
    console.error("Error deleting forum discussion:", discussionError)
    throw new Error("Errore nell'eliminazione della discussione")
  }

  revalidatePath("/forum")
  return { success: true }
}
