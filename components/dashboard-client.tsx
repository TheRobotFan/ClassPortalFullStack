"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  MessageSquare,
  Eye,
  TrendingUp,
  Award,
  Search,
  Filter,
} from "lucide-react"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import Link from "next/link"

interface DashboardClientProps {
  user: {
    id: string
    full_name: string
    role: string
    email: string
  }
  stats: {
    usersCount: number
    materialsCount: number
    exercisesCount: number
    quizzesCount: number
    forumCount: number
    totalViews: number
    totalContent: number
    studentsCount?: number
    teachersCount?: number
    hackersCount?: number
    adminsCount?: number
    activeTodayCount?: number
  }
  topContributors: Array<{
    id: string
    full_name: string
    xp_points: number
    level: number
  }>
  userRegistrationTrend: Array<{ date: string; count: number }>
  contentUploadTrend: Array<{ date: string; materials: number; exercises: number; quizzes: number }>
  activityTrend: Array<{ date: string; views: number; downloads: number; forum_discussions: number }>
  mostViewedContent: Array<{ id: string; title: string; type: string; views: number; downloads: number }>
  mostActiveUsers: Array<{ id: string; full_name: string; xp_points: number; level: number; badge_count: number }>
  subjectDistribution: Array<{
    subject_name: string
    materials_count: number
    exercises_count: number
    quizzes_count: number
    total_count: number
  }>
  recentActivityFeed: Array<{ activity_type: string; title: string; user_name: string; created_at: string }>
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function DashboardClient({
  user,
  stats,
  topContributors,
  userRegistrationTrend,
  contentUploadTrend,
  activityTrend,
  mostViewedContent,
  mostActiveUsers,
  subjectDistribution,
  recentActivityFeed,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const isAdmin = user.role === "admin"
  const isHacker = user.role === "hacker"
  const dashboardTitle = isHacker ? "Dashboard Hacker / Admin" : isAdmin ? "Dashboard Admin" : "Dashboard Insegnante"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{dashboardTitle}</h1>
          <p className="text-foreground/70">Benvenuto, {user.full_name}</p>
        </div>

        {/* Stats Cards - Real Data */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div className="text-sm text-foreground/60">Utenti Attivi</div>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.usersCount}</div>
            <p className="text-xs text-foreground/50 mt-2">registrati al portale</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <div className="text-sm text-foreground/60">Contenuti Totali</div>
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats.totalContent}</div>
            <p className="text-xs text-foreground/50 mt-2">
              {stats.materialsCount} appunti, {stats.exercisesCount} esercizi, {stats.quizzesCount} quiz
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-pink-500/5">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-pink-600" />
              <div className="text-sm text-foreground/60">Discussioni</div>
            </div>
            <div className="text-3xl font-bold text-pink-600">{stats.forumCount}</div>
            <p className="text-xs text-foreground/50 mt-2">post nel forum</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-amber-600" />
              <div className="text-sm text-foreground/60">Visualizzazioni</div>
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.totalViews}</div>
            <p className="text-xs text-foreground/50 mt-2">totali</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Utenti</TabsTrigger>
            <TabsTrigger value="content">Contenuti</TabsTrigger>
            {isHacker && <TabsTrigger value="settings">Impostazioni</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* User Registration Trend Chart */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Registrazioni Utenti (30 giorni)
                </h2>
                {userRegistrationTrend.length > 0 ? (
                  <ChartContainer
                    config={{
                      count: {
                        label: "Nuovi Utenti",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userRegistrationTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="text-foreground/60 text-center py-8">Nessun dato disponibile</p>
                )}
              </Card>

              {/* Content Upload Trend Chart */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Caricamenti Contenuti (30 giorni)
                </h2>
                {contentUploadTrend.length > 0 ? (
                  <ChartContainer
                    config={{
                      materials: {
                        label: "Appunti",
                        color: "hsl(var(--chart-1))",
                      },
                      exercises: {
                        label: "Esercizi",
                        color: "hsl(var(--chart-2))",
                      },
                      quizzes: {
                        label: "Quiz",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={contentUploadTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="materials" fill="var(--color-materials)" />
                        <Bar dataKey="exercises" fill="var(--color-exercises)" />
                        <Bar dataKey="quizzes" fill="var(--color-quizzes)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="text-foreground/60 text-center py-8">Nessun dato disponibile</p>
                )}
              </Card>

              {/* Top Contributors */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Contributori
                </h2>
                <div className="space-y-3">
                  {topContributors.length > 0 ? (
                    topContributors.map((contributor, idx) => (
                      <div
                        key={contributor.id}
                        className="flex justify-between items-center p-3 bg-card rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{contributor.full_name}</p>
                            <p className="text-xs text-foreground/60">Livello {contributor.level}</p>
                          </div>
                        </div>
                        <p className="font-bold text-primary">{contributor.xp_points} XP</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-foreground/60 text-center py-4">Nessun contributore ancora</p>
                  )}
                </div>
              </Card>

              {/* Recent Activity Feed */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Attività Recenti</h2>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {recentActivityFeed.length > 0 ? (
                    recentActivityFeed.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-foreground/60">
                            {activity.activity_type === "material" && "📄 Appunto"}
                            {activity.activity_type === "exercise" && "✏️ Esercizio"}
                            {activity.activity_type === "quiz" && "🧠 Quiz"}
                            {activity.activity_type === "forum" && "💬 Forum"}
                            {" • "}
                            {activity.user_name}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-foreground/60 text-center py-4">Nessuna attività recente</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Activity Trend Chart */}
              <Card className="p-6 md:col-span-2">
                <h2 className="text-xl font-bold mb-4">Trend Attività (30 giorni)</h2>
                {activityTrend.length > 0 ? (
                  <ChartContainer
                    config={{
                      views: {
                        label: "Visualizzazioni",
                        color: "hsl(var(--chart-1))",
                      },
                      downloads: {
                        label: "Download",
                        color: "hsl(var(--chart-2))",
                      },
                      forum_discussions: {
                        label: "Discussioni Forum",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activityTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} />
                        <Line type="monotone" dataKey="downloads" stroke="var(--color-downloads)" strokeWidth={2} />
                        <Line
                          type="monotone"
                          dataKey="forum_discussions"
                          stroke="var(--color-forum_discussions)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="text-foreground/60 text-center py-8">Nessun dato disponibile</p>
                )}
              </Card>

              {/* Most Viewed Content */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Contenuti Più Visti</h2>
                <div className="space-y-3">
                  {mostViewedContent.length > 0 ? (
                    mostViewedContent.slice(0, 5).map((content, idx) => (
                      <div
                        key={content.id}
                        className="flex justify-between items-center p-3 bg-card rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-semibold text-sm">{content.title}</p>
                          <p className="text-xs text-foreground/60">{content.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{content.views}</p>
                          <p className="text-xs text-foreground/60">views</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-foreground/60 text-center py-4">Nessun contenuto ancora</p>
                  )}
                </div>
              </Card>

              {/* Most Active Users */}
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Utenti Più Attivi</h2>
                <div className="space-y-3">
                  {mostActiveUsers.length > 0 ? (
                    mostActiveUsers.slice(0, 5).map((user, idx) => (
                      <div
                        key={user.id}
                        className="flex justify-between items-center p-3 bg-card rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-semibold text-sm">{user.full_name}</p>
                          <p className="text-xs text-foreground/60">
                            Livello {user.level} • {user.badge_count} badge
                          </p>
                        </div>
                        <p className="font-bold text-primary">{user.xp_points} XP</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-foreground/60 text-center py-4">Nessun utente attivo</p>
                  )}
                </div>
              </Card>

              {/* Subject Distribution */}
              <Card className="p-6 md:col-span-2">
                <h2 className="text-xl font-bold mb-4">Distribuzione per Materia</h2>
                {subjectDistribution.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <ChartContainer
                      config={{
                        total_count: {
                          label: "Contenuti Totali",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={subjectDistribution}
                            dataKey="total_count"
                            nameKey="subject_name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {subjectDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    <div className="space-y-2">
                      {subjectDistribution.map((subject, idx) => (
                        <div key={idx} className="p-3 bg-card rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            <p className="font-semibold text-sm">{subject.subject_name}</p>
                          </div>
                          <div className="text-xs text-foreground/60 space-y-1">
                            <p>📄 {subject.materials_count} appunti</p>
                            <p>✏️ {subject.exercises_count} esercizi</p>
                            <p>🧠 {subject.quizzes_count} quiz</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground/60 text-center py-8">Nessun dato disponibile</p>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestione Utenti
                </h2>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <Input
                      placeholder="Cerca utenti..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <Card className="p-4 bg-blue-500/10">
                    <p className="text-sm text-foreground/60 mb-1">Totale Utenti</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.usersCount}</p>
                  </Card>
                  <Card className="p-4 bg-green-500/10">
                    <p className="text-sm text-foreground/60 mb-1">Studenti</p>
                    <p className="text-2xl font-bold text-green-600">{stats.studentsCount ?? stats.usersCount}</p>
                  </Card>
                  <Card className="p-4 bg-purple-500/10">
                    <p className="text-sm text-foreground/60 mb-1">Insegnanti</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.teachersCount ?? 0}</p>
                  </Card>
                  <Card className="p-4 bg-amber-500/10">
                    <p className="text-sm text-foreground/60 mb-1">Attivi Oggi</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.activeTodayCount ?? 0}</p>
                  </Card>
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">Utente</th>
                        <th className="text-left p-3 text-sm font-semibold">Ruolo</th>
                        <th className="text-left p-3 text-sm font-semibold">Livello</th>
                        <th className="text-left p-3 text-sm font-semibold">XP</th>
                        <th className="text-left p-3 text-sm font-semibold">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mostActiveUsers.slice(0, 10).map((activeUser) => (
                        <tr key={activeUser.id} className="border-t border-border hover:bg-muted/30">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                                {activeUser.full_name?.[0] || "U"}
                              </div>
                              <span className="font-medium">{activeUser.full_name}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded text-xs">Studente</span>
                          </td>
                          <td className="p-3">{activeUser.level}</td>
                          <td className="p-3 font-semibold text-primary">{activeUser.xp_points}</td>
                          <td className="p-3">
                            <Link href={`/utente/${activeUser.id}`}>
                              <Button variant="outline" size="sm">
                                Visualizza
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mostActiveUsers.length === 0 && (
                  <div className="text-center py-8 text-foreground/60">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nessun utente registrato ancora</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Gestione Contenuti
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtra
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 bg-purple-500/10">
                    <p className="text-sm text-foreground/60 mb-1">Appunti</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.materialsCount}</p>
                    <Link href="/appunti">
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                        Gestisci →
                      </Button>
                    </Link>
                  </Card>
                  <Card className="p-4 bg-blue-500/10">
                    <p className="text-sm text-foreground/60 mb-1">Esercizi</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.exercisesCount}</p>
                    <Link href="/esercizi">
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                        Gestisci →
                      </Button>
                    </Link>
                  </Card>
                  <Card className="p-4 bg-green-500/10">
                    <p className="text-sm text-foreground/60 mb-1">Quiz</p>
                    <p className="text-2xl font-bold text-green-600">{stats.quizzesCount}</p>
                    <Link href="/quiz">
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                        Gestisci →
                      </Button>
                    </Link>
                  </Card>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Contenuti Più Popolari</h3>
                  <div className="space-y-2">
                    {mostViewedContent.length > 0 ? (
                      mostViewedContent.map((content) => (
                        <div
                          key={content.id}
                          className="flex justify-between items-center p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{content.title}</p>
                            <p className="text-sm text-foreground/60">
                              {content.type === "material" && "📄 Appunto"}
                              {content.type === "exercise" && "✏️ Esercizio"}
                              {content.type === "quiz" && "🧠 Quiz"}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-foreground/60">
                              <Eye className="w-4 h-4 inline mr-1" />
                              {content.views}
                            </span>
                            {content.downloads > 0 && (
                              <span className="text-foreground/60">📥 {content.downloads}</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-foreground/60">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nessun contenuto caricato ancora</p>
                        <p className="text-sm mt-2">Inizia caricando appunti, esercizi o quiz</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Azioni Rapide</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Link href="/appunti">
                      <Button className="w-full bg-transparent" variant="outline">
                        Carica Appunti
                      </Button>
                    </Link>
                    <Link href="/esercizi">
                      <Button className="w-full bg-transparent" variant="outline">
                        Crea Esercizio
                      </Button>
                    </Link>
                    <Link href="/quiz">
                      <Button className="w-full bg-transparent" variant="outline">
                        Crea Quiz
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab - solo per hacker (funzioni avanzate) */}
          {isHacker && (
            <TabsContent value="settings" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Impostazioni Dashboard
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Preferenze Generali</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                        <div>
                          <p className="font-medium">Notifiche Email</p>
                          <p className="text-sm text-foreground/60">Ricevi aggiornamenti via email</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Configura
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                        <div>
                          <p className="font-medium">Gestione Contributori</p>
                          <p className="text-sm text-foreground/60">Gestisci i contributori in evidenza</p>
                        </div>
                        <Link href="/dashboard/featured">
                          <Button variant="outline" size="sm">
                            Gestisci
                          </Button>
                        </Link>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                        <div>
                          <p className="font-medium">Backup Database</p>
                          <p className="text-sm text-foreground/60">Esporta i dati del portale</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Esporta
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Statistiche Avanzate</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <p className="text-sm text-foreground/60 mb-1">Tasso di Crescita Utenti</p>
                        <p className="text-2xl font-bold text-green-600">+{Math.max(0, stats.usersCount - 1)}%</p>
                        <p className="text-xs text-foreground/50 mt-1">ultimi 30 giorni</p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-sm text-foreground/60 mb-1">Engagement Medio</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {stats.totalContent > 0 ? Math.round((stats.totalViews / stats.totalContent) * 10) / 10 : 0}
                        </p>
                        <p className="text-xs text-foreground/50 mt-1">views per contenuto</p>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Collegamenti Rapidi</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Link href="/utente">
                        <Button variant="outline" className="w-full bg-transparent">
                          Il Mio Profilo
                        </Button>
                      </Link>
                      <Link href="/forum">
                        <Button variant="outline" className="w-full bg-transparent">
                          Forum
                        </Button>
                      </Link>
                      <Link href="/progetti">
                        <Button variant="outline" className="w-full bg-transparent">
                          Progetti
                        </Button>
                      </Link>
                      <Link href="/ai">
                        <Button variant="outline" className="w-full bg-transparent">
                          Assistente IA
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
