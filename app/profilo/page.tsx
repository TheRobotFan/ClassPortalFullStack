import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser, getUserBadges } from "@/lib/actions/user"
import { getUserStats } from "@/lib/actions/gamification"
import { ProfiloClient } from "@/components/profilo-client"

export default async function ProfiloPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/auth/login")
  }

  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user stats, badges, and contributions
  const [stats, badges] = await Promise.all([getUserStats(user.id), getUserBadges(user.id)])

  return <ProfiloClient user={user} stats={stats} badges={badges} />
}
