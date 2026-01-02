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
      subject:subjects(id, name, color),
      created_by_user:users!quizzes_created_by_fkey(id, full_name, avatar_url)
    `)
    .order("created_at", { ascending: false })

  if (subjectId) {
    query = query.eq("subject_id", subjectId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getQuizById(quizId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      *,
      subject:subjects(id, name, color),
      questions:quiz_questions(*),
      created_by_user:users!quizzes_created_by_fkey(id, full_name, avatar_url)
    `)
    .eq("id", quizId)
    .single()

  if (error) throw error

  // Convert database format to frontend format
  if (data.questions) {
    data.questions = data.questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      // Convert separate columns back to options array
      options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(opt => opt && opt.trim()),
      // Convert letter back to full text (A -> option_a text, etc.)
      correct_answer: q.correct_answer === 'A' ? q.option_a :
                     q.correct_answer === 'B' ? q.option_b :
                     q.correct_answer === 'C' ? q.option_c :
                     q.correct_answer === 'D' ? q.option_d : '',
      explanation: q.explanation
    }))
  }

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

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "hacker" && userData?.role !== "teacher") {
    throw new Error("Solo gli hacker della classe o i teacher possono creare quiz")
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

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "hacker" && userData?.role !== "teacher") {
    throw new Error("Solo gli hacker della classe o i teacher possono aggiungere domande")
  }

  console.log("Adding quiz question:", { quizId, question, userRole: userData?.role })

  // Map the options array to separate columns and find the correct answer letter
  const options = question.options.filter(opt => opt.trim()) // Remove empty options
  if (options.length < 2) {
    throw new Error("Ogni domanda deve avere almeno 2 opzioni")
  }

  // Find which option index matches the correct answer
  const correctIndex = options.findIndex(opt => opt === question.correct_answer)
  if (correctIndex === -1) {
    throw new Error("La risposta corretta deve corrispondere a una delle opzioni")
  }

  // Convert index to letter (A, B, C, D)
  const correctLetter = String.fromCharCode(65 + correctIndex) // 65 = 'A'

  // Prepare the data for database insertion
  const questionData = {
    quiz_id: quizId,
    question: question.question,
    option_a: options[0] || '',
    option_b: options[1] || '',
    option_c: options[2] || '',
    option_d: options[3] || '',
    correct_answer: correctLetter,
    explanation: question.explanation || null,
  }

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert(questionData)
    .select()
    .single()

  if (error) {
    console.error("Quiz question insert error:", error)
    throw error
  }

  console.log("Quiz question inserted successfully:", data)

  // Update quiz question count (non-critical: log but don't block on error)
  try {
    const { error: rpcError } = await supabase.rpc("increment_quiz_questions", { quiz_id: quizId })
    if (rpcError) {
      console.error("RPC error (non-critical):", rpcError)
    }
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

export async function deleteQuiz(quizId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin" && userData?.role !== "hacker") {
    throw new Error("Solo amministratori e hacker possono eliminare quiz")
  }

  // Delete quiz questions first (due to foreign key constraint)
  const { error: questionsError } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("quiz_id", quizId)

  if (questionsError) {
    console.error("Error deleting quiz questions:", questionsError)
    throw new Error("Errore nell'eliminazione delle domande del quiz")
  }

  // Delete quiz attempts
  const { error: attemptsError } = await supabase
    .from("quiz_attempts")
    .delete()
    .eq("quiz_id", quizId)

  if (attemptsError) {
    console.error("Error deleting quiz attempts:", attemptsError)
    // Non critico, continua
  }

  // Delete the quiz
  const { error: quizError } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId)

  if (quizError) {
    console.error("Error deleting quiz:", quizError)
    throw new Error("Errore nell'eliminazione del quiz")
  }

  revalidatePath("/quiz")
  return { success: true }
}
