import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, TrendingUp, MessageSquare, BookOpen, Award, Users, Search, User, MessageCircle, BookMarked, BarChart3, Lightbulb, Clock, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getDashboardStats, getRecentActivityFeed } from "@/lib/actions/dashboard"
import { getFeaturedContributors } from "@/lib/actions/featured"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"

const mainFeatures = [
  {
    title: "Area Personale",
    description: "Gestisci il tuo profilo, i tuoi progressi e le tue attività",
    icon: User,
    href: "/profilo",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Forum & Discussioni",
    description: "Partecipa alle discussioni e collabora con i compagni",
    icon: MessageCircle,
    href: "/forum",
    color: "from-green-500 to-teal-500"
  },
  {
    title: "Materiale Didattico",
    description: "Accedi a tutti gli appunti e le risorse condivise",
    icon: BookMarked,
    href: "/appunti",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Esercizi & Quiz",
    description: "Metti alla prova le tue conoscenze con esercizi interattivi",
    icon: CheckCircle,
    href: "/esercizi",
    color: "from-yellow-500 to-orange-500"
  },
  {
    title: "Statistiche",
    description: "Monitora i tuoi progressi e le tue performance",
    icon: BarChart3,
    href: "/dashboard",
    color: "from-red-500 to-pink-500"
  },
  {
    title: "Risorse Condivise",
    description: "Scopri i migliori contenuti selezionati dalla community",
    icon: Lightbulb,
    href: "/esplora",
    color: "from-indigo-500 to-purple-500"
  }
];

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
  const { data: { user } } = await supabase.auth.getUser()

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

  const quickLinks = [
    {
      title: "Esercizi",
      href: "/esercizi",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Appunti",
      href: "/appunti",
      icon: FileText,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Forum",
      href: "/forum",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Progetti",
      href: "/progetti",
      icon: Award,
      color: "from-orange-500 to-red-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-background px-4 py-12 sm:py-16 lg:py-20">
        {/* Decorative gradients */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-24 -right-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
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
                  <Link href="/guida">
                    <Button className="gap-2 bg-primary hover:bg-primary/90 w-full sm:w-auto" size="lg">
                      Vai alla Guida <ArrowRight className="w-4 h-4" />
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
              <Card className="p-6 text-center bg-card/60 backdrop-blur border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="text-3xl font-bold text-primary mb-2">{stats.exercisesCount || 0}</div>
                <p className="text-sm text-foreground/60">Esercizi</p>
              </Card>
              <Card className="p-6 text-center bg-card/60 backdrop-blur border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="text-3xl font-bold text-secondary mb-2">{stats.forumCount || 0}</div>
                <p className="text-sm text-foreground/60">Discussioni</p>
              </Card>
              <Card className="p-6 text-center bg-card/60 backdrop-blur border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="text-3xl font-bold text-primary mb-2">{stats.materialsCount || 0}</div>
                <p className="text-sm text-foreground/60">Appunti</p>
              </Card>
              <Card className="p-6 text-center bg-card/60 backdrop-blur border border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
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
                <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full bg-card/70 border border-border/60">
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
      </section>

      {/* Main Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Tutto ciò di cui hai bisogno in un unico posto</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Una piattaforma completa per supportare il tuo percorso di apprendimento e la collaborazione con i compagni.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} href={feature.href}>
                  <Card className="p-6 h-full hover:shadow-md transition-all duration-200 hover:-translate-y-1 border-muted-foreground/10">
                    <div className={`flex items-center justify-center h-12 w-12 rounded-lg mb-4 bg-gradient-to-r ${feature.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats & Activity */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-semibold mb-6">La nostra community</h2>
              <div className="space-y-4">
                {stats && (
                  <>
                    <Card className="p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary mr-4">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Utenti attivi</p>
                          <p className="text-2xl font-bold">{stats.activeTodayCount || 0}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 mr-4">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Appunti condivisi</p>
                          <p className="text-2xl font-bold">{stats.materialsCount || 0}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-green-500/10 text-green-500 mr-4">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Discussioni attive</p>
                          <p className="text-2xl font-bold">{stats.forumCount || 0}</p>
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Attività recenti</h2>
                <Button variant="ghost" asChild className="text-sm">
                  <Link href="/attivita" className="flex items-center gap-1">
                    Vedi tutto
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
              <Card className="p-6">
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0 last:mb-0 hover:bg-muted/30 p-2 -mx-2 rounded transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground/80">
                            {activity.user_name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium text-foreground">{activity.user_name}</span>{' '}
                            <span className="text-muted-foreground">
                              {activity.activity_type} un {getActivityTypeLabel(activity.activity_type)}
                            </span>
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {getRelativeTime(activity.created_at)}
                            </span>
                            <span className="mx-2 text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">
                              in {activity.title}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="flex-shrink-0" asChild>
                          <Link href={`/${activity.activity_type}/${activity.id}`}>
                            Vedi
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nessuna attività recente da mostrare</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

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

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 bg-card/50">
        <div className="container mx-auto px-4">
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
            <p> 2025 Classe Portal. Creato per gli studenti, dai rappresentanti di classe.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
