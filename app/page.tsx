import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, TrendingUp, MessageSquare, BookOpen, Award } from "lucide-react"
import { TopContributors } from "@/components/top-contributors"
import Link from "next/link"
import { getDashboardStats, getRecentActivityFeed } from "@/lib/actions/dashboard"
import { getFeaturedContributors } from "@/lib/actions/featured"
import { createClient } from "@/lib/supabase/server"

const quickLinks = [
  { title: "Esercizi", href: "/esercizi", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
  { title: "Appunti", href: "/appunti", icon: Sparkles, color: "from-purple-500 to-pink-500" },
  { title: "Forum", href: "/forum", icon: MessageSquare, color: "from-green-500 to-teal-500" },
  { title: "Progetti", href: "/progetti", icon: TrendingUp, color: "from-orange-500 to-red-500" },
]

function getActivityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    material: "appunto",
    exercise: "esercizio",
    quiz: "quiz",
    discussion: "discussione",
    project: "progetto",
  }
  return labels[type] || type
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return "pochi minuti fa"
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "ora" : "ore"} fa`
  if (diffDays === 1) return "1 giorno fa"
  if (diffDays < 7) return `${diffDays} giorni fa`
  return date.toLocaleDateString("it-IT")
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [stats, recentActivities, featuredContributors] = await Promise.all([
    getDashboardStats(),
    getRecentActivityFeed(4),
    getFeaturedContributors(),
  ])

  let userProfile = null
  if (user) {
    const { data } = await supabase.from("users").select("full_name, xp_points, level").eq("id", user.id).single()
    userProfile = data
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-background px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Benvenuti nel Portale della Classe 1R
              </h1>
              <p className="text-lg text-foreground/70 mb-6">
                Il tuo hub digitale completo per imparare insieme. Condividi esercizi, appunti, discussioni e progetti
                con i tuoi compagni.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto" size="lg">
                      Vai alla Dashboard <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/login">
                    <Button className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto" size="lg">
                      Accedi <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                <Link href="/scopri-piu">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    Scopri di più
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center bg-card/50 backdrop-blur">
                <div className="text-3xl font-bold text-primary mb-2">{stats.exercisesCount || 0}</div>
                <p className="text-sm text-foreground/60">Esercizi</p>
              </Card>
              <Card className="p-6 text-center bg-card/50 backdrop-blur">
                <div className="text-3xl font-bold text-secondary mb-2">{stats.forumCount || 0}</div>
                <p className="text-sm text-foreground/60">Discussioni</p>
              </Card>
              <Card className="p-6 text-center bg-card/50 backdrop-blur">
                <div className="text-3xl font-bold text-primary mb-2">{stats.materialsCount || 0}</div>
                <p className="text-sm text-foreground/60">Appunti</p>
              </Card>
              <Card className="p-6 text-center bg-card/50 backdrop-blur">
                <div className="text-3xl font-bold text-secondary mb-2">{stats.usersCount || 0}</div>
                <p className="text-sm text-foreground/60">Studenti</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Accesso Rapido</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href}>
                <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-lg flex items-center justify-center mb-4 text-white`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{link.title}</h3>
                  <p className="text-sm text-foreground/60">Accedi subito →</p>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Top Contributors Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Top Contributori della Classe</h2>
          <Link href="/leaderboard">
            <Button variant="outline" size="sm">
              Vedi Classifica Completa
            </Button>
          </Link>
        </div>
        <TopContributors limit={8} showViewAll={false} />
      </section>

      {/* Recent Updates and Sidebar */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Novità Recenti</h2>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity: any) => (
                  <Card
                    key={activity.id}
                    className="p-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{activity.title}</h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {getActivityTypeLabel(activity.activity_type)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/60 mb-3">
                      {activity.user_name || "Utente"} • {getRelativeTime(activity.created_at)}
                    </p>
                    <div className="flex gap-4 text-sm text-foreground/50">
                      {activity.views && <span>👁️ {activity.views}</span>}
                      {activity.likes && <span>❤️ {activity.likes}</span>}
                      {activity.comments && <span>💬 {activity.comments}</span>}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-foreground/60">Nessuna attività recente. Sii il primo a contribuire!</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Enhanced Stats Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Statistiche della Classe
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.usersCount || 0}</div>
                  <div className="text-xs text-foreground/60">Studenti</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{stats.materialsCount || 0}</div>
                  <div className="text-xs text-foreground/60">Appunti</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.exercisesCount || 0}</div>
                  <div className="text-xs text-foreground/60">Esercizi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.forumCount || 0}</div>
                  <div className="text-xs text-foreground/60">Discussioni</div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Azioni Veloci</h3>
              <div className="space-y-2">
                <Link href="/appunti">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <BookOpen className="w-4 h-4" />
                    Carica Appunto
                  </Button>
                </Link>
                <Link href="/forum">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Nuova Discussione
                  </Button>
                </Link>
                <Link href="/quiz">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Award className="w-4 h-4" />
                    Completa Quiz
                  </Button>
                </Link>
              </div>
            </Card>

            {user && userProfile && (
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                <h3 className="font-bold mb-4">Il tuo Profilo</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Livello {userProfile.level || 1}</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                        style={{
                          width: `${Math.min(((userProfile.xp_points || 0) % 500) / 5, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-foreground/50 mt-1">
                      {userProfile.xp_points || 0} / {(userProfile.level || 1) * 500} XP
                    </p>
                  </div>
                  <Link href="/profilo">
                    <Button className="w-full mt-4 bg-primary hover:bg-primary/90" size="sm">
                      Visualizza Profilo
                    </Button>
                  </Link>
                </div>
              </Card>
            )}

            {/* AI Assistant */}
            <Card className="p-6 bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-secondary" />
                <h3 className="font-bold">Assistente IA</h3>
              </div>
              <p className="text-sm text-foreground/70 mb-4">
                Ricevi suggerimenti personalizzati su esercizi e discussioni
              </p>
              <Link href="/ai">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Apri Assistente
                </Button>
              </Link>
            </Card>
          </aside>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Portale</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/esercizi" className="hover:text-foreground">
                    Esercizi
                  </Link>
                </li>
                <li>
                  <Link href="/forum" className="hover:text-foreground">
                    Forum
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Risorse</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link href="/appunti" className="hover:text-foreground">
                    Appunti
                  </Link>
                </li>
                <li>
                  <Link href="/progetti" className="hover:text-foreground">
                    Progetti
                  </Link>
                </li>
                <li>
                  <Link href="/guida" className="hover:text-foreground">
                    Guida
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link href="/profilo" className="hover:text-foreground">
                    Profilo
                  </Link>
                </li>
                <li>
                  <Link href="/profilo/impostazioni" className="hover:text-foreground">
                    Impostazioni
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Supporto</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link href="/centro-aiuto" className="hover:text-foreground">
                    Centro Aiuto
                  </Link>
                </li>
                <li>
                  <Link href="/contatti" className="hover:text-foreground">
                    Contatti
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-foreground/60">
            <p>© 2025 Classe Portal. Creato per studenti, dai docenti.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
