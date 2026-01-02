import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BadgesClient } from "@/components/badges-client"

export default async function BadgesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user role
  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single()
  const userRole = userRow?.role || "student"

  // Get all available badges
  const { data: allBadges } = await supabase.from("badges").select("*").order("requirement_value", { ascending: true })

  // Get user's earned badges
  const { data: earnedBadges } = await supabase
    .from("user_badges")
    .select(`
      *,
      badge:badges(*)
    `)
    .eq("user_id", user.id)

  return <BadgesClient allBadges={allBadges || []} earnedBadges={earnedBadges || []} userRole={userRole} />
}
