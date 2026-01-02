"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, AlertCircle } from "lucide-react"
import { createQuiz, addQuizQuestion } from "@/lib/actions/quiz"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Question = {
  question: string
  options: string[]
  correct_answer: string
  explanation: string
}

export function QuizCreator() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [difficulty, setDifficulty] = useState("Facile")
  const [timeLimit, setTimeLimit] = useState<number | undefined>()
  const [passingScore, setPassingScore] = useState(70)
  const [subjectId, setSubjectId] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([])
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserRole()
    loadSubjects()
  }, [])

  async function loadSubjects() {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .order("name")
      
      if (!error && data) {
        // Remove duplicates based on name
        const uniqueSubjects = data.filter((subject, index, self) => 
          index === self.findIndex((s) => s.name === subject.name)
        )
        setSubjects(uniqueSubjects)
      }
    } catch (error) {
      console.error("Error loading subjects:", error)
    }
  }

  async function checkUserRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

      const isAdmin = userData?.role === "hacker" || userData?.role === "teacher"
      setIsAdmin(isAdmin)

      if (!isAdmin) {
        toast({
          title: "Accesso Negato",
          description: "Solo gli hacker della classe o i teacher possono creare quiz",
          variant: "destructive",
        })
        router.push("/quiz")
      }
    } catch (error) {
      console.error("Error checking user role:", error)
      router.push("/quiz")
    } finally {
      setLoading(false)
    }
  }

  function addQuestion() {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
      },
    ])
  }

  function updateQuestion(index: number, field: keyof Question, value: any) {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex] = value
    setQuestions(updated)
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  async function handleSave() {
    console.log("handleSave called")
    console.log("Form data:", { title, description, subjectId, questionsCount: questions.length })
    
    if (!title || !description || !subjectId || questions.length === 0) {
      console.log("Validation failed - missing required fields")
      toast({
        title: "Errore",
        description: "Compila tutti i campi e aggiungi almeno una domanda",
        variant: "destructive",
      })
      return
    }

    // Validate questions
    const invalidQuestions = questions.filter((q, index) => {
      const isInvalid = !q.question.trim() || 
                       q.options.filter(o => o.trim()).length < 2 || 
                       !q.correct_answer.trim()
      if (isInvalid) {
        console.log(`Invalid question ${index + 1}:`, q)
      }
      return isInvalid
    })

    if (invalidQuestions.length > 0) {
      console.log("Validation failed - invalid questions")
      toast({
        title: "Errore nelle domande",
        description: "Assicurati che ogni domanda abbia testo, almeno 2 opzioni e una risposta corretta",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      console.log("Attempting to create quiz...")
      
      // Create quiz
      const quiz = await createQuiz({
        title,
        description,
        difficulty,
        time_limit: timeLimit,
        passing_score: passingScore,
        subject_id: subjectId,
      })

      console.log("Quiz created successfully:", quiz.id)

      // Add questions
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        console.log(`Adding question ${i + 1}:`, question)
        
        await addQuizQuestion(quiz.id, question)
        console.log(`Question ${i + 1} added successfully`)
      }

      console.log("All questions added successfully")

      toast({
        title: "Quiz creato!",
        description: "Il quiz è stato pubblicato con successo",
      })

      router.push("/quiz")
    } catch (error) {
      console.error("=== QUIZ CREATION ERROR ===")
      console.error("Full error object:", error)
      console.error("Error type:", typeof error)
      console.error("Error constructor:", error?.constructor?.name)
      console.error("Error keys:", error ? Object.keys(error) : "null")
      
      // Try to log specific properties
      if (error && typeof error === 'object') {
        const errorObj = error as any
        console.error("Error code:", errorObj.code)
        console.error("Error message:", errorObj.message)
        console.error("Error details:", errorObj.details)
        console.error("Error hint:", errorObj.hint)
      }
      
      let errorMessage = "Impossibile creare il quiz"
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (error && typeof error === 'object') {
        const errorObj = error as any
        errorMessage = errorObj.message || errorObj.error_description || `Errore: ${JSON.stringify(error, null, 2)}`
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      console.error("Final error message to show user:", errorMessage)
      console.error("=== END ERROR ===")
      
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verifica permessi...</p>
        </Card>
      ) : !isAdmin ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Accesso Negato</h2>
          <p className="text-muted-foreground">Solo gli amministratori possono creare quiz.</p>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Informazioni Quiz</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Titolo <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es: Quiz di Matematica - Capitolo 3"
                  className={!title ? "border-red-300" : ""}
                />
                {!title && <p className="text-xs text-red-500 mt-1">Il titolo è obbligatorio</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Descrizione <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descrizione del quiz..."
                  className={!description ? "border-red-300" : ""}
                />
                {!description && <p className="text-xs text-red-500 mt-1">La descrizione è obbligatoria</p>}
              </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Difficoltà</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facile">Facile</SelectItem>
                  <SelectItem value="Intermedio">Intermedio</SelectItem>
                  <SelectItem value="Difficile">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tempo Limite (min)</label>
              <Input
                type="number"
                value={timeLimit || ""}
                onChange={(e) => setTimeLimit(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                placeholder="Opzionale"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Punteggio Minimo (%)</label>
              <Input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(Number.parseInt(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Materia <span className="text-red-500">*</span>
            </label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className={!subjectId ? "border-red-300" : ""}>
                <SelectValue placeholder="Seleziona una materia" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!subjectId && <p className="text-xs text-red-500 mt-1">La materia è obbligatoria</p>}
            {subjects.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Nessuna materia disponibile. Contatta un amministratore per aggiungere materie.
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Domande ({questions.length})</h2>
        <Button onClick={addQuestion} className="gap-2">
          <Plus className="w-4 h-4" />
          Aggiungi Domanda
        </Button>
      </div>

      {questions.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aggiungi almeno una domanda per creare il quiz</p>
        </Card>
      )}

      {questions.map((question, qIndex) => (
        <Card key={qIndex} className={`p-6 ${!question.question.trim() || question.options.filter(o => o.trim()).length < 2 || !question.correct_answer.trim() ? 'border-red-300' : ''}`}>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold">Domanda {qIndex + 1}</h3>
            <Button variant="ghost" size="sm" onClick={() => removeQuestion(qIndex)} className="text-red-500">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Testo Domanda <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={question.question}
                onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                placeholder="Scrivi la domanda..."
                className={!question.question.trim() ? "border-red-300" : ""}
              />
              {!question.question.trim() && <p className="text-xs text-red-500 mt-1">Il testo della domanda è obbligatorio</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Opzioni di Risposta <span className="text-red-500">*</span> (minimo 2)
              </label>
              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <Input
                    key={oIndex}
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    placeholder={`Opzione ${oIndex + 1}`}
                    className={!option.trim() && oIndex < 2 ? "border-red-300" : ""}
                  />
                ))}
              </div>
              {question.options.filter(o => o.trim()).length < 2 && (
                <p className="text-xs text-red-500 mt-1">Sono necessarie almeno 2 opzioni compilate</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Risposta Corretta <span className="text-red-500">*</span>
              </label>
              <Select
                value={question.correct_answer}
                onValueChange={(value) => updateQuestion(qIndex, "correct_answer", value)}
              >
                <SelectTrigger className={!question.correct_answer.trim() ? "border-red-300" : ""}>
                  <SelectValue placeholder="Seleziona risposta corretta" />
                </SelectTrigger>
                <SelectContent>
                  {question.options
                    .filter((o) => o)
                    .map((option, i) => (
                      <SelectItem key={i} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {!question.correct_answer.trim() && <p className="text-xs text-red-500 mt-1">Seleziona una risposta corretta</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Spiegazione (opzionale)</label>
              <Textarea
                value={question.explanation}
                onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                placeholder="Spiega perché questa è la risposta corretta..."
              />
            </div>
          </div>
        </Card>
      ))}

      <Button 
        onClick={handleSave} 
        disabled={saving || !title.trim() || !description.trim() || !subjectId.trim() || questions.length === 0} 
        className="w-full gap-2 bg-primary hover:bg-primary/90" 
        size="lg"
      >
        <Save className="w-4 h-4" />
        {saving ? "Salvataggio..." : "Salva e Pubblica Quiz"}
      </Button>
    </>
  )}
</div>
  )
}
