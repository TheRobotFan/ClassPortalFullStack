"use client"

import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { BookOpen, HelpCircle, Lightbulb } from "lucide-react"
import Link from "next/link"

export default function GuidaPage() {
  const guides = [
    {
      title: "Come utilizzare gli Esercizi",
      icon: BookOpen,
      content: "Scopri come accedere, risolvere e condividere gli esercizi con i tuoi compagni.",
    },
    {
      title: "Partecipare alle Discussioni",
      icon: HelpCircle,
      content: "Impara come creare discussioni, rispondere e collaborare nel forum.",
    },
    {
      title: "Guadagnare XP e Badge",
      icon: Lightbulb,
      content: "Scopri come il sistema di gamification ti aiuta a motivarti e competere.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
          Guida del Portale
        </h1>
        <p className="text-foreground/70 mb-12 text-lg max-w-2xl">
          Benvenuto! Qui troverai tutte le informazioni di cui hai bisogno per usare al meglio il portale della classe 1R.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {guides.map((guide, idx) => {
            const Icon = guide.icon

            // Per la voce "Guadagnare XP e Badge" aggiungiamo un link alla pagina dedicata
            const isXPGuide = guide.title === "Guadagnare XP e Badge"

            const content = (
              <Card className="p-6 h-full bg-card/70 border border-border/60 backdrop-blur-sm rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/60">
                <Icon className="w-12 h-12 text-primary mb-4" />
                <h2 className="text-xl font-bold mb-3">{guide.title}</h2>
                <p className="text-foreground/70">{guide.content}</p>
              </Card>
            )

            return isXPGuide ? (
              <Link key={idx} href="/guida/xp-badge" className="block h-full">
                {content}
              </Link>
            ) : (
              <div key={idx} className="h-full">
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
