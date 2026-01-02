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

  // Fetch user stats, badges, and contributions (tollerando eventuali errori)
  let stats: Awaited<ReturnType<typeof getUserStats>> | null = null
  let badges: Awaited<ReturnType<typeof getUserBadges>> | null = null

  try {
    ;[stats, badges] = await Promise.all([getUserStats(user.id), getUserBadges(user.id)])
  } catch (error) {
    console.error("Error loading profile data:", error)
    // Valori di fallback per evitare il crash della pagina
    stats = {
      xp: (user as any).xp_points ?? 0,
      level: (user as any).level ?? 1,
      streak: 0,
      totalActiveDays: 0,
      quizzes: 0,
      materials: 0,
      discussions: 0,
      comments: 0,
      projects: 0,
      exercises: 0,
      totalContributions: 0,
    }
    badges = []
  }

  return <ProfiloClient user={user} stats={stats} badges={badges ?? []} />
}
