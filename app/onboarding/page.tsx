import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingForm } from "@/components/onboarding-form"

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect("/auth/login")
  }

  // Check if user exists and profile is completed
  const { data: user } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  if (user?.profile_completed) {
    redirect("/guida")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <OnboardingForm user={user} authUser={authUser} />
    </div>
  )
}
