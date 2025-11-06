import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  subject_id: z.string().uuid().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  time_limit: z.number().positive().optional(),
  passing_score: z.number().min(0).max(100).optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = params

  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        *,
        subject:subjects(name, color),
        created_by_user:users(full_name),
        quiz_questions(
          id,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          explanation,
          order_index
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Quiz GET error:", error)
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Don't include correct answers in the response for students taking the quiz
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      const { data: user } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single()

      // Hide correct answers from students
      if (user?.role === "student") {
        data.quiz_questions = data.quiz_questions.map((q: any) => ({
          ...q,
          correct_answer: undefined,
          explanation: undefined,
        }))
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Quiz GET unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = params
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = updateQuizSchema.parse(body)

    // Check if user owns the quiz or is admin/teacher
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("created_by")
      .eq("id", id)
      .single()

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    const canEdit = quiz.created_by === session.user.id || ["admin", "teacher"].includes(user?.role || "")

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("quizzes")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Quiz PUT error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Quiz PUT unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = params
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if user owns the quiz or is admin
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("created_by")
      .eq("id", id)
      .single()

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    const canDelete = quiz.created_by === session.user.id || user?.role === "admin"

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase.from("quizzes").delete().eq("id", id)

    if (error) {
      console.error("Quiz DELETE error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Quiz deleted successfully" })
  } catch (error) {
    console.error("Quiz DELETE unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
