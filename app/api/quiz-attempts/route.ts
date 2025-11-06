import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const submitQuizSchema = z.object({
  quiz_id: z.string().uuid(),
  answers: z.record(z.string(), z.string().length(1)),
  time_spent: z.number().optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const quizId = searchParams.get("quiz_id")
  const userId = searchParams.get("user_id")

  try {
    let query = supabase
      .from("quiz_attempts")
      .select(`
        *,
        quiz:quizzes(title, difficulty, passing_score),
        user:users(full_name, avatar_url)
      `)

    // Students can only see their own attempts
    const { data: currentUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (currentUser?.role === "student") {
      query = query.eq("user_id", session.user.id)
    } else {
      // Admins/teachers can filter by user
      if (userId) query = query.eq("user_id", userId)
    }

    if (quizId) query = query.eq("quiz_id", quizId)

    const { data, error } = await query.order("started_at", { ascending: false })

    if (error) {
      console.error("Quiz attempts GET error:", error)
      return NextResponse.json({ error: "Failed to fetch quiz attempts" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Quiz attempts GET unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = submitQuizSchema.parse(body)

    // Get quiz questions to calculate score
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select(`
        *,
        quiz_questions(id, correct_answer)
      `)
      .eq("id", validatedData.quiz_id)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Calculate score
    let correctAnswers = 0
    const totalQuestions = quiz.quiz_questions.length

    quiz.quiz_questions.forEach((question: any) => {
      if (validatedData.answers[question.id] === question.correct_answer) {
        correctAnswers++
      }
    })

    const score = correctAnswers
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    const passed = percentage >= quiz.passing_score

    // Create quiz attempt record
    const { data, error } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: validatedData.quiz_id,
        user_id: session.user.id,
        score,
        percentage,
        answers: validatedData.answers,
        completed_at: new Date().toISOString(),
        started_at: new Date(Date.now() - (validatedData.time_spent || 0) * 1000).toISOString(),
      })
      .select(`
        *,
        quiz:quizzes(title, passing_score)
      `)
      .single()

    if (error) {
      console.error("Quiz attempts POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Award XP for quiz completion
    if (passed) {
      await awardXpForQuiz(supabase, session.user.id, percentage, quiz.difficulty)
    }

    // Check for badge achievements
    await checkQuizBadges(supabase, session.user.id, percentage, quiz.difficulty)

    return NextResponse.json({
      ...data,
      passed,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
    }, { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Quiz attempts POST unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function awardXpForQuiz(supabase: any, userId: string, percentage: number, difficulty: string) {
  try {
    let xpAmount = 10 // Base XP

    // Bonus XP based on score
    if (percentage >= 90) xpAmount += 15
    else if (percentage >= 80) xpAmount += 10
    else if (percentage >= 70) xpAmount += 5

    // Bonus XP based on difficulty
    if (difficulty === "hard") xpAmount += 10
    else if (difficulty === "medium") xpAmount += 5

    const { error } = await supabase.rpc("award_xp", {
      user_id: userId,
      xp_amount: xpAmount,
      reason: `Quiz completed: ${percentage}%`
    })

    if (error) {
      console.error("Failed to award quiz XP:", error)
    }
  } catch (error) {
    console.error("Quiz XP award error:", error)
  }
}

async function checkQuizBadges(supabase: any, userId: string, percentage: number, difficulty: string) {
  try {
    // Check for perfect score badge
    if (percentage === 100) {
      const { data: perfectBadge } = await supabase
        .from("badges")
        .select("id")
        .eq("requirement_type", "perfect_quiz")
        .single()

      if (perfectBadge) {
        await supabase.from("user_badges").upsert({
          user_id: userId,
          badge_id: perfectBadge.id,
          earned_at: new Date().toISOString(),
        }, { onConflict: "user_id,badge_id" })
      }
    }

    // Check for difficulty-specific badges
    if (difficulty === "hard" && percentage >= 80) {
      const { data: hardBadge } = await supabase
        .from("badges")
        .select("id")
        .eq("requirement_type", "hard_quiz")
        .single()

      if (hardBadge) {
        await supabase.from("user_badges").upsert({
          user_id: userId,
          badge_id: hardBadge.id,
          earned_at: new Date().toISOString(),
        }, { onConflict: "user_id,badge_id" })
      }
    }
  } catch (error) {
    console.error("Badge check error:", error)
  }
}
