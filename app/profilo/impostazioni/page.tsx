import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { SettingsClient } from "@/components/settings-client"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentUser } from "@/lib/actions/user"
import { getUserSettings } from "@/lib/actions/settings"
import { redirect } from "next/navigation"

function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-8" />
      <Card className="p-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-4 w-4 mt-1" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default async function ImpostazioniPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const settings = await getUserSettings(user.id)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<SettingsLoading />}>
        <SettingsClient userId={user.id} initialSettings={settings} />
      </Suspense>
    </div>
  )
}
