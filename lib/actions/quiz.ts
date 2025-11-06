"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { awardXP } from "./gamification"

export async function getQuizzes(subjectId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("quizzes")
    .select(`
      *,
      created_by_user:users!quizzes_created_by_fkey(id, full_name, avatar_url),
      subject:subjects(id, name, color)
    `)
    .order("created_at", { ascending: false })

  if (subjectId) {
    query = query.eq("subject_id", subjectId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getQuizById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      *,
      created_by_user:users!quizzes_created_by_fkey(id, full_name, avatar_url),
      subject:subjects(id, name, color),
      questions:quiz_questions(*)
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createQuiz(formData: {
  title: string
  description: string
  difficulty: string
  time_limit?: number
  passing_score: number
  subject_id: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  // Check if user is admin
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin") {
    throw new Error("Solo gli admin possono creare quiz")
  }

  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      ...formData,
      created_by: user.id,
      total_questions: 0,
    })
    .select()
    .single()

  if (error) throw error

  await awardXP(user.id, 50, "Creazione quiz")

  revalidatePath("/quiz")
  return data
}

export async function addQuizQuestion(
  quizId: string,
  question: {
    question: string
    options: string[]
    correct_answer: string
    explanation?: string
  },
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  // Check if user is admin or teacher
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin" && userData?.role !== "teacher") {
    throw new Error("Solo gli admin e i teacher possono aggiungere domande")
  }

  console.log("Adding quiz question:", { quizId, question, userRole: userData?.role })

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({
      quiz_id: quizId,
      ...question,
    })
    .select()
    .single()

  if (error) {
    console.error("Quiz question insert error:", error)
    throw error
  }

  console.log("Quiz question inserted successfully:", data)

  // Temporarily comment out the RPC call to isolate the issue
  try {
    // await supabase.rpc("increment_quiz_questions", { quiz_id: quizId })
    console.log("RPC call temporarily skipped")
  } catch (rpcError) {
    console.error("RPC error (non-critical):", rpcError)
    // Don't throw error for RPC failure
  }

  revalidatePath(`/quiz/${quizId}`)
  return data
}

export async function submitQuizAttempt(quizId: string, answers: Record<string, string>) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  // Get quiz and questions
  const { data: quiz } = await supabase
    .from("quizzes")
    .select("*, questions:quiz_questions(*)")
    .eq("id", quizId)
    .single()

  if (!quiz || !quiz.questions) throw new Error("Quiz non trovato")

  let correctAnswers = 0
  quiz.questions.forEach((q: any) => {
    if (answers[q.id] === q.correct_answer) {
      correctAnswers++
    }
  })

  const score = correctAnswers
  const percentage = (correctAnswers / quiz.questions.length) * 100

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      quiz_id: quizId,
      user_id: user.id,
      answers,
      score,
      percentage,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  // Calculate XP based on score and difficulty
  let xpMultiplier = 1
  if (quiz.difficulty === "Intermedio") xpMultiplier = 1.5
  if (quiz.difficulty === "Difficile") xpMultiplier = 2

  const baseXP = Math.floor(percentage / 10) // 0-10 XP based on percentage
  const bonusXP = percentage >= 90 ? 10 : percentage >= 70 ? 5 : 0 // Bonus for high scores
  const totalXP = Math.floor((baseXP + bonusXP) * xpMultiplier)

  // Award XP for completing quiz
  await awardXP(user.id, totalXP, "complete_quiz")

  revalidatePath(`/quiz/${quizId}`)
  return {
    ...data,
    correctAnswers,
    totalQuestions: quiz.questions.length,
    xpEarned: totalXP,
  }
}
