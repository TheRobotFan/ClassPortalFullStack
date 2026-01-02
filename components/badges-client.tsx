"use client"

import { useMemo, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Award, Lock, CheckCircle, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Badge {
  id: string
  name: string
  description: string
  icon_url: string | null
  requirement_type: string
  requirement_value: number
  rarity?: string | null
  admin_only?: boolean | null
}

interface EarnedBadge {
  id: string
  earned_at: string
  badge: Badge
}

interface BadgesClientProps {
  allBadges: Badge[]
  earnedBadges: EarnedBadge[]
  userRole?: string
}

function getRarityStyles(rarity?: string | null) {
  switch (rarity) {
    case "common":
      return { label: "Comune", pill: "bg-slate-100 text-slate-800", dot: "bg-slate-400" }
    case "uncommon":
      return { label: "Non comune", pill: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" }
    case "rare":
      return { label: "Raro", pill: "bg-sky-100 text-sky-800", dot: "bg-sky-500" }
    case "epic":
      return { label: "Epico", pill: "bg-violet-100 text-violet-800", dot: "bg-violet-500" }
    case "legendary":
      return { label: "Leggendario", pill: "bg-amber-100 text-amber-800", dot: "bg-amber-500" }
    case "supreme":
      return { label: "Supremo", pill: "bg-rose-100 text-rose-800", dot: "bg-rose-500" }
    case "hacker":
      return { label: "Hacker", pill: "bg-emerald-900 text-emerald-100", dot: "bg-emerald-400" }
    default:
      return { label: "Comune", pill: "bg-slate-100 text-slate-800", dot: "bg-slate-400" }
  }
}

export function BadgesClient({ allBadges, earnedBadges, userRole }: BadgesClientProps) {
  const [search, setSearch] = useState("")
  const [rarityFilter, setRarityFilter] = useState<string>("all")

  const isAdmin = userRole === "admin"
  const isHacker = userRole === "hacker"
  const canSeeAdminBadges = isAdmin || isHacker

  const visibleAllBadges = useMemo(
    () => (canSeeAdminBadges ? allBadges : allBadges.filter((b) => !b.admin_only)),
    [allBadges, canSeeAdminBadges],
  )

  const visibleEarnedBadges = useMemo(
    () => (canSeeAdminBadges ? earnedBadges : earnedBadges.filter((eb) => !eb.badge.admin_only)),
    [earnedBadges, canSeeAdminBadges],
  )

  const filteredAllBadges = useMemo(() => {
    const term = search.trim().toLowerCase()
    return visibleAllBadges.filter((b) => {
      const matchesSearch =
        !term ||
        b.name.toLowerCase().includes(term) ||
        (b.description || "").toLowerCase().includes(term)
      const matchesRarity = rarityFilter === "all" || (b.rarity || "common") === rarityFilter
      return matchesSearch && matchesRarity
    })
  }, [visibleAllBadges, search, rarityFilter])

  const filteredEarnedBadges = useMemo(() => {
    const term = search.trim().toLowerCase()
    return visibleEarnedBadges.filter((eb) => {
      const b = eb.badge
      const matchesSearch =
        !term ||
        b.name.toLowerCase().includes(term) ||
        (b.description || "").toLowerCase().includes(term)
      const matchesRarity = rarityFilter === "all" || (b.rarity || "common") === rarityFilter
      return matchesSearch && matchesRarity
    })
  }, [visibleEarnedBadges, search, rarityFilter])

  const earnedBadgeIds = useMemo(() => new Set(filteredEarnedBadges.map((eb) => eb.badge.id)), [filteredEarnedBadges])
  const lockedBadges = useMemo(
    () => filteredAllBadges.filter((b) => !earnedBadgeIds.has(b.id)),
    [filteredAllBadges, earnedBadgeIds],
  )
  const totalBadges = filteredAllBadges.length
  const earnedCount = filteredEarnedBadges.length
  const progressPercent = totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-500" />
            Sistema Badge
          </h1>
          <p className="text-foreground/60">Sblocca badge completando attività e raggiungendo traguardi</p>

          <Card className="mt-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            {totalBadges > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/60">Badge Sbloccati</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {earnedCount} / {totalBadges}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground/60">Progresso</p>
                    <p className="text-2xl font-bold text-amber-600">{progressPercent}%</p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="text-sm text-foreground/70">
                Al momento non ci sono badge configurati. Quando verranno aggiunti, li vedrai tutti qui.
              </div>
            )}
          </Card>
        </div>

        {/* Filtro e tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-foreground/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca per nome o descrizione..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="text-foreground/60 text-xs md:text-sm">Rarità:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "Tutte" },
                { value: "common", label: "Comune" },
                { value: "uncommon", label: "Non comune" },
                { value: "rare", label: "Raro" },
                { value: "epic", label: "Epico" },
                { value: "legendary", label: "Leggendario" },
                { value: "supreme", label: "Supremo" },
                { value: "hacker", label: "Hacker" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRarityFilter(option.value)}
                  className={`px-3 py-1 rounded-full text-xs md:text-[11px] border transition ${{
                    true: "bg-primary text-primary-foreground border-primary",
                    false: "bg-muted text-foreground/70 border-border hover:bg-muted/80",
                  }[String(rarityFilter === option.value)]}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full md:w-auto md:grid-cols-3 mb-6">
            <TabsTrigger value="earned">Sbloccati ({filteredEarnedBadges.length})</TabsTrigger>
            <TabsTrigger value="locked">Bloccati ({lockedBadges.length})</TabsTrigger>
            <TabsTrigger value="all">Tutti ({filteredAllBadges.length})</TabsTrigger>
          </TabsList>

          {/* Earned Badges */}
          <TabsContent value="earned">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Badge Sbloccati</h2>
              {filteredEarnedBadges.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {filteredEarnedBadges.map((eb) => {
                    const rarity = getRarityStyles(eb.badge.rarity)
                    return (
                      <div
                        key={eb.id}
                        className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-5xl">{eb.badge.icon_url || "🏆"}</div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <h3 className="font-bold text-lg">{eb.badge.name}</h3>
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${rarity.pill}`}>
                            <span className={`w-2 h-2 rounded-full ${rarity.dot}`} />
                            {rarity.label}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/60 mb-3">{eb.badge.description}</p>
                        <p className="text-xs text-foreground/50">
                          Sbloccato: {new Date(eb.earned_at).toLocaleDateString("it-IT")}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center text-foreground/60 py-8">
                  Nessun badge sbloccato ancora. Inizia a contribuire!
                </p>
              )}
            </Card>
          </TabsContent>

          {/* Locked Badges */}
          <TabsContent value="locked">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Badge da Sbloccare</h2>
              {lockedBadges.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {lockedBadges.map((badge) => (
                    <div key={badge.id} className="p-6 bg-muted/30 border-2 border-border rounded-lg opacity-60">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-5xl grayscale">{badge.icon_url || "🏆"}</div>
                        <Lock className="w-5 h-5 text-foreground/40" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                      <p className="text-sm text-foreground/60 mb-3">{badge.description}</p>
                      <p className="text-xs text-foreground/50">
                        Requisito: {badge.requirement_value} {badge.requirement_type}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-foreground/60 py-8">
                  Non ci sono badge bloccati: o non sono stati ancora configurati, o li hai sbloccati tutti.
                </p>
              )}
            </Card>
          </TabsContent>

          {/* All Badges */}
          <TabsContent value="all">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Tutti i Badge</h2>
              {filteredAllBadges.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
                  {filteredAllBadges.map((badge) => {
                    const isEarned = earnedBadgeIds.has(badge.id)
                    const earnedBadge = visibleEarnedBadges.find((eb) => eb.badge.id === badge.id)
                    const rarity = getRarityStyles(badge.rarity)

                    return (
                      <div
                        key={badge.id}
                        className={`p-6 border-2 rounded-lg ${
                          isEarned
                            ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30"
                            : "bg-muted/30 border-border opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`text-5xl ${!isEarned && "grayscale"}`}>{badge.icon_url || "🏆"}</div>
                          {isEarned ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Lock className="w-5 h-5 text-foreground/40" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <h3 className="font-bold text-lg">{badge.name}</h3>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${rarity.pill}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${rarity.dot}`} />
                            {rarity.label}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/60 mb-3">{badge.description}</p>
                        {isEarned && earnedBadge ? (
                          <p className="text-xs text-foreground/50">
                            Sbloccato: {new Date(earnedBadge.earned_at).toLocaleDateString("it-IT")}
                          </p>
                        ) : (
                          <p className="text-xs text-foreground/50">
                            Requisito: {badge.requirement_value} {badge.requirement_type}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center text-foreground/60 py-8">
                  Nessun badge disponibile al momento. Verranno mostrati qui quando saranno creati.
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
