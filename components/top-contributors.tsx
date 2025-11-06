"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AvatarFallback } from "@/components/avatar-fallback"
import { Trophy, Medal, Award, TrendingUp, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Contributor {
  id: string
  full_name: string
  avatar_url: string | null
  xp_points: number
  level: number
  contributions: number
  rank: number
}

interface TopContributorsProps {
  limit?: number
  showViewAll?: boolean
}

export function TopContributors({ limit = 5, showViewAll = true }: TopContributorsProps) {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadTopContributors()
  }, [])

  async function loadTopContributors() {
    setLoading(true)
    try {
      // Get top contributors by XP
      const { data: users, error } = await supabase
        .from("users")
        .select("id, full_name, avatar_url, xp_points, level")
        .order("xp_points", { ascending: false })
        .limit(limit)

      if (error) throw error

      console.log('Raw users data from DB:', users)

      // Calculate contributions for each user
      const contributorsWithStats = await Promise.all(
        (users || []).map(async (user, index) => {
          console.log(`Processing user ${index}:`, {
            id: user.id,
            name: user.full_name,
            avatar_url: user.avatar_url
          })
          // Count user's contributions across all tables
          const [
            materialsResult,
            discussionsResult,
            commentsResult,
            projectsResult,
            exercisesResult
          ] = await Promise.all([
            supabase
              .from("materials")
              .select("*", { count: "exact", head: true })
              .eq("uploaded_by", user.id),
            supabase
              .from("forum_discussions")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id),
            supabase
              .from("forum_comments")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id),
            supabase
              .from("projects")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id),
            supabase
              .from("exercises")
              .select("*", { count: "exact", head: true })
              .eq("created_by", user.id)
          ])

          const totalContributions = 
            (materialsResult.count || 0) +
            (discussionsResult.count || 0) +
            (commentsResult.count || 0) +
            (projectsResult.count || 0) +
            (exercisesResult.count || 0)

          return {
            ...user,
            contributions: totalContributions,
            rank: index + 1
          }
        })
      )

      setContributors(contributorsWithStats)
    } catch (error) {
      console.error("Error loading top contributors:", error)
      // Fallback mock data
      setContributors([
        {
          id: "1",
          full_name: "Marco Rossi",
          avatar_url: null,
          xp_points: 2500,
          level: 5,
          contributions: 45,
          rank: 1
        },
        {
          id: "2",
          full_name: "Giulia Bianchi",
          avatar_url: null,
          xp_points: 1800,
          level: 4,
          contributions: 32,
          rank: 2
        },
        {
          id: "3",
          full_name: "Alessandro Verdi",
          avatar_url: null,
          xp_points: 1200,
          level: 3,
          contributions: 28,
          rank: 3
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  function getRankIcon(rank: number) {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-foreground/60">#{rank}</span>
    }
  }

  function getLevelColor(level: number) {
    if (level >= 10) return "text-purple-600"
    if (level >= 7) return "text-red-500"
    if (level >= 5) return "text-orange-500"
    if (level >= 3) return "text-yellow-500"
    return "text-green-500"
  }

  function cleanAvatarUrl(url: string | null): string | null {
    if (!url) return null
    
    // More precise cleaning - only remove obvious corruption
    let cleaned = url
      .replace(/\s+/g, '') // Remove spaces
      .replace(/[^a-zA-Z0-9\-_\.\/:]/g, '') // Keep valid URL chars
      .replace(/o{3,}/g, '') // Remove sequences of 3+ 'o' characters (corruption pattern)
      .trim()
    
    // Check if cleaned URL looks valid
    if (cleaned.includes('supabase.co') && 
        cleaned.includes('/storage/v1/object/public/') &&
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(cleaned) &&
        cleaned.length > 50 && // Reasonable minimum length
        cleaned.length < 1000) {
      return cleaned
    }
    
    return null
  }

  function isValidUrl(url: string | null): boolean {
    const cleaned = cleanAvatarUrl(url)
    if (!cleaned) return false
    
    try {
      const urlObj = new URL(cleaned)
      return urlObj.hostname.includes('supabase.co') &&
             cleaned.includes('/storage/v1/object/public/') &&
             cleaned.length < 1000
    } catch {
      return false
    }
  }

  function getAvatarUrl(url: string | null): string {
    const cleaned = cleanAvatarUrl(url)
    const valid = isValidUrl(url)
    console.log('Avatar URL processing:', { 
      original: url, 
      cleaned, 
      valid,
      willUse: cleaned || ""
    })
    return cleaned || ""
  }

  // Test function to verify URL works
  function testImageUrl(url: string): boolean {
    try {
      const img = new Image()
      img.src = url
      return true
    } catch {
      return false
    }
  }

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
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Top Contributori</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadTopContributors}
          disabled={loading}
        >
          Aggiorna
        </Button>
      </div>

      <div className="space-y-4">
        {contributors.length > 0 ? (
          contributors.map((contributor) => (
            <div 
              key={contributor.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(contributor.rank)}
              </div>
              
              <AvatarFallback
                userId={contributor.id}
                fullName={contributor.full_name}
                avatarUrl={contributor.avatar_url}
                className="h-10 w-10"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm truncate">{contributor.full_name}</p>
                  <span className={`text-xs font-bold ${getLevelColor(contributor.level)}`}>
                    Lv.{contributor.level}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground/60">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {contributor.xp_points} XP
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {contributor.contributions} contributi
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-foreground/20" />
            <p className="text-foreground/60 text-sm">Nessun contributore trovato</p>
            <p className="text-foreground/40 text-xs mt-1">
              Inizia a contribuire per apparire in questa classifica!
            </p>
          </div>
        )}
      </div>

      {showViewAll && contributors.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <Link href="/leaderboard">
            <Button variant="outline" size="sm" className="w-full">
              Vedi Classifica Completa
            </Button>
          </Link>
        </div>
      )}
    </Card>
  )
}
