"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { awardXP } from "@/lib/actions/gamification"

export async function submitForumComment(discussionId: string, content: string) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Unauthorized" }
  }

  const { data, error } = await supabase
    .from("forum_comments")
    .insert({
      discussion_id: discussionId,
      user_id: session.user.id,
      content,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  // Increment replies count
  const { data: currentDiscussion, error: fetchError } = await supabase
    .from("forum_discussions")
    .select("replies_count")
    .eq("id", discussionId)
    .single()

  if (!fetchError) {
    await supabase
      .from("forum_discussions")
      .update({ replies_count: (currentDiscussion?.replies_count || 0) + 1 })
      .eq("id", discussionId)
  }

  await awardXP(session.user.id, 8, "Commento su discussione")

  revalidatePath("/forum")
  return { success: true, comment: data[0] }
}
