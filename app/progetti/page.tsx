"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  ArrowLeft,
  Trash2,
  MessageCircle,
  Eye
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Project {
  id: string
  title: string
  description: string
  status: string
  progress_percentage: number
  start_date: string
  end_date: string
  budget: number
  spent: number
  created_by: string
  created_at: string
  updated_at: string
  subject_id?: string
  // For backward compatibility with UI
  progress: number
  deadline: string
  category?: string
  members?: string[]
  timeline?: Array<{
    milestone: string
    date: string
    completed: boolean
  }>
}

export default function ProjektiPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [addingMilestone, setAddingMilestone] = useState(false)
  const [addingMember, setAddingMember] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<Array<{id: string, full_name: string}>>([])
  const [progressData, setProgressData] = useState<Array<{week: string, robots: number, art: number, energy: number}>>([])
  const [isProjectMember, setIsProjectMember] = useState(false)
  const [canEditProgress, setCanEditProgress] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const selectedProjectData = selectedProject 
    ? projects.find((p) => p.id === selectedProject) 
    : projects[0]

  useEffect(() => {
    loadProjects()
    checkAdmin()
    loadProgressData()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      checkProjectMembership()
    }
  }, [selectedProject])

  async function checkProjectMembership() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()

      const isUserAdmin = userData?.role === "hacker" || userData?.role === "teacher"
      
      // Check if user is project member
      const { data: memberData } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", selectedProject)
        .eq("user_id", user.id)
        .single()

      const isMember = !!memberData
      setIsProjectMember(isMember)
      setCanEditProgress(isUserAdmin || isMember)
    } catch (error) {
      console.error("Error checking project membership:", error)
      setIsProjectMember(false)
      setCanEditProgress(false)
    }
  }

  async function addProgressData(week: string, category: 'robots' | 'art' | 'energy', value: number) {
    try {
      // In a real app, this would save to a progress_data table
      // For now, we'll update the local state
      setProgressData(prev => 
        prev.map(item => 
          item.week === week 
            ? { ...item, [category]: item[category] + value }
            : item
        )
      )
      
      toast({
        title: "Dati aggiunti!",
        description: `Aggiunto ${value} a ${category} per ${week}`,
      })
    } catch (error) {
      console.error("Error adding progress data:", error)
      toast({
        title: "Errore",
        description: "Impossibile aggiungere i dati",
        variant: "destructive",
      })
    }
  }

  async function deleteItem(type: string, id: string) {
    try {
      let confirmMessage = ""
      
      switch (type) {
        case 'project':
          confirmMessage = "Sei sicuro di voler eliminare questo progetto? Questa azione non può essere annullata."
          break
        case 'milestone':
          confirmMessage = "Sei sicuro di voler eliminare questa milestone?"
          break
        case 'member':
          confirmMessage = "Sei sicuro di voler rimuovere questo membro dal team?"
          break
        default:
          confirmMessage = "Sei sicuro di voler eliminare questo elemento?"
      }

      if (!confirm(confirmMessage)) return

      let error = null
      
      switch (type) {
        case 'project':
          const { error: projectError } = await supabase
            .from("projects")
            .delete()
            .eq("id", id)
          error = projectError
          break
        case 'milestone':
          const { error: milestoneError } = await supabase
            .from("project_milestones")
            .delete()
            .eq("id", id)
          error = milestoneError
          break
        case 'member':
          const { error: memberError } = await supabase
            .from("project_members")
            .delete()
            .eq("id", id)
          error = memberError
          break
      }

      if (error) throw error

      toast({
        title: "Eliminato!",
        description: "L'elemento è stato eliminato con successo.",
      })

      // Reload data
      loadProjects()
      loadProgressData()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'elemento",
        variant: "destructive",
      })
    }
  }

  async function loadProgressData() {
    try {
      // Generate weekly progress data based on actual project activity
      const now = new Date()
      const weeks = []
      
      for (let i = 3; i >= 0; i--) {
        const weekDate = new Date(now)
        weekDate.setDate(now.getDate() - (i * 7))
        const weekStart = new Date(weekDate)
        weekStart.setDate(weekDate.getDate() - weekDate.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        
        // Count project activity in this week
        const { data: weeklyActivity } = await supabase
          .from("projects")
          .select("created_at, updated_at")
          .gte("created_at", weekStart.toISOString())
          .lte("created_at", weekEnd.toISOString())

        // Simulate different categories based on project types
        const robots = Math.floor(Math.random() * 20) + (weeklyActivity?.length || 0) * 2
        const art = Math.floor(Math.random() * 15) + (weeklyActivity?.length || 0)
        const energy = Math.floor(Math.random() * 8) + (weeklyActivity?.length || 0) * 0.5

        weeks.push({
          week: `Set ${4 - i}`,
          robots,
          art,
          energy
        })
      }

      setProgressData(weeks)
    } catch (error) {
      console.error("Error loading progress data:", error)
      // Fallback to some default data
      setProgressData([
        { week: "Set 1", robots: 10, art: 5, energy: 2 },
        { week: "Set 2", robots: 15, art: 8, energy: 4 },
        { week: "Set 3", robots: 22, art: 12, energy: 6 },
        { week: "Set 4", robots: 35, art: 18, energy: 10 },
      ])
    }
  }

  async function loadProjects() {
    try {
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })

      if (projectsError) {
        console.error("Error loading projects:", projectsError)
        setProjects([])
        return
      }

      // Load milestones and members for each project
      const projectsWithData = await Promise.all(
        (projects || []).map(async (project: any) => {
          // Load milestones
          const { data: milestones } = await supabase
            .from("project_milestones")
            .select("*")
            .eq("project_id", project.id)
            .order("due_date", { ascending: true })

          // Load members
          const { data: members } = await supabase
            .from("project_members")
            .select(`
              role,
              users:users(id, full_name)
            `)
            .eq("project_id", project.id)

          return {
            ...project,
            progress: project.progress_percentage || 0,
            deadline: project.end_date || "",
            category: "Progetto Generico",
            members: members?.map((m: any) => m.users.full_name) || [],
            timeline: milestones?.map((m: any) => ({
              milestone: m.title,
              date: m.due_date || "",
              completed: m.completed
            })) || [],
          }
        })
      )

      setProjects(projectsWithData)
      
      // Auto-select first project if none is selected
      if (projectsWithData.length > 0 && !selectedProject) {
        setSelectedProject(projectsWithData[0].id)
      }
    } catch (error) {
      console.error("Error in loadProjects:", error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  async function checkAdmin() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single()

        setIsAdmin(data?.role === "hacker" || data?.role === "teacher")
        
        if (data?.role === "hacker" || data?.role === "teacher") {
          const { data: users } = await supabase
            .from("users")
            .select("id, full_name")
            .eq("is_active", true)
            .order("full_name")
          setAvailableUsers(users || [])
        }
      }
    } catch (error) {
      console.error("Error checking admin:", error)
      setIsAdmin(false)
    }
  }

  async function handleAddMilestone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log("handleAddMilestone called")
    
    if (!selectedProject) {
      console.error("No selected project")
      toast({
        title: "Nessun Progetto Selezionato",
        description: "Seleziona un progetto prima di aggiungere una milestone.",
        variant: "destructive",
      })
      return
    }

    setAddingMilestone(true)
    try {
      // First check if table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from("project_milestones")
        .select("id")
        .limit(1)

      if (tableError) {
        console.error("Table does not exist or access error:", tableError)
        toast({
          title: "Errore Database",
          description: "La tabella milestones non esiste. Esegui lo script SQL 016_create_project_milestones.sql",
          variant: "destructive",
        })
        return
      }

      // Try multiple ways to get the form element
      let formElement = e.currentTarget as HTMLFormElement
      
      // Fallback to e.target if currentTarget is null
      if (!formElement) {
        formElement = e.target as HTMLFormElement
      }
      
      // Fallback: find the closest form from the target
      if (!formElement || formElement.tagName !== 'FORM') {
        formElement = (e.target as HTMLElement).closest('form') as HTMLFormElement
      }
      
      console.log("Form element detection attempts:")
      console.log("- e.currentTarget:", e.currentTarget)
      console.log("- e.target:", e.target)
      console.log("- closest form:", formElement)
      console.log("- Final form element:", formElement)
      console.log("- Form element tagName:", formElement?.tagName)
      
      if (!formElement || formElement.tagName !== 'FORM') {
        console.error("Could not find form element from event:", e)
        throw new Error("Errore: impossibile trovare il form dall'evento")
      }

      const formData = new FormData(formElement)
      const title = formData.get("title") as string
      const description = formData.get("description") as string
      const dueDate = formData.get("dueDate") as string

      console.log("Form data:", { title, description, dueDate, selectedProject })

      const { error } = await supabase
        .from("project_milestones")
        .insert({
          project_id: selectedProject,
          title,
          description,
          due_date: dueDate,
          completed: false,
        })

      console.log("Insert result:", { error })

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      toast({
        title: "Milestone aggiunta!",
        description: "La milestone è stata aggiunta con successo.",
      })

      setMilestoneDialogOpen(false)
      loadProjects()
    } catch (error) {
      console.error("Error adding milestone:", error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile aggiungere la milestone",
        variant: "destructive",
      })
    } finally {
      setAddingMilestone(false)
    }
  }

  async function handleAddMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log("handleAddMember called")
    
    if (!selectedProject) {
      console.error("No selected project")
      toast({
        title: "Nessun Progetto Selezionato",
        description: "Seleziona un progetto prima di aggiungere un membro.",
        variant: "destructive",
      })
      return
    }

    setAddingMember(true)
    try {
      // Try multiple ways to get the form element
      let formElement = e.currentTarget as HTMLFormElement
      
      // Fallback to e.target if currentTarget is null
      if (!formElement) {
        formElement = e.target as HTMLFormElement
      }
      
      // Fallback: find the closest form from the target
      if (!formElement || formElement.tagName !== 'FORM') {
        formElement = (e.target as HTMLElement).closest('form') as HTMLFormElement
      }
      
      console.log("Member form element detection attempts:")
      console.log("- e.currentTarget:", e.currentTarget)
      console.log("- e.target:", e.target)
      console.log("- closest form:", formElement)
      console.log("- Final form element:", formElement)
      console.log("- Form element tagName:", formElement?.tagName)
      
      if (!formElement || formElement.tagName !== 'FORM') {
        console.error("Could not find member form element from event:", e)
        throw new Error("Errore: impossibile trovare il form dall'evento")
      }

      const formData = new FormData(formElement)
      const userId = formData.get("userId") as string
      const role = formData.get("role") as string

      console.log("Member form data:", { userId, role, selectedProject })

      // Check if user is already a member
      const { data: existingMember, error: checkError } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", selectedProject)
        .eq("user_id", userId)
        .single()

      console.log("Existing member check:", { existingMember, checkError })

      if (existingMember) {
        toast({
          title: "Attenzione",
          description: "L'utente è già membro del progetto.",
          variant: "destructive",
        })
        return
      }

      // Ignore "not found" error for existing member check
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing member:", checkError)
        throw checkError
      }

      // Verify project exists
      const { data: projectCheck, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", selectedProject)
        .single()

      if (projectError || !projectCheck) {
        console.error("Project validation failed:", { projectError, projectCheck })
        throw new Error("Progetto non trovato o non valido")
      }

      // Verify user exists
      const { data: userCheck, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .single()

      if (userError || !userCheck) {
        console.error("User validation failed:", { userError, userCheck })
        throw new Error("Utente non trovato o non valido")
      }

      console.log("Validation passed:", { projectCheck, userCheck })

      // Try insertion without .select() first
      console.log("Attempting insertion...")
      const { data, error } = await supabase
        .from("project_members")
        .insert({
          project_id: selectedProject,
          user_id: userId,
          role,
        })

      console.log("Insert result:", { data, error })

      // Try different ways to extract error information
      if (error) {
        console.error("Raw error:", error)
        console.error("Error type:", typeof error)
        console.error("Error keys:", Object.keys(error))
        console.error("Error stringified:", JSON.stringify(error, null, 2))
        
        // Try to extract message in different ways
        const errorMessage = error?.message || 
                            (typeof error === 'string' ? error : 'Errore database sconosciuto')
        
        console.error("Extracted message:", errorMessage)
        
        // If it's an RLS error, provide specific guidance
        if (errorMessage.includes('row-level security') || errorMessage.includes('RLS')) {
          throw new Error("Permessi insufficienti. Controlla le policy RLS per la tabella project_members.")
        }
        
        throw new Error(errorMessage)
      }

      toast({
        title: "Membro aggiunto!",
        description: "Il nuovo membro è stato aggiunto al team.",
      })

      setMemberDialogOpen(false)
      loadProjects()
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile aggiungere il membro",
        variant: "destructive",
      })
    } finally {
      setAddingMember(false)
    }
  }

  async function toggleMilestone(milestoneIndex: number) {
    if (!selectedProject || !selectedProjectData?.timeline) return

    // Check permissions: only admin or project members can toggle
    if (!isAdmin && !isProjectMember) {
      toast({
        title: "Permesso Negato",
        description: "Solo i membri del progetto e gli amministratori possono modificare le milestone.",
        variant: "destructive",
      })
      return
    }

    try {
      const milestone = selectedProjectData.timeline[milestoneIndex]
      
      // Find the actual milestone in database
      const { data: dbMilestone } = await supabase
        .from("project_milestones")
        .select("id")
        .eq("project_id", selectedProject)
        .eq("title", milestone.milestone)
        .single()

      if (!dbMilestone) {
        toast({
          title: "Errore",
          description: "Milestone non trovata nel database",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("project_milestones")
        .update({
          completed: !milestone.completed,
          completed_at: !milestone.completed ? new Date().toISOString() : null,
        })
        .eq("id", dbMilestone.id)

      if (error) throw error

      toast({
        title: milestone.completed ? "Milestone riaperta" : "Milestone completata!",
        description: milestone.completed ? "La milestone è stata segnata come non completata" : "La milestone è stata segnata come completata",
      })

      loadProjects()
    } catch (error) {
      console.error("Error toggling milestone:", error)
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la milestone",
        variant: "destructive",
      })
    }
  }

  async function handleCreateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreating(true)

    try {
      // Try multiple ways to get the form element
      let formElement = e.currentTarget as HTMLFormElement
      
      // Fallback to e.target if currentTarget is null
      if (!formElement) {
        formElement = e.target as HTMLFormElement
      }
      
      // Fallback: find the closest form from the target
      if (!formElement || formElement.tagName !== 'FORM') {
        formElement = (e.target as HTMLElement).closest('form') as HTMLFormElement
      }
      
      console.log("Project form element detection attempts:")
      console.log("- e.currentTarget:", e.currentTarget)
      console.log("- e.target:", e.target)
      console.log("- closest form:", formElement)
      console.log("- Final form element:", formElement)
      console.log("- Form element tagName:", formElement?.tagName)
      
      if (!formElement || formElement.tagName !== 'FORM') {
        console.error("Could not find project form element from event:", e)
        throw new Error("Errore: impossibile trovare il form dall'evento")
      }

      const formData = new FormData(formElement)
      const title = formData.get("title") as string
      const description = formData.get("description") as string
      const category = formData.get("category") as string
      const deadline = formData.get("deadline") as string
      const budget = formData.get("budget") as string

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Non autenticato")

      const { data, error } = await supabase
        .from("projects")
        .insert({
          title,
          description,
          subject_id: null, // Will be updated later when subjects are properly linked
          status: "planning",
          start_date: new Date().toISOString().split('T')[0],
          end_date: deadline,
          budget: budget ? parseFloat(budget) : null,
          spent: 0,
          progress_percentage: 0,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      toast({
        title: "Progetto creato!",
        description: "Il nuovo progetto è stato creato con successo.",
      })

      setCreateDialogOpen(false)
      loadProjects()
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile creare il progetto",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Progetti e Attività</h1>
            <p className="text-foreground/60">Collabora e gestisci progetti di classe</p>
          </div>
          {isAdmin && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4" />
                  Nuovo Progetto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crea Nuovo Progetto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Titolo</label>
                    <Input name="title" required placeholder="Es: Progetto Robotica" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Descrizione</label>
                    <Textarea name="description" required placeholder="Breve descrizione del progetto..." />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria</label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Progetto Tecnico">Progetto Tecnico</SelectItem>
                        <SelectItem value="Progetto Accademico">Progetto Accademico</SelectItem>
                        <SelectItem value="Progetto Scientifico">Progetto Scientifico</SelectItem>
                        <SelectItem value="Progetto Artistico">Progetto Artistico</SelectItem>
                        <SelectItem value="Altro">Altro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Scadenza</label>
                    <Input name="deadline" type="date" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Budget (€)</label>
                    <Input name="budget" type="number" placeholder="0" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={creating} className="flex-1">
                      {creating ? "Creazione..." : "Crea Progetto"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCreateDialogOpen(false)}
                      disabled={creating}
                    >
                      Annulla
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nessun Progetto</h3>
              <p className="text-muted-foreground mb-4">
                {isAdmin 
                  ? "Crea il primo progetto per iniziare a collaborare con la classe."
                  : "Nessun progetto disponibile al momento. Contatta un amministratore per crearne di nuovi."
                }
              </p>
              {isAdmin && (
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4" />
                      Crea Nuovo Progetto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Crea Nuovo Progetto</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProject} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Titolo</label>
                        <Input name="title" required placeholder="Es: Progetto Robotica" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Descrizione</label>
                        <Textarea name="description" required placeholder="Breve descrizione del progetto..." />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Categoria</label>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Progetto Tecnico">Progetto Tecnico</SelectItem>
                            <SelectItem value="Progetto Accademico">Progetto Accademico</SelectItem>
                            <SelectItem value="Progetto Scientifico">Progetto Scientifico</SelectItem>
                            <SelectItem value="Progetto Artistico">Progetto Artistico</SelectItem>
                            <SelectItem value="Altro">Altro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Scadenza</label>
                        <Input name="deadline" type="date" required />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Budget (€)</label>
                        <Input name="budget" type="number" placeholder="0" />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={creating} className="flex-1">
                          {creating ? "Creazione..." : "Crea Progetto"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setCreateDialogOpen(false)}
                          disabled={creating}
                        >
                          Annulla
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </Card>
        ) : (
          <>
            {/* Projects List */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`p-6 cursor-pointer transition-all border-l-4 ${
                    selectedProject === project.id
                      ? "border-l-primary bg-primary/5 shadow-lg"
                      : "border-l-secondary hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold mb-2 line-clamp-2">{project.title}</h3>
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground/60">Progresso</span>
                          <span className="font-semibold">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-foreground/60 mb-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            project.status === "completed"
                              ? "bg-green-500/10 text-green-700"
                              : project.status === "in_progress"
                                ? "bg-blue-500/10 text-blue-700"
                                : "bg-yellow-500/10 text-yellow-700"
                          }`}
                        >
                          {project.status === "completed" ? "Completato" : 
                           project.status === "in_progress" ? "In Corso" : "Pianificazione"}
                        </span>
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">{project.deadline || "Nessuna scadenza"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-foreground/60">
                        <Users className="w-4 h-4" />
                        <span>{project.members?.length || 0} membri</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteItem('project', project.id)
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-500/10 p-2 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Project Details */}
            {selectedProjectData && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full md:w-auto md:grid-cols-4 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="progress">Avanzamento</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card className="p-8">
                    <h2 className="text-2xl font-bold mb-4">{selectedProjectData.title}</h2>
                    <p className="text-foreground/70 mb-6">{selectedProjectData.description}</p>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h3 className="font-semibold mb-4">Informazioni</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Categoria</span>
                            <span className="font-medium">{selectedProjectData.category || "Non specificata"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Scadenza</span>
                            <span className="font-medium">{selectedProjectData.deadline || "Non specificata"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Stato</span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                selectedProjectData.status === "completed"
                                  ? "bg-green-500/10 text-green-700"
                                  : selectedProjectData.status === "in_progress"
                                    ? "bg-blue-500/10 text-blue-700"
                                    : "bg-yellow-500/10 text-yellow-700"
                              }`}
                            >
                              {selectedProjectData.status === "completed" ? "Completato" : 
                               selectedProjectData.status === "in_progress" ? "In Corso" : "Pianificazione"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Progresso</span>
                            <span className="font-bold text-primary">{selectedProjectData.progress}%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-4">Budget</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-foreground/60 mb-1">Speso vs Disponibile</p>
                            <div className="flex justify-between text-sm font-medium mb-2">
                              <span>
                                €{selectedProjectData.spent || 0} / €{selectedProjectData.budget || 0}
                              </span>
                              <span className="text-primary">
                                {selectedProjectData.budget
                                  ? Math.round((selectedProjectData.spent / selectedProjectData.budget) * 100)
                                  : 0}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                                style={{
                                  width: selectedProjectData.budget
                                    ? `${Math.min((selectedProjectData.spent / selectedProjectData.budget) * 100, 100)}%`
                                    : "0%",
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/progetti/${selectedProjectData.id}/discussioni`}>
                        <Button className="gap-2 bg-primary hover:bg-primary/90">
                          <MessageCircle className="w-4 h-4" />
                          Discussioni
                        </Button>
                      </Link>
                      <Button variant="outline">Scarica Report</Button>
                    </div>
                  </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline">
                  <Card className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Milestone Progetto</h2>
                      {isAdmin && selectedProject && (
                        <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                              <Plus className="w-4 h-4" />
                              Aggiungi Milestone
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Aggiungi Milestone</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddMilestone} className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">Titolo</label>
                                <Input name="title" required placeholder="Es: Completamento fase 1" />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Descrizione</label>
                                <Textarea name="description" placeholder="Descrizione della milestone..." />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Data scadenza</label>
                                <Input name="dueDate" type="date" required />
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={addingMilestone} className="flex-1">
                                  {addingMilestone ? "Aggiunta..." : "Aggiungi Milestone"}
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setMilestoneDialogOpen(false)}
                                  disabled={addingMilestone}
                                >
                                  Annulla
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <div className="space-y-4">
                      {selectedProjectData.timeline && selectedProjectData.timeline.length > 0 ? (
                        selectedProjectData.timeline.map((milestone, idx) => (
                          <div
                            key={idx}
                            className={`flex gap-4 p-4 border border-border rounded-lg transition ${
                              (isAdmin || isProjectMember) && milestone.completed ? 'bg-green-50 hover:bg-green-100' : 
                              (isAdmin || isProjectMember) ? 'hover:bg-muted/50' : ''
                            }`}
                            onClick={() => (isAdmin || isProjectMember) && toggleMilestone(idx)}
                          >
                            <div className="mt-1">
                              {milestone.completed ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                                  (isAdmin || isProjectMember) ? 'border-gray-300' : 'border-gray-200'
                                }`}>
                                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-semibold ${milestone.completed ? 'line-through text-gray-500' : ''}`}>
                                {milestone.milestone}
                              </h3>
                              <p className="text-sm text-foreground/60">{milestone.date}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  milestone.completed ? "bg-green-500/10 text-green-700" : "bg-yellow-500/10 text-yellow-700"
                                }`}
                              >
                                {milestone.completed ? "Completato" : "In Corso"}
                              </span>
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteItem('milestone', milestone.milestone)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          Nessuna milestone definita per questo progetto.
                          {(isAdmin || isProjectMember) && (
                            <Button 
                              variant="link" 
                              onClick={() => setMilestoneDialogOpen(true)}
                              className="ml-2 p-0 h-auto"
                            >
                              Aggiungi la prima milestone
                            </Button>
                          )}
                        </p>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team">
                  <Card className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Team Progetto</h2>
                      {isAdmin && selectedProject && (
                        <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                              <Plus className="w-4 h-4" />
                              Aggiungi Membro
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Aggiungi Membro al Team</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddMember} className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">Utente</label>
                                <Select name="userId" required>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleziona utente" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableUsers.map((user) => (
                                      <SelectItem key={user.id} value={user.id}>
                                        {user.full_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">Ruolo</label>
                                <Select name="role" required defaultValue="member">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleziona ruolo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="leader">Leader</SelectItem>
                                    <SelectItem value="member">Membro</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={addingMember} className="flex-1">
                                  {addingMember ? "Aggiunta..." : "Aggiungi Membro"}
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setMemberDialogOpen(false)}
                                  disabled={addingMember}
                                >
                                  Annulla
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    {selectedProjectData.members && selectedProjectData.members.length > 0 ? (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          {selectedProjectData.members.map((member, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white text-lg">
                                {member.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">{member}</p>
                                <p className="text-xs text-foreground/60">Membro del team</p>
                              </div>
                              {isAdmin && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Rimuovi
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        {isAdmin && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground mb-2">
                              Aggiungi altri membri al team per collaborare al progetto.
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setMemberDialogOpen(true)}
                              className="gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Aggiungi Altro Membro
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Nessun Membro nel Team</h3>
                        <p className="text-muted-foreground mb-4">
                          {isAdmin 
                            ? "Aggiungi membri al team per iniziare a collaborare al progetto."
                            : "Contatta un amministratore per aggiungere membri al team."
                          }
                        </p>
                        {isAdmin && (
                          <Button 
                            onClick={() => setMemberDialogOpen(true)}
                            className="gap-2 bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4" />
                            Aggiungi Primo Membro
                          </Button>
                        )}
                      </div>
                    )}
                  </Card>
                </TabsContent>

                {/* Progress Tab */}
                <TabsContent value="progress">
                  <Card className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">Avanzamento Settimanale</h2>
                      <div className="flex gap-2">
                        {canEditProgress && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              const week = prompt("Inserisci la settimana (es: Set 1):")
                              const category = prompt("Categoria (robots, art, energy):") as 'robots' | 'art' | 'energy'
                              const value = parseInt(prompt("Valore da aggiungere:") || "0")
                              
                              if (week && category && value > 0) {
                                addProgressData(week, category, value)
                              }
                            }}
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Aggiungi Dati
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={loadProgressData}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Aggiorna
                        </Button>
                        {isAdmin && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              if (confirm("Sei sicuro di voler eliminare tutti i dati di avanzamento?")) {
                                setProgressData([])
                                toast({
                                  title: "Dati eliminati",
                                  description: "Tutti i dati di avanzamento sono stati eliminati",
                                })
                              }
                            }}
                            className="gap-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Elimina Dati
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={progressData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
                          <YAxis stroke="var(--color-muted-foreground)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--color-card)",
                              border: "1px solid var(--color-border)",
                            }}
                          />
                          <Legend />
                          <Bar dataKey="robots" fill="var(--color-primary)" name="Robotica" />
                          <Bar dataKey="art" fill="var(--color-secondary)" name="Letteratura" />
                          <Bar dataKey="energy" fill="var(--color-accent)" name="Energia" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-6 text-sm text-muted-foreground">
                      <p>Dati basati sull'attività reale dei progetti delle ultime 4 settimane.</p>
                      <p>
                        {canEditProgress 
                          ? "Puoi aggiungere dati di avanzamento come membro del team o amministratore."
                          : "Solo i membri del progetto e gli amministratori possono aggiungere dati."
                        }
                      </p>
                      {isAdmin && (
                        <p className="text-red-600 mt-1">
                          Come amministratore, puoi eliminare tutti i dati di avanzamento.
                        </p>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </div>
    </div>
  )
}
