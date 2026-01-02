import { Navbar } from "@/components/navbar"
import { FeaturedContributorsManager } from "@/components/featured-contributors-manager"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function FeaturedContributorsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Consenti l'accesso a questa pagina ad admin e hacker
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin" && userData?.role !== "hacker") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestione Top Contributori</h1>
          <p className="text-foreground/60">Seleziona e gestisci i contributori in evidenza sulla home page</p>
        </div>
        <FeaturedContributorsManager />
      </div>
    </div>
  )
}
