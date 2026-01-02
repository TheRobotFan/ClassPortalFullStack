import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { getDashboardStats } from "@/lib/actions/dashboard"
import { getUsersForRoleManagement, changeUserRole, isRoleManagementAvailable } from "@/lib/actions/hacker"
import { Shield, Bug, Users, Award, Sparkles } from "lucide-react"
import Link from "next/link"

export default async function HackerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Controlla se l'utente ha il badge "Hacker della Classe"
  const { data: hackerBadge, error: hackerBadgeError } = await supabase
    .from("badges")
    .select("id")
    .eq("name", "Hacker della Classe")
    .single()

  if (hackerBadgeError || !hackerBadge) {
    redirect("/")
  }

  const { data: hackerUserBadges } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", user.id)
    .eq("badge_id", hackerBadge.id)

  if (!hackerUserBadges || hackerUserBadges.length === 0) {
    redirect("/")
  }

  const stats = await getDashboardStats()

  const canManageRoles = await isRoleManagementAvailable()
  const usersForRoles = canManageRoles ? await getUsersForRoleManagement() : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-emerald-400 via-primary to-secondary bg-clip-text text-transparent">
              <Bug className="w-8 h-8 text-emerald-400" />
              Pannello Hacker della Classe
            </h1>
            <p className="text-foreground/70 mt-2 max-w-xl text-sm md:text-base">
              Area riservata ai rappresentanti hacker della classe 1R. Qui puoi tenere d'occhio lo stato del portale e i
              progressi della classe.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/badges">
              <Button variant="outline" className="bg-card/70 border-border/60 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Vedi tutti i badge
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Vai alla dashboard studenti
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card/70 border border-border/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-foreground/60">Studenti registrati</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{stats.usersCount || 0}</p>
          </Card>

          <Card className="p-6 bg-card/70 border border-border/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-foreground/60">Contenuti totali</span>
              <Shield className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-3xl font-bold text-secondary">{stats.totalContent || 0}</p>
            <p className="text-xs text-foreground/60 mt-1">Appunti, esercizi e quiz</p>
          </Card>

          <Card className="p-6 bg-card/70 border border-border/60 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide text-foreground/60">Discussioni forum</span>
              <Bug className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">{stats.forumCount || 0}</p>
            <p className="text-xs text-foreground/60 mt-1">Per monitorare l'attività della classe</p>
          </Card>
        </section>

        <section>
          <Card className="p-6 bg-card/70 border border-border/60 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Badge speciali
            </h2>
            <p className="text-sm text-foreground/70 mb-4">
              Tu hai accesso al badge <strong>Hacker della Classe</strong> e, se admin, anche ad
              <strong> Admin della Classe</strong>. Puoi usare questa sezione per testare rapidamente il sistema XP/Badge e
              controllare che tutto funzioni per gli altri studenti.
            </p>
            <p className="text-xs text-foreground/50">
              Nota: questa sezione è visibile solo agli account che possiedono il badge "Hacker della Classe".
            </p>
          </Card>
        </section>

        {canManageRoles ? (
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Gestione ruoli studenti
              </h2>
              <p className="text-xs text-foreground/60 max-w-xl">
                Da qui puoi promuovere o retrocedere gli account tra <strong>studente</strong>, <strong>admin</strong> e
                <strong> hacker</strong>. Le modifiche hanno effetto immediato su XP e badge speciali (Admin/Hacker della Classe).
              </p>
            </div>

            <Card className="p-6 bg-card/70 border border-border/60 backdrop-blur-sm">
              {usersForRoles.length === 0 ? (
                <p className="text-sm text-foreground/60">
                  Nessun utente trovato al momento. Appena altri studenti si registreranno, li vedrai qui.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-xs text-foreground/60">
                        <th className="py-2 pr-4 text-left">Nome</th>
                        <th className="py-2 pr-4 text-left hidden md:table-cell">Email</th>
                        <th className="py-2 pr-4 text-left">XP / Livello</th>
                        <th className="py-2 pr-4 text-left">Ruolo</th>
                        <th className="py-2 pl-2 text-right">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersForRoles.map((u) => (
                        <tr key={u.id} className="border-b border-border/40 last:border-0 align-middle">
                          <td className="py-2 pr-4">
                            <div className="font-medium text-foreground">{u.full_name}</div>
                            <div className="md:hidden text-[11px] text-foreground/60">{u.email}</div>
                          </td>
                          <td className="py-2 pr-4 hidden md:table-cell text-xs text-foreground/70">{u.email}</td>
                          <td className="py-2 pr-4 text-xs text-foreground/70">
                            {u.xp_points} XP · Livello {u.level}
                          </td>
                          <td className="py-2 pr-4 text-xs capitalize text-foreground/80">{u.role}</td>
                          <td className="py-2 pl-2">
                            <form action={changeUserRole} className="flex items-center justify-end gap-2">
                              <input type="hidden" name="userId" value={u.id} />
                              <select
                                name="newRole"
                                defaultValue={u.role}
                                className="border border-border/60 bg-background text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="student">Studente</option>
                                <option value="admin">Admin</option>
                                <option value="hacker">Hacker</option>
                              </select>
                              <Button type="submit" size="sm" variant="outline" className="text-xs px-3">
                                Salva
                              </Button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>
        ) : (
          <section>
            <Card className="p-6 bg-card/70 border border-border/60 backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Gestione ruoli non disponibile
              </h2>
              <p className="text-sm text-foreground/70">
                Per attivare la gestione ruoli dalla dashboard hacker è necessario configurare la variabile
                <code className="mx-1 px-1.5 py-0.5 rounded bg-muted text-xs">SUPABASE_SERVICE_ROLE_KEY</code> nel backend.
              </p>
            </Card>
          </section>
        )}
      </div>
    </div>
  )
}
