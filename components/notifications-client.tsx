"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Trash2, Check, Loader2 } from "lucide-react"
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions/gamification"
import { deleteNotification } from "@/lib/actions/notifications"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type Notification = {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  related_id: string | null
}

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const data = await getUserNotifications(user.id, 50)
      setNotifications(data)
    }
    setLoading(false)
  }

  async function handleMarkAsRead(id: string) {
    await markNotificationAsRead(id)
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    toast({
      title: "Notifica letta",
    })
  }

  async function handleDelete(id: string) {
    await deleteNotification(id)
    setNotifications(notifications.filter((n) => n.id !== id))
    toast({
      title: "Notifica eliminata",
    })
  }

  async function handleMarkAllAsRead() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await markAllNotificationsAsRead(user.id)
      // Reload notifications from database to ensure persistence
      await loadNotifications()
      toast({
        title: "Tutte le notifiche sono state lette",
      })
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  function getNotificationIcon(type: string) {
    const icons: Record<string, string> = {
      xp_earned: "⭐",
      badge_earned: "🏆",
      level_up: "🎉",
      comment_reply: "💬",
      exercise_completed: "✅",
      quiz_completed: "📝",
      material_uploaded: "📄",
      discussion_created: "💭",
      assignment_reminder: "📅",
      exam_reminder: "📝",
    }
    return icons[type] || "🔔"
  }

  function formatTimestamp(timestamp: string) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "ora"
    if (diffMins < 60) return `${diffMins} minuti fa`
    if (diffHours < 24) return `${diffHours} ore fa`
    if (diffDays < 7) return `${diffDays} giorni fa`
    return date.toLocaleDateString("it-IT")
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Notifiche</h1>
            <p className="text-foreground/60">{unreadCount} non lette</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            <Check className="w-4 h-4 mr-2" />
            Segna tutto come letto
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-6 hover:shadow-md transition-all cursor-pointer border-l-4 ${
                !notification.is_read ? "border-l-primary bg-primary/5 border border-primary/20" : "border-l-border"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3 flex-1">
                  <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{notification.title}</h3>
                      {!notification.is_read && <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>}
                    </div>
                    <p className="text-foreground/70 mb-3">{notification.message}</p>
                    <div className="flex gap-4 text-sm text-foreground/60">
                      <span>{formatTimestamp(notification.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Segna come letto"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(notification.id)}
                    title="Elimina"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground/60 text-lg">Nessuna notifica</p>
            <p className="text-foreground/40">Le tue notifiche appariranno qui</p>
          </Card>
        )}
      </div>
    </div>
  )
}
