import { Navbar } from "@/components/navbar"
import { QuizCreator } from "@/components/quiz-creator"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CreateQuizPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Consenti l'accesso a creazione quiz ad admin e hacker
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin" && userData?.role !== "hacker") {
    redirect("/quiz")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Crea Nuovo Quiz</h1>
          <p className="text-foreground/60">Aggiungi un quiz per gli studenti</p>
        </div>
        <QuizCreator />
      </div>
    </div>
  )
}
