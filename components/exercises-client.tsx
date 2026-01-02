"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Filter, Plus, Zap, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { getExercises, incrementExerciseViews, deleteExercise } from "@/lib/actions/exercises"
import { submitExerciseComment, likeExercise, unlikeExercise } from "@/app/actions/exercises"
import { awardXP } from "@/lib/actions/gamification"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { deleteMaterialComment } from "@/lib/actions/comments"

type Exercise = {
  id: string
  title: string
  description: string | null
  question: string
  answer: string
  hint: string | null
  difficulty: string
  subject_id: string
  created_by: string
  views_count: number
  likes_count: number
  created_at: string
  subject: { id: string; name: string; color: string } | null
  created_by_user: { id: string; full_name: string | null; avatar_url: string | null } | null
}

type Comment = {
  id: string
  content: string
  user_id: string
  created_at: string
  users: { full_name: string | null; avatar_url: string | null } | null
}

export function ExercisesClient() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState("Tutti")
  const [selectedDifficulty, setSelectedDifficulty] = useState("Tutti")
  const [liked, setLiked] = useState<string[]>([])
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({})
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({})
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadExercises()
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

  async function loadExercises() {
    setLoading(true)
    const data = await getExercises()
    setExercises(data)
    setLoading(false)
  }

  async function loadComments(exerciseId: string) {
    const { data } = await supabase
      .from("exercise_comments")
      .select("*, users(full_name, avatar_url)")
      .eq("exercise_id", exerciseId)
      .order("created_at", { ascending: false })

    if (data) {
      setComments((prev) => ({ ...prev, [exerciseId]: data }))
    }
  }

  async function handleViewExercise(exerciseId: string) {
    await incrementExerciseViews(exerciseId)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await awardXP(user.id, 2, "view_exercise")
    }
    loadExercises()
  }

  async function toggleLike(exerciseId: string) {
    if (liked.includes(exerciseId)) {
      // Remove like
      setLiked((prev) => prev.filter((id) => id !== exerciseId))
      await unlikeExercise(exerciseId)
      toast({
        title: "Like rimosso",
        description: "Hai tolto il like dall'esercizio",
      })
      loadExercises()
    } else {
      // Add like
      setLiked((prev) => [...prev, exerciseId])
      await likeExercise(exerciseId)
      toast({
        title: "Like aggiunto!",
        description: "Hai messo like all'esercizio",
      })
      loadExercises()
    }
  }

  async function addComment(exerciseId: string) {
    if (!commentText[exerciseId]?.trim()) return

    const result = await submitExerciseComment(exerciseId, commentText[exerciseId])

    if (result.error) {
      toast({
        title: "Errore",
        description: result.error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Commento aggiunto!",
      description: "Commento pubblicato con successo",
    })

    setCommentText((prev) => ({ ...prev, [exerciseId]: "" }))
    loadComments(exerciseId)
  }

  async function toggleComments(exerciseId: string) {
    if (expandedComments === exerciseId) {
      setExpandedComments(null)
    } else {
      setExpandedComments(exerciseId)
      if (!comments[exerciseId]) {
        await loadComments(exerciseId)
      }
    }
  }

  async function handleDeleteExercise(exerciseId: string, exerciseTitle: string) {
    if (!confirm(`Sei sicuro di voler eliminare l'esercizio "${exerciseTitle}"? Questa azione è irreversibile.`)) {
      return
    }

    try {
      await deleteExercise(exerciseId)
      setExercises(exercises.filter(exercise => exercise.id !== exerciseId))
      toast({
        title: "Esercizio eliminato",
        description: `L'esercizio "${exerciseTitle}" è stato eliminato con successo.`,
      })
    } catch (error) {
      console.error("Error deleting exercise:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione dell'esercizio.",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteMaterialComment(commentId: string) {
    if (!confirm("Sei sicuro di voler eliminare questo commento? Questa azione è irreversibile.")) {
      return
    }

    try {
      await deleteMaterialComment(commentId)
      // Reload comments for the current exercise
      loadComments(expandedComments)
      toast({
        title: "Commento eliminato",
        description: "Il commento è stato eliminato con successo.",
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione del commento.",
        variant: "destructive",
      })
    }
  }

  const subjects = ["Tutti", ...Array.from(new Set(exercises.map((ex) => ex.subject?.name).filter(Boolean)))]
  const difficulties = ["Tutti", "Facile", "Intermedio", "Difficile"]

  const filteredExercises = exercises.filter((ex) => {
    const subjectMatch = selectedSubject === "Tutti" || ex.subject?.name === selectedSubject
    const difficultyMatch = selectedDifficulty === "Tutti" || ex.difficulty === selectedDifficulty
    return subjectMatch && difficultyMatch
  })

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-8">Caricamento...</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Esercizi</h1>
          <p className="text-foreground/60">Trova esercizi per ogni materia e difficoltà</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/exercises/create">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Nuovo Esercizio
            </Button>
          </Link>
        )}
      </div>

      {/* Quiz section */}
      <Card className="p-6 mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-l-4 border-l-secondary flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-secondary" />
            Quiz Automatici
          </h2>
          <p className="text-foreground/60">Metti alla prova le tue conoscenze con quiz generati automaticamente</p>
        </div>
        <Link href="/quiz">
          <Button className="gap-2 bg-secondary hover:bg-secondary/90 whitespace-nowrap ml-4">
            Vai ai Quiz
            <Zap className="w-4 h-4" />
          </Button>
        </Link>
      </Card>

      {/* Filters */}
      <Card className="p-6 mb-8 bg-card/50">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <span className="font-semibold">Filtri</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-3">Materia</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedSubject === subject
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Difficoltà</label>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedDifficulty === difficulty
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Exercises List */}
      <div className="space-y-4">
        {filteredExercises.map((exercise) => (
          <Card
            key={exercise.id}
            className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-secondary"
            onClick={() => handleViewExercise(exercise.id)}
          >
            {/* Exercise Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold">{exercise.title}</h2>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      exercise.difficulty === "Facile"
                        ? "bg-green-500/20 text-green-700"
                        : exercise.difficulty === "Intermedio"
                          ? "bg-yellow-500/20 text-yellow-700"
                          : "bg-red-500/20 text-red-700"
                    }`}
                  >
                    {exercise.difficulty}
                  </span>
                </div>
                <div className="flex gap-3 text-sm text-foreground/60">
                  {exercise.subject && <span className="bg-primary/10 px-2 py-1 rounded">{exercise.subject.name}</span>}
                  {exercise.created_by_user && <span>👤 {exercise.created_by_user.full_name || "Anonimo"}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-sm text-foreground/60 flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{exercise.views_count}</span>
                </div>
                {isAdmin && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteExercise(exercise.id, exercise.title)
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-500/10 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {exercise.description && <p className="text-foreground/70 text-sm mb-4">{exercise.description}</p>}

            {/* Question */}
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-foreground mb-1">Domanda:</p>
              <p className="text-foreground/80 whitespace-pre-line">{exercise.question}</p>
            </div>

            {/* Hint */}
            {exercise.hint && expandedId === exercise.id && (
              <div className="bg-blue-500/10 p-4 rounded-lg mb-4 border border-blue-500/20">
                <p className="font-semibold text-blue-600 mb-1">💡 Suggerimento:</p>
                <p className="text-foreground/80 whitespace-pre-line">{exercise.hint}</p>
              </div>
            )}

            {/* Answer Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setExpandedId(expandedId === exercise.id ? null : exercise.id)
              }}
              className="w-full p-4 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition mb-4"
            >
              {expandedId === exercise.id ? "Nascondi Risposta" : "Mostra Risposta"}
            </button>

            {/* Answer */}
            {expandedId === exercise.id && (
              <div className="bg-secondary/10 p-4 rounded-lg mb-4 border border-secondary/20">
                <p className="font-semibold text-foreground mb-1">✅ Risposta:</p>
                <p className="text-foreground/80 whitespace-pre-line">{exercise.answer}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 items-center text-foreground/60">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLike(exercise.id)
                }}
                className="flex items-center gap-2 hover:text-primary transition"
              >
                <Heart className="w-5 h-5" fill={liked.includes(exercise.id) ? "currentColor" : "none"} />
                <span>{exercise.likes_count + (liked.includes(exercise.id) ? 1 : 0)}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleComments(exercise.id)
                }}
                className="flex items-center gap-2 hover:text-secondary transition"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{(comments[exercise.id] || []).length}</span>
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 hover:text-secondary transition ml-auto"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Comments Section */}
            {expandedComments === exercise.id && (
              <div className="mt-6 pt-6 border-t border-border space-y-4" onClick={(e) => e.stopPropagation()}>
                <h4 className="font-bold text-foreground">Commenti ({(comments[exercise.id] || []).length})</h4>

                {/* Comments List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {(comments[exercise.id] || []).map((comment) => (
                    <div key={comment.id} className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                          {comment.users?.full_name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{comment.users?.full_name || "Anonimo"}</p>
                          <p className="text-xs text-foreground/60">
                            {new Date(comment.created_at).toLocaleDateString("it-IT")}
                          </p>
                        </div>
                        {isAdmin && (
                          <Button
                            onClick={() => handleDeleteMaterialComment(comment.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-500/10 p-2 ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Scrivi un commento..."
                    value={commentText[exercise.id] || ""}
                    onChange={(e) => setCommentText((prev) => ({ ...prev, [exercise.id]: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button size="sm" onClick={() => addComment(exercise.id)} className="bg-primary hover:bg-primary/90">
                    Commenta
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-foreground/60">Nessun esercizio trovato</p>
        </Card>
      )}
    </div>
  )
}
