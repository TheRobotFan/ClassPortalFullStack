import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { BadgeCheck, Star, Trophy, Sparkles } from "lucide-react"
import Link from "next/link"

const xpActions = [
  {
    title: "Completa il tuo profilo",
    xp: "+100 XP",
    description: "Compila nome, cognome e le informazioni principali del profilo.",
  },
  {
    title: "Carica un appunto",
    xp: "+30 XP",
    description: "Ogni materiale che carichi (appunti, riassunti, schemi) ti dà XP.",
  },
  {
    title: "Crea una discussione nel forum",
    xp: "+15 XP",
    description: "Apri un nuovo thread per fare una domanda o avviare una discussione.",
  },
  {
    title: "Scrivi un commento nel forum",
    xp: "+8 XP",
    description: "Rispondi alle discussioni aiutando i compagni.",
  },
  {
    title: "Commenta un appunto",
    xp: "+5 XP",
    description: "Lascia feedback o chiarimenti sotto un materiale.",
  },
  {
    title: "Crea un esercizio",
    xp: "+25 XP",
    description: "Aggiungi un nuovo esercizio con domanda e soluzione.",
  },
  {
    title: "Crea un quiz (admin/teacher)",
    xp: "+50 XP",
    description: "Crea un quiz strutturato per l'intera classe.",
  },
]

const quizXPInfo = {
  title: "Completare un quiz",
  description:
    "Quando completi un quiz guadagni XP in base al punteggio e alla difficoltà: più risposte giuste e quiz difficili = più XP.",
  details: [
    "XP base calcolata dalla percentuale di risposte corrette",
    "Bonus XP se superi determinate soglie di punteggio",
    "I quiz Intermedi e Difficili moltiplicano gli XP ottenuti",
    "In pratica puoi arrivare a diverse decine di XP per un quiz ben fatto",
  ],
}

const noXpActions = [
  "Visualizzare materiali o esercizi",
  "Mettere like",
  "Semplici visualizzazioni di pagine",
  "Download di appunti",
]

export default function XPBadgeGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400" />
            Come guadagnare XP e Badge
          </h1>
          <p className="text-foreground/70 text-base md:text-lg">
            Il sistema di gamification ti premia per le azioni che aiutano davvero la community: caricare contenuti utili,
            partecipare alle discussioni, creare esercizi e quiz.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Azioni che danno XP
          </h2>
          <p className="text-foreground/70">
            Di seguito trovi le azioni principali che ti fanno guadagnare XP. I valori sono quelli realmente usati dal sito.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {xpActions.map((action) => (
              <Card key={action.title} className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-base md:text-lg">{action.title}</h3>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {action.xp}
                  </span>
                </div>
                <p className="text-sm text-foreground/70">{action.description}</p>
              </Card>
            ))}

            <Card className="p-4 flex flex-col gap-2 border-primary/40 bg-primary/5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-base md:text-lg">{quizXPInfo.title}</h3>
                <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">XP variabile</span>
              </div>
              <p className="text-sm text-foreground/70 mb-2">{quizXPInfo.description}</p>
              <ul className="list-disc list-inside text-sm text-foreground/70 space-y-1">
                {quizXPInfo.details.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Cosa <span className="text-red-500">non</span> dà XP</h2>
          <p className="text-foreground/70">
            Per evitare farming di XP con azioni troppo semplici, alcune attività non danno punti esperienza.
          </p>
          <Card className="p-4">
            <ul className="list-disc list-inside text-sm md:text-base text-foreground/70 space-y-1">
              {noXpActions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Badge: cosa sono e come si sbloccano
          </h2>
          <p className="text-foreground/70">
            I badge sono riconoscimenti speciali che ottieni automaticamente quando raggiungi certi traguardi: XP totali,
            numero di materiali caricati, discussioni create, quiz completati, giorni di attività e così via.
          </p>

          <Card className="p-4 space-y-3">
            <ul className="list-disc list-inside text-sm md:text-base text-foreground/70 space-y-1">
              <li>
                Alcuni badge sono legati agli <strong>XP totali</strong> (es. raggiungi una certa soglia di XP).
              </li>
              <li>
                Altri badge sono legati alle <strong>azioni</strong> (numero di appunti caricati, discussioni, commenti, quiz, ecc.).
              </li>
              <li>
                I requisiti esatti di ogni badge sono visibili nella <Link href="/badges" className="text-primary underline">pagina
                Badge</Link>.
              </li>
              <li>
                Quando sblocchi un badge, viene registrato nella tua storia e puoi vederlo insieme a quelli bloccati.
              </li>
            </ul>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BadgeCheck className="w-6 h-6 text-green-500" />
            Dove vedere XP e badge
          </h2>
          <Card className="p-4 text-sm md:text-base text-foreground/70 space-y-2">
            <p>
              <strong>Nel profilo</strong> puoi vedere i tuoi XP totali, il livello attuale e un riepilogo dei badge ottenuti.
            </p>
            <p>
              Nella <Link href="/badges" className="text-primary underline">pagina Badge</Link> trovi:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tutti i badge disponibili con descrizione e requisito (XP o conteggio azioni).</li>
              <li>I badge che hai già sbloccato e la data in cui li hai ottenuti.</li>
              <li>I badge ancora bloccati, con il requisito da raggiungere.</li>
            </ul>
          </Card>
        </section>
      </div>
    </div>
  )
}
