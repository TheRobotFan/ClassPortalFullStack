import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, BookOpen, Award, Calendar, MapPin, Mail, Phone } from "lucide-react"
import { getDashboardStats } from "@/lib/actions/dashboard"

export default async function ScopriPiuPage() {
  const stats = await getDashboardStats()
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Scopri la Classe 1R</h1>
          <p className="text-lg text-foreground/70">
            Informazioni complete sul portale e sulla tua comunità scolastica
          </p>
        </div>

        {/* Classe Info */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">Classe 1R</h2>
            </div>
            <div className="space-y-4 text-foreground/80">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Istituto</p>
                <p className="font-semibold">I.T.T. Galileo Ferraris</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-1">Specializzazione</p>
                <p className="font-semibold">Informatica e Telecomunicazioni</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-1">Numero studenti registrati</p>
                <p className="font-semibold">{stats.usersCount || 0} studenti</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-1">Coordinatore</p>
                <p className="font-semibold">Prof. Giuseppe Rossi</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-1">Anno Scolastico</p>
                <p className="font-semibold">2024/2025</p>
              </div>
            </div>
          </Card>

          {/* Portal Stats */}
          <div className="space-y-4">
            <Card className="p-6 bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Esercizi</p>
                  <p className="text-3xl font-bold text-primary">{stats.exercisesCount || 0}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary/40" />
              </div>
            </Card>
            <Card className="p-6 bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Discussioni attive</p>
                  <p className="text-3xl font-bold text-secondary">{stats.forumCount || 0}</p>
                </div>
                <Users className="w-8 h-8 text-secondary/40" />
              </div>
            </Card>
            <Card className="p-6 bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Appunti condivisi</p>
                  <p className="text-3xl font-bold text-primary">{stats.materialsCount || 0}</p>
                </div>
                <Award className="w-8 h-8 text-primary/40" />
              </div>
            </Card>
          </div>
        </div>

        {/* About the Portal */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Il Portale della Classe 1R</h2>
          <div className="grid md:grid-cols-2 gap-8 text-foreground/80">
            <div>
              <h3 className="font-semibold mb-3 text-primary">Cos'è?</h3>
              <p className="leading-relaxed">
                Il Portale della Classe 1R è una piattaforma digitale moderna creata dai rappresentanti di classe per
                facilitare la collaborazione e l'apprendimento condiviso tra studenti. È uno spazio virtuale dove
                condividere risorse, discutere di argomenti scolastici e lavorare insieme su progetti.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-secondary">Cosa Puoi Fare?</h3>
              <ul className="space-y-2">
                <li>✓ Accedere a esercizi e quiz per ogni materia</li>
                <li>✓ Condividere e scaricare appunti</li>
                <li>✓ Partecipare a discussioni e forum</li>
                <li>✓ Collaborare su progetti di gruppo</li>
                <li>✓ Tracciare il tuo progresso con la gamification</li>
                <li>✓ Ottenere riconoscimenti e badge</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Sezioni Principali</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Esercizi</h3>
              <p className="text-sm text-foreground/60">Quiz e esercizi pratici per ogni materia con soluzioni</p>
            </Card>
            <Card className="p-6 text-center">
              <Users className="w-8 h-8 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Forum</h3>
              <p className="text-sm text-foreground/60">Discussioni tra compagni di classe su argomenti scolastici</p>
            </Card>
            <Card className="p-6 text-center">
              <Award className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Gamification</h3>
              <p className="text-sm text-foreground/60">Guadagna XP, badge e sali nella classifica</p>
            </Card>
            <Card className="p-6 text-center">
              <Calendar className="w-8 h-8 text-secondary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Progetti</h3>
              <p className="text-sm text-foreground/60">Lavora in team su progetti didattici importanti</p>
            </Card>
          </div>
        </div>

        {/* Contact Info */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 mb-12">
          <h2 className="text-2xl font-bold mb-6">Contattaci</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <Mail className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-foreground/60">Email</p>
                <p className="font-semibold">classe1r@ittgalilei.it</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="w-6 h-6 text-secondary" />
              <div>
                <p className="text-sm text-foreground/60">Telefono</p>
                <p className="font-semibold">+39 011 234 5678</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-foreground/60">Ubicazione</p>
                <p className="font-semibold">Torino, Italia</p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Pronto a Iniziare?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">Torna alla Home</Button>
            </Link>
            <Link href="/esercizi">
              <Button variant="outline" className="bg-transparent">
                Esplora Esercizi
              </Button>
            </Link>
            <Link href="/forum">
              <Button variant="outline" className="bg-transparent">
                Visita il Forum
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
