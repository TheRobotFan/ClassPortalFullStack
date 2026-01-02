"use server"

export async function generateAIInsights(data: {
  averageGrade: number
  subjectStats: Record<string, { total: number; count: number; average: number }>
  recentGrades: Array<{ grade_value: number | null; subject: string; date_given: string }>
  activeAssignments: number
  upcomingExams: number
  totalGrades: number
}): Promise<string[]> {
  const insights: string[] = []

  // Trova le materie più deboli
  const weakSubjects = Object.entries(data.subjectStats)
    .filter(([, stats]) => stats.average < 6)
    .sort(([,a], [,b]) => a.average - b.average)
    .slice(0, 3)

  // Analizza la media generale
  if (data.averageGrade >= 8) {
    insights.push("🎉 Eccellente! La tua media di " + data.averageGrade.toFixed(1) + " dimostra un ottimo livello di preparazione. Continua con questo approccio metodico allo studio.")
  } else if (data.averageGrade >= 6) {
    insights.push("📈 Buon lavoro! La tua media di " + data.averageGrade.toFixed(1) + " è sufficiente, ma c'è spazio per migliorare. Concentrati sulle materie più deboli.")
  } else {
    insights.push("⚠️ Attenzione: la tua media di " + data.averageGrade.toFixed(1) + " richiede un intervento immediato. Pianifica un programma di recupero intensivo.")
  }

  // Analizza le materie più deboli
  if (weakSubjects.length > 0) {
    insights.push("🎯 **Focus urgente**: Le tue materie più critiche sono " +
      weakSubjects.slice(0, 2).map(([subject]) => subject).join(" e ") +
      ". Dedica loro almeno il 60% del tuo tempo di studio.")
  }

  // Analizza il carico di lavoro
  if (data.activeAssignments > 5) {
    insights.push("🔴 **Overload**: Hai " + data.activeAssignments + " compiti attivi. Prioritizza e chiedi aiuto per gestire il carico.")
  } else if (data.upcomingExams > 3) {
    insights.push("🟡 **Preparazione esami**: Hai " + data.upcomingExams + " verifiche in arrivo. Inizia subito la preparazione distribuita.")
  }

  // Suggerimenti di metodo di studio
  if (data.totalGrades < 10) {
    insights.push("📚 **Costruzione base**: Con pochi voti registrati, concentrati su una preparazione solida. Studia regolarmente ogni giorno.")
  } else {
    insights.push("🎓 **Ottimizzazione**: Con una buona base di voti, lavora sui dettagli. Usa tecniche di spaced repetition e active recall.")
  }

  // Consigli generali se non abbiamo abbastanza dati specifici
  if (insights.length < 4) {
    insights.push("🎯 Studia regolarmente ogni giorno per almeno 1-2 ore")
    insights.push("📚 Concentrati prima sulle materie dove hai voti più bassi")
    insights.push("✅ Completa i compiti per tempo per evitare accumuli")
    insights.push("🧠 Usa tecniche di ripetizione spaziata per ricordare meglio")
    insights.push("📝 Prepara schemi riassuntivi per ogni argomento")
    insights.push("🎓 Chiedi aiuto quando non capisci qualcosa")
  }

  return insights.slice(0, 6) // Massimo 6 consigli
}
