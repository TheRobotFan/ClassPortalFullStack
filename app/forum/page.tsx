"use client"

import { useEffect, useMemo, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, ThumbsUp, Eye, Clock, User, Plus, Search, Trash2 } from "lucide-react"
import { deleteDiscussion } from "@/lib/actions/forum"

type ApiUser = {
  full_name?: string | null
  avatar_url?: string | null
}

type ApiDiscussion = {
  id: string
  title: string
  content: string
  category?: string | null
  created_at: string
  replies_count: number
  views_count: number
  likes_count: number
  users?: ApiUser | null
}

export default function ForumPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [liked, setLiked] = useState<string[]>([])
  const [discussions, setDiscussions] = useState<ApiDiscussion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newContent, setNewContent] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadDiscussions() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/forum")
        if (!res.ok) {
          throw new Error("Errore nel caricamento del forum")
        }
        const data = (await res.json()) as ApiDiscussion[]
        if (!cancelled) {
          setDiscussions(data)
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

    async function loadAdminStatus() {
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

    void loadDiscussions()
    void loadAdminStatus()

    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => {
    const byCategory = new Map<string, number>()
    for (const d of discussions) {
      const key = d.category || "Generale"
      byCategory.set(key, (byCategory.get(key) ?? 0) + 1)
    }
    return Array.from(byCategory.entries()).map(([name, count], index) => ({
      id: index + 1,
      name,
      threads: count,
    }))
  }, [discussions])

  const filteredDiscussions = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return discussions.filter((discussion) => {
      const matchSearch = discussion.title.toLowerCase().includes(q)
      const matchCategory = !selectedCategory || discussion.category === selectedCategory
      return matchSearch && matchCategory
    })
  }, [discussions, searchQuery, selectedCategory])

  const toggleLike = (id: string) => {
    setLiked((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleCreateDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim()) return

    try {
      setCreating(true)
      setCreateError(null)

      const res = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          category: newCategory.trim() || null,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? "Errore nella creazione della discussione")
      }

      const created = (await res.json()) as ApiDiscussion
      setDiscussions((prev) => [created, ...prev])
      setNewTitle("")
      setNewCategory("")
      setNewContent("")
      setShowNewForm(false)
    } catch (e: any) {
      setCreateError(e?.message ?? "Errore imprevisto")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteDiscussion = async (discussionId: string, discussionTitle: string) => {
    if (!confirm(`Sei sicuro di voler eliminare la discussione "${discussionTitle}"? Questa azione è irreversibile e eliminerà anche tutti i commenti.`)) {
      return
    }

    try {
      await deleteDiscussion(discussionId)
      setDiscussions(discussions.filter(discussion => discussion.id !== discussionId))
      // You might want to show a toast here if you have a toast system
    } catch (error) {
      console.error("Error deleting discussion:", error)
      alert("Si è verificato un errore durante l'eliminazione della discussione.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Forum e Discussioni</h1>
            <p className="text-foreground/60">Condividi dubbi, domande e consigli con i compagni</p>
          </div>
          <Button
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={() => setShowNewForm((v) => !v)}
          >
            <Plus className="w-4 h-4" />
            {showNewForm ? "Chiudi" : "Nuova Discussione"}
          </Button>
        </div>

        {showNewForm && (
          <Card className="mb-8 p-6 space-y-4">
            <h2 className="text-xl font-bold">Crea una nuova discussione</h2>
            {createError && <p className="text-sm text-red-500">{createError}</p>}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Titolo</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Es. Dubbi sulla verifica di matematica"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Categoria (opzionale)</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Es. Matematica, Fisica, Generale..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Contenuto</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full p-3 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-32"
                placeholder="Scrivi qui la tua domanda o il tema della discussione..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowNewForm(false)}
              >
                Annulla
              </Button>
              <Button
                onClick={handleCreateDiscussion}
                disabled={creating || !newTitle.trim() || !newContent.trim()}
                className="gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60"
              >
                {creating ? "Creazione..." : "Pubblica"}
              </Button>
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
          <input
            type="text"
            placeholder="Cerca discussioni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h3 className="font-bold mb-4">Categorie</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-4 py-3 rounded transition ${
                    selectedCategory === null ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Tutte</span>
                    <span className="text-xs bg-primary/20 px-2 py-1 rounded">{discussions.length}</span>
                  </div>
                </button>

                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-4 py-3 rounded transition ${
                      selectedCategory === category.name ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs bg-primary/20 px-2 py-1 rounded">{category.threads}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Discussions List */}
          <div className="lg:col-span-3 space-y-4">
            {loading && (
              <Card className="p-12 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-foreground/30" />
                <p className="text-foreground/60">Caricamento discussioni...</p>
              </Card>
            )}

            {error && !loading && (
              <Card className="p-12 text-center border-red-500/40">
                <p className="text-red-500 mb-2">{error}</p>
                <p className="text-foreground/60 text-sm">Riprova a ricaricare la pagina.</p>
              </Card>
            )}

            {!loading && !error &&
              filteredDiscussions.map((discussion) => (
                <Card
                  key={discussion.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-secondary"
                >
                  {/* Header */}
                  <div className="flex gap-4 mb-4">
                    <div className="text-3xl">
                      {/* Non abbiamo emoji da backend, usiamo un placeholder */}
                      🤔
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3
                            className="text-lg font-bold hover:text-primary transition"
                            onClick={() => setExpandedId(expandedId === discussion.id ? null : discussion.id)}
                          >
                            {discussion.title}
                          </h3>
                          <div className="flex gap-3 text-sm text-foreground/60 mt-1">
                            {discussion.category && (
                              <span className="bg-primary/10 px-2 py-1 rounded">{discussion.category}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {discussion.users?.full_name ?? "Utente anonimo"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(discussion.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-foreground/60">
                          <div className="flex gap-3 items-center">
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {discussion.replies_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {discussion.views_count}
                            </span>
                            {isAdmin && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteDiscussion(discussion.id, discussion.title)
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-500/10 p-2 ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="bg-muted/50 p-4 rounded-lg mb-4">
                    <p className="text-foreground/80 text-sm">{discussion.content}</p>
                  </div>

                  {/* Comments Section */}
                  {expandedId === discussion.id && (
                    <div className="space-y-4 mb-4">
                      <h4 className="font-bold text-foreground text-sm">Dettagli discussione</h4>
                      <div className="space-y-3 bg-secondary/5 p-4 rounded-lg border border-secondary/10 max-h-48 overflow-y-auto">
                        <p className="text-sm text-foreground/70">Apri la discussione per vedere tutte le risposte.</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between text-foreground/60">
                    <div className="flex gap-4">
                      <button
                        onClick={() => toggleLike(discussion.id)}
                        className="flex items-center gap-2 hover:text-primary transition"
                      >
                        <ThumbsUp className="w-5 h-5" fill={liked.includes(discussion.id) ? "currentColor" : "none"} />
                        <span>{discussion.likes_count + (liked.includes(discussion.id) ? 1 : 0)}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-secondary transition">
                        <MessageCircle className="w-5 h-5" />
                        <span>Rispondi</span>
                      </button>
                    </div>
                    <a href={`/forum/${discussion.id}`} className="text-primary hover:underline text-sm">
                      Vedi discussione
                    </a>
                  </div>
                </Card>
              ))}

            {!loading && !error && filteredDiscussions.length === 0 && (
              <Card className="p-12 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-foreground/30" />
                <p className="text-foreground/60">Nessuna discussione trovata</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
