import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getUserById, getUserBadges } from "@/lib/actions/user"
import { UserProfileClient } from "@/components/user-profile-client"

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/auth/login")
  }

  const { data: authRow } = await supabase.from("users").select("role").eq("id", authUser.id).single()

  const role = authRow?.role || "student"
  const canViewOthers = role === "admin" || role === "hacker" || role === "teacher" || role === "staff"

  if (!canViewOthers && authUser.id !== params.id) {
    redirect(`/utente/${authUser.id}`)
  }

  const user = await getUserById(params.id)

  if (!user) {
    redirect("/")
  }

  const badges = await getUserBadges(user.id)

  return <UserProfileClient user={user} badges={badges} isOwnProfile={true} />
}
