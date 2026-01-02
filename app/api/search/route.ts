import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

// Risultato unificato per la ricerca globale
interface SearchResult {
  title: string
  href: string
  category: string
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const q = (searchParams.get("q") ?? "").trim()

  if (!q) {
    return NextResponse.json<SearchResult[]>([])
  }

  const term = `%${q}%`

  // Cerchiamo in parallelo in alcune tabelle principali
  const [materialsRes, exercisesRes, quizzesRes, forumRes, projectsRes] = await Promise.all([
    supabase
      .from("materials")
      .select("id, title")
      .ilike("title", term)
      .limit(5),
    supabase
      .from("exercises")
      .select("id, title")
      .ilike("title", term)
      .limit(5),
    supabase
      .from("quizzes")
      .select("id, title")
      .ilike("title", term)
      .limit(5),
    supabase
      .from("forum_discussions")
      .select("id, title")
      .ilike("title", term)
      .limit(5),
    supabase
      .from("projects")
      .select("id, title")
      .ilike("title", term)
      .limit(5),
  ])

  const results: SearchResult[] = []

  if (!materialsRes.error && materialsRes.data) {
    for (const m of materialsRes.data) {
      results.push({
        title: m.title,
        href: `/appunti?material=${m.id}`,
        category: "Appunto",
      })
    }
  }

  if (!exercisesRes.error && exercisesRes.data) {
    for (const e of exercisesRes.data) {
      results.push({
        title: e.title,
        href: `/esercizi?exercise=${e.id}`,
        category: "Esercizio",
      })
    }
  }

  if (!quizzesRes.error && quizzesRes.data) {
    for (const qz of quizzesRes.data) {
      results.push({
        title: qz.title,
        href: `/quiz?quiz=${qz.id}`,
        category: "Quiz",
      })
    }
  }

  if (!forumRes.error && forumRes.data) {
    for (const d of forumRes.data) {
      results.push({
        title: d.title,
        href: `/forum/${d.id}`,
        category: "Discussione",
      })
    }
  }

  if (!projectsRes.error && projectsRes.data) {
    for (const p of projectsRes.data) {
      results.push({
        title: p.title,
        href: `/progetti?project=${p.id}`,
        category: "Progetto",
      })
    }
  }

  return NextResponse.json(results)
}
