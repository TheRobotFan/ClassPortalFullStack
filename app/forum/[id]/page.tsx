"use client"

import { useEffect, useState, use } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MessageCircle, User, Clock, Reply, Send, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteForumComment } from "@/lib/actions/comments"

type ApiUser = {
  full_name?: string | null
  avatar_url?: string | null
  role?: string | null
}

type ApiDiscussion = {
  id: string
  title: string
  content: string
  category?: string | null
  created_at: string
  likes_count: number
  views_count: number
  replies_count: number
  user?: ApiUser | null
}

type ApiComment = {
  id: string
  content: string
  created_at: string
  likes_count: number
  users?: ApiUser | null
}

export default function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [discussion, setDiscussion] = useState<ApiDiscussion | null>(null)
  const [liked, setLiked] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [comments, setComments] = useState<ApiComment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [discussionRes, commentsRes] = await Promise.all([
          fetch(`/api/forum?id=${id}`),
          fetch(`/api/forum-comments?discussion_id=${id}`),
        ])

        if (!discussionRes.ok) {
          throw new Error("Errore nel caricamento della discussione")
        }
        if (!commentsRes.ok) {
          throw new Error("Errore nel caricamento dei commenti")
        }

        const discussionData = (await discussionRes.json()) as ApiDiscussion
        const commentsData = (await commentsRes.json()) as ApiComment[]

        if (!cancelled) {
          setDiscussion(discussionData)
          setComments(commentsData)
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Errore imprevisto")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    async function checkAdmin() {
      try {
        const res = await fetch("/api/user")
        if (res.ok) {
          const userData = await res.json()
          if (!cancelled) {
            setIsAdmin(userData.role === "hacker" || userData.role === "admin")
          }
        }
      } catch (e) {
        // Silently fail for admin check
        console.error("Error checking admin status:", e)
      }
    }

    void load()
    void checkAdmin()

    return () => {
      cancelled = true
    }
  }, [id])

  const handleAddComment = async () => {
    if (!replyText.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch("/api/forum-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discussion_id: id,
          content: replyText.trim(),
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? "Errore nell'invio del commento")
      }

      const newComment = (await res.json()) as ApiComment
      setComments((prev) => [...prev, newComment])
      setReplyText("")
    } catch (e: any) {
      setError(e?.message ?? "Errore nell'invio del commento")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo commento? Questa azione è irreversibile.")) {
      return
    }

    try {
      await deleteForumComment(commentId)
      setComments(comments.filter(comment => comment.id !== commentId))
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Si è verificato un errore durante l'eliminazione del commento.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/forum" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Torna al Forum
        </Link>
        {loading && (
          <Card className="p-8 mb-8 text-center">
            <p className="text-foreground/60">Caricamento discussione...</p>
          </Card>
        )}

        {error && !loading && (
          <Card className="p-8 mb-8 text-center border-red-500/40">
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-foreground/60 text-sm">Riprova a ricaricare la pagina.</p>
          </Card>
        )}

        {discussion && !loading && !error && (
          <Card className="p-8 mb-8 border-l-4 border-l-primary">
            <div className="flex gap-4 mb-6">
              <div className="text-4xl">💬</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{discussion.title}</h1>
                <div className="flex gap-4 text-sm text-foreground/60">
                  {discussion.category && (
                    <span className="bg-primary/10 px-2 py-1 rounded">{discussion.category}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {discussion.user?.full_name ?? "Utente anonimo"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(discussion.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-foreground/80 mb-6 leading-relaxed whitespace-pre-line">{discussion.content}</p>

            <div className="flex gap-4 text-foreground/60">
              <button
                onClick={() => setLiked(!liked)}
                className="flex items-center gap-2 hover:text-primary transition"
              >
                <ThumbsUp className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
                <span>{discussion.likes_count + (liked ? 1 : 0)}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-secondary transition">
                <MessageCircle className="w-5 h-5" />
                <span>{comments.length} risposte</span>
              </button>
            </div>
          </Card>
        )}

        {/* Comments */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold">Risposte ({comments.length})</h2>

          {comments.map((comment) => (
            <div key={comment.id}>
              <Card className="p-6">
                <div className="flex gap-4 mb-4">
                  <div className="text-3xl">💬</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">{comment.users?.full_name ?? "Utente"}</p>
                        <p className="text-xs text-foreground/60">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Membro della classe</span>
                    </div>
                    <p className="text-foreground/80 mb-4 whitespace-pre-line">{comment.content}</p>
                    <div className="flex gap-4 items-center">
                      <button className="text-sm text-foreground/60 hover:text-primary transition flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {comment.likes_count}
                      </button>
                      <button className="text-sm text-foreground/60 hover:text-secondary transition flex items-center gap-1">
                        <Reply className="w-4 h-4" />
                        Rispondi
                      </button>
                      {isAdmin && (
                        <Button
                          onClick={() => handleDeleteComment(comment.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-500/10 p-2 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        {discussion && (
          <Card className="p-8 bg-card/50">
            <h3 className="text-xl font-bold mb-4">Scrivi una risposta</h3>
            <div className="space-y-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="La tua risposta..."
                className="w-full p-4 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleAddComment}
                  disabled={submitting || !replyText.trim()}
                  className="gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Invio..." : "Invia Risposta"}
                </Button>
                <Button variant="outline">Anteprima</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
