"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, FileText, MessageSquare, Award, Download, Eye, TrendingUp, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ActivityItem {
  id: string
  activity_type: string
  title: string
  created_at: string
  metadata?: any
}

interface UserActivityProps {
  userId: string
}

export function UserActivity({ userId }: UserActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const supabase = createClient()

  useEffect(() => {
    loadUserActivity()
  }, [filter, userId])

  async function loadUserActivity() {
    setLoading(true)
    try {
      // Load user's recent activities from different tables
      const [
        materialsResult,
        quizAttemptsResult,
        forumDiscussionsResult,
        forumCommentsResult
      ] = await Promise.all([
        supabase
          .from("materials")
          .select("id, title, created_at, file_type")
          .eq("uploaded_by", userId)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("quiz_attempts")
          .select("id, score, created_at, quizzes!inner(title)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("forum_discussions")
          .select("id, title, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("forum_comments")
          .select("id, content, created_at, forum_discussions!inner(title)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10)
      ])

      // Combine and format activities
      const combinedActivities: ActivityItem[] = []

      // Add materials
      if (materialsResult.data) {
        materialsResult.data.forEach(material => {
          combinedActivities.push({
            id: `material-${material.id}`,
            activity_type: "material_uploaded",
            title: `ha caricato: "${material.title}"`,
            created_at: material.created_at,
            metadata: { file_type: material.file_type }
          })
        })
      }

      // Add quiz attempts
      if (quizAttemptsResult.data) {
        quizAttemptsResult.data.forEach((attempt: any) => {
          combinedActivities.push({
            id: `quiz-${attempt.id}`,
            activity_type: "quiz_completed",
            title: `ha completato il quiz: "${attempt.quizzes?.title || 'Quiz'}" con punteggio ${attempt.score}%`,
            created_at: attempt.created_at,
            metadata: { score: attempt.score }
          })
        })
      }

      // Add forum discussions
      if (forumDiscussionsResult.data) {
        forumDiscussionsResult.data.forEach(discussion => {
          combinedActivities.push({
            id: `discussion-${discussion.id}`,
            activity_type: "discussion_created",
            title: `ha creato la discussione: "${discussion.title}"`,
            created_at: discussion.created_at
          })
        })
      }

      // Add forum comments
      if (forumCommentsResult.data) {
        forumCommentsResult.data.forEach((comment: any) => {
          combinedActivities.push({
            id: `comment-${comment.id}`,
            activity_type: "comment_posted",
            title: `ha commentato in: "${comment.forum_discussions?.title || 'Discussione'}"`,
            created_at: comment.created_at,
            metadata: { content: comment.content?.substring(0, 100) }
          })
        })
      }

      // Sort by date and apply filter
      const sortedActivities = combinedActivities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .filter(activity => filter === "all" || activity.activity_type === filter)

      setActivities(sortedActivities)
    } catch (error) {
      console.error("Error loading user activity:", error)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case "material_uploaded":
        return <FileText className="w-4 h-4 text-blue-500" />
      case "material_downloaded":
        return <Download className="w-4 h-4 text-green-500" />
      case "material_viewed":
        return <Eye className="w-4 h-4 text-purple-500" />
      case "quiz_completed":
        return <Award className="w-4 h-4 text-yellow-500" />
      case "discussion_created":
        return <MessageSquare className="w-4 h-4 text-orange-500" />
      case "comment_posted":
        return <MessageSquare className="w-4 h-4 text-cyan-500" />
      case "badge_earned":
        return <Award className="w-4 h-4 text-pink-500" />
      case "level_up":
        return <TrendingUp className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  function getActivityLabel(type: string) {
    switch (type) {
      case "material_uploaded":
        return "Appunto Caricato"
      case "material_downloaded":
        return "Download"
      case "material_viewed":
        return "Visualizzazione"
      case "quiz_completed":
        return "Quiz Completato"
      case "discussion_created":
        return "Discussione Creata"
      case "comment_posted":
        return "Commento"
      case "badge_earned":
        return "Badge Sbloccato"
      case "level_up":
        return "Livello Aumentato"
      default:
        return "Attività"
    }
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Adesso"
    if (diffInMinutes < 60) return `${diffInMinutes} min fa`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} ore fa`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} giorni fa`
    
    return date.toLocaleDateString("it-IT")
  }

  const activityTypes = [
    { value: "all", label: "Tutto", count: activities.length },
    { value: "material_uploaded", label: "Appunti", count: activities.filter(a => a.activity_type === "material_uploaded").length },
    { value: "quiz_completed", label: "Quiz", count: activities.filter(a => a.activity_type === "quiz_completed").length },
    { value: "discussion_created", label: "Discussioni", count: activities.filter(a => a.activity_type === "discussion_created").length },
    { value: "comment_posted", label: "Commenti", count: activities.filter(a => a.activity_type === "comment_posted").length },
  ]

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Attività Recente
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadUserActivity}
          disabled={loading}
        >
          Aggiorna
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {activityTypes.map((type) => (
          <Button
            key={type.value}
            variant={filter === type.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type.value)}
            className="text-xs"
          >
            {type.label}
            {type.count > 0 && (
              <span className="ml-1 px-1 py-0 text-xs bg-muted rounded-full">
                {type.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors"
            >
              <div className="mt-1 p-2 rounded-full bg-muted/50">
                {getActivityIcon(activity.activity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {getActivityLabel(activity.activity_type)}
                  </span>
                  <span className="text-xs text-foreground/60 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatTimeAgo(activity.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground break-words">
                  {activity.title}
                </p>
                {activity.metadata?.score && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-foreground/60">Punteggio:</div>
                      <div className={`text-xs font-bold ${
                        activity.metadata.score >= 80 ? 'text-green-600' : 
                        activity.metadata.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {activity.metadata.score}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-foreground/20" />
            <p className="text-foreground/60 text-lg font-medium mb-2">Nessuna attività recente</p>
            <p className="text-foreground/40 text-sm">
              Inizia a caricare appunti, completare quiz o partecipare al forum per vedere qui le tue attività
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button asChild>
                <a href="/appunti">Carica Appunto</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/quiz">Completa Quiz</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/forum">Visita Forum</a>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Load More */}
      {activities.length > 0 && activities.length >= 10 && (
        <div className="mt-6 text-center">
          <Button variant="outline" size="sm">
            Carica altre attività
          </Button>
        </div>
      )}
    </Card>
  )
}
