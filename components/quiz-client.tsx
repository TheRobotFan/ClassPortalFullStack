"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, CheckCircle, XCircle, Search, Trophy, Clock, Target, Plus, Trash2 } from "lucide-react"
import { getQuizzes, getQuizById, submitQuizAttempt, deleteQuiz } from "@/lib/actions/quiz"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

type Quiz = {
  id: string
  title: string
  description: string
  difficulty: string
  total_questions: number
  time_limit: number | null
  subject: { name: string; color: string } | null
  created_by_user: { full_name: string | null } | null
}

type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correct_answer: string
  explanation: string | null
}

export function QuizClient() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null)
  const [quizData, setQuizData] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadQuizzes()
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("users").select("role").eq("id", user.id).single()

      setIsAdmin(data?.role === "hacker" || data?.role === "teacher")
    }
  }

  async function loadQuizzes() {
    setLoading(true)
    const data = await getQuizzes()
    setQuizzes(data)
    setLoading(false)
  }

  async function startQuiz(quizId: string) {
    const data = await getQuizById(quizId)
    setQuizData(data)
    setActiveQuiz(quizId)
    setCurrentQuestion(0)
    setAnswers({})
    setSelectedAnswer(null)
    setShowExplanation(false)
    setQuizFinished(false)
    setResult(null)
    if (data.time_limit) {
      setTimeLeft(data.time_limit * 60) // Convert minutes to seconds
    }
  }

  async function handleDeleteQuiz(quizId: string, quizTitle: string) {
    if (!confirm(`Sei sicuro di voler eliminare il quiz "${quizTitle}"? Questa azione è irreversibile.`)) {
      return
    }

    try {
      await deleteQuiz(quizId)
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId))
      toast({
        title: "Quiz eliminato",
        description: `Il quiz "${quizTitle}" è stato eliminato con successo.`,
      })
    } catch (error) {
      console.error("Error deleting quiz:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del quiz.",
        variant: "destructive",
      })
    }
  }

  function handleAnswer(answer: string) {
    if (!showExplanation) {
      setSelectedAnswer(answer)
      setAnswers({ ...answers, [quizData.questions[currentQuestion].id]: answer })
      setShowExplanation(true)
    }
  }

  function nextQuestion() {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      handleFinishQuiz()
    }
  }

  async function handleFinishQuiz() {
    const result = await submitQuizAttempt(activeQuiz!, answers)
    setResult(result)
    setQuizFinished(true)

    toast({
      title: "Quiz completato!",
      description: `Hai ottenuto ${result.percentage.toFixed(0)}% - +${result.xpEarned || Math.floor(result.percentage / 10)} XP`,
    })
  }

  function resetQuiz() {
    setActiveQuiz(null)
    setQuizData(null)
    setQuizFinished(false)
    setTimeLeft(null)
  }

  const subjects = Array.from(new Set(quizzes.map((q) => q.subject?.name).filter(Boolean)))
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = !selectedSubject || quiz.subject?.name === selectedSubject
    return matchesSearch && matchesSubject
  })

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !quizFinished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            handleFinishQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft, quizFinished])

  if (quizFinished && result) {
    const percentage = result.percentage
    const isExcellent = percentage >= 90
    const isGood = percentage >= 70
    const isAverage = percentage >= 50

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="mb-8 flex justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  strokeWidth="4"
                  strokeDasharray={`${(percentage / 100) * 440} 440`}
                  className={`transition-all duration-1000 ${
                    isExcellent
                      ? "stroke-green-500"
                      : isGood
                        ? "stroke-blue-500"
                        : isAverage
                          ? "stroke-yellow-500"
                          : "stroke-red-500"
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`text-5xl font-bold ${isExcellent ? "text-green-600" : isGood ? "text-blue-600" : isAverage ? "text-yellow-600" : "text-red-600"}`}
                >
                  {percentage.toFixed(0)}%
                </span>
                <span className="text-sm text-foreground/60">
                  {result.correctAnswers}/{result.totalQuestions}
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-2">
            {isExcellent
              ? "🎉 Eccellente!"
              : isGood
                ? "👏 Bravissimo!"
                : isAverage
                  ? "📚 Continua così!"
                  : "💪 Ritenta!"}
          </h2>
          <p className="text-lg text-foreground/70 mb-8">
            {isExcellent
              ? "Hai ottenuto un risultato straordinario!"
              : isGood
                ? "Ottimo lavoro! Continua così!"
                : isAverage
                  ? "Buon tentativo. Prova di nuovo per migliorare!"
                  : "Studia un po' di più e ritenta!"}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-foreground/60 mb-1">Corrette</p>
              <p className="text-2xl font-bold text-green-600">{result.correctAnswers}</p>
            </div>
            <div>
              <p className="text-xs text-foreground/60 mb-1">Sbagliate</p>
              <p className="text-2xl font-bold text-red-600">{result.totalQuestions - result.correctAnswers}</p>
            </div>
            <div>
              <p className="text-xs text-foreground/60 mb-1">XP Guadagnati</p>
              <p className="text-2xl font-bold text-primary">+{Math.floor(percentage / 10)}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => startQuiz(activeQuiz!)} variant="outline" className="flex-1">
              Ritenta
            </Button>
            <Button onClick={resetQuiz} className="flex-1 bg-primary hover:bg-primary/90">
              Torna ai Quiz
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (activeQuiz && quizData) {
    const question = quizData.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / quizData.questions.length) * 100

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{quizData.title}</h2>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className={timeLeft < 60 ? "text-red-500 font-bold" : ""}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}
              <span className="text-sm text-foreground/60">
                Domanda {currentQuestion + 1}/{quizData.questions.length}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>

        <Card className="p-8">
          <h3 className="text-2xl font-bold mb-6">{question.question}</h3>

          <div className="space-y-3 mb-8">
            {question.options.map((option: string, idx: number) => {
              const isSelected = selectedAnswer === option
              const isCorrect = option === question.correct_answer
              const showResult = showExplanation

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={showExplanation}
                  className={`w-full p-4 text-left rounded-lg border-2 transition ${
                    showResult && isCorrect
                      ? "border-green-500 bg-green-500/10"
                      : showResult && isSelected && !isCorrect
                        ? "border-red-500 bg-red-500/10"
                        : isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </button>
              )
            })}
          </div>

          {showExplanation && question.explanation && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm font-semibold text-blue-600 mb-1">Spiegazione:</p>
              <p className="text-sm text-foreground/80">{question.explanation}</p>
            </div>
          )}

          {showExplanation && (
            <Button onClick={nextQuestion} className="w-full bg-primary hover:bg-primary/90">
              {currentQuestion < quizData.questions.length - 1 ? "Prossima Domanda" : "Vedi Risultati"}
            </Button>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quiz Automatici</h1>
          <p className="text-foreground/60">Metti alla prova le tue conoscenze e guadagna XP</p>
        </div>

        {isAdmin && (
          <Link href="/dashboard/quiz/create">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Crea Quiz
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cerca quiz..."
            className="bg-transparent outline-none text-sm w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedSubject(null)}
            className={`px-4 py-2 rounded-lg transition ${
              !selectedSubject ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            }`}
          >
            Tutte le Materie
          </button>
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedSubject === subject ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="p-6 hover:shadow-lg transition-all flex flex-col">
            <div className="mb-4 flex-1">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-bold">{quiz.title}</h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    quiz.difficulty === "Facile"
                      ? "bg-green-500/20 text-green-700"
                      : quiz.difficulty === "Intermedio"
                        ? "bg-yellow-500/20 text-yellow-700"
                        : "bg-red-500/20 text-red-700"
                  }`}
                >
                  {quiz.difficulty}
                </span>
              </div>
              <p className="text-foreground/60 text-sm mb-4">{quiz.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span>{quiz.total_questions} domande</span>
                </div>
                {quiz.time_limit && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{quiz.time_limit} minuti</span>
                  </div>
                )}
                {quiz.subject && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: quiz.subject.color }} />
                    <span>{quiz.subject.name}</span>
                  </div>
                )}
              </div>
            </div>

            <Button onClick={() => startQuiz(quiz.id)} className="w-full gap-2 bg-primary hover:bg-primary/90">
              <Play className="w-4 h-4" />
              Inizia Quiz
            </Button>

            {isAdmin && (
              <Button
                onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                variant="destructive"
                size="sm"
                className="w-full gap-2 mt-2"
              >
                <Trash2 className="w-4 h-4" />
                Elimina Quiz
              </Button>
            )}
          </Card>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <Card className="p-12 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-foreground/30" />
          <p className="text-foreground/60">Nessun quiz disponibile</p>
        </Card>
      )}
    </div>
  )
}
