"use server"

import { createClient } from "@/lib/supabase/server"

export async function getFeaturedContributors() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("featured_contributors")
    .select("id, user_id, contributions, stars, display_order, created_at, updated_at")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching featured contributors:", error)
    return []
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    user_id: item.user_id,
    contributions: item.contributions,
    stars: item.stars,
    display_order: item.display_order,
    full_name: "Utente",
    avatar_url: null,
    xp_points: 0,
    level: 1,
  }))
}

export async function addFeaturedContributor(
  userId: string,
  contributions: number,
  stars: number,
  displayOrder: number,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("featured_contributors")
    .insert({
      user_id: userId,
      contributions,
      stars,
      display_order: displayOrder,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFeaturedContributor(
  id: string,
  contributions: number,
  stars: number,
  displayOrder: number,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("featured_contributors")
    .update({
      contributions,
      stars,
      display_order: displayOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeFeaturedContributor(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("featured_contributors").delete().eq("id", id)

  if (error) throw error
}
