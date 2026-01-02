import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/actions/user"
import {
  getDashboardStats,
  getTopContributors,
  getUserRegistrationTrend,
  getContentUploadTrend,
  getActivityTrend,
  getMostViewedContent,
  getMostActiveUsers,
  getSubjectDistribution,
  getRecentActivityFeed,
} from "@/lib/actions/dashboard"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
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

  // Consenti accesso al dashboard ad admin, insegnanti e hacker
  const hasAccess = user.role === "admin" || user.role === "teacher" || user.role === "hacker"

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold mb-4">Accesso Negato</h1>
          <p className="text-foreground/70 mb-6">
            Solo amministratori, insegnanti e hacker possono accedere al dashboard.
          </p>
        </div>
      </div>
    )
  }

  const [
    stats,
    topContributors,
    userRegistrationTrend,
    contentUploadTrend,
    activityTrend,
    mostViewedContent,
    mostActiveUsers,
    subjectDistribution,
    recentActivityFeed,
  ] = await Promise.all([
    getDashboardStats(),
    getTopContributors(),
    getUserRegistrationTrend(),
    getContentUploadTrend(),
    getActivityTrend(),
    getMostViewedContent(),
    getMostActiveUsers(),
    getSubjectDistribution(),
    getRecentActivityFeed(20),
  ])

  return (
    <DashboardClient
      user={user}
      stats={stats}
      topContributors={topContributors}
      userRegistrationTrend={userRegistrationTrend}
      contentUploadTrend={contentUploadTrend}
      activityTrend={activityTrend}
      mostViewedContent={mostViewedContent}
      mostActiveUsers={mostActiveUsers}
      subjectDistribution={subjectDistribution}
      recentActivityFeed={recentActivityFeed}
    />
  )
}
