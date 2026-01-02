"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, User, Plus, Search, Grid3x3, List, Edit, Trash2, Tag } from "lucide-react"
import { 
  getMaterials, 
  getMaterialById, 
  createMaterial, 
  updateMaterial, 
  deleteMaterial,
  getUserMaterials,
  searchMaterials,
  incrementMaterialViews,
  incrementMaterialDownloads,
  type Material as MaterialType
} from '@/lib/actions/materials'
import { awardXP } from "@/lib/actions/gamification"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { EditMaterialDialog } from "@/components/edit-material-dialog"

type Material = {
  id: string
  title: string
  description: string | null
  subject_id: string
  file_url: string
  file_type: string
  file_size: number
  views: number
  downloads: number
  created_at: string
  user_id: string
  subjects: { name: string } | null
  users: { full_name: string | null } | null
}

export function AppuntiClient() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedSubject, setSelectedSubject] = useState("Tutti")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([])
  const { toast } = useToast()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    loadMaterials()
    checkAdmin()
    loadSubjects()
    getCurrentUser()
  }, [])

  async function getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  async function loadMaterials() {
    setLoading(true)
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<Material[]>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout loading materials")), 10000)
      )
      
      const dataPromise = getMaterials()
      const data = await Promise.race([dataPromise, timeoutPromise])
      setMaterials(data as any)
    } catch (error) {
      console.error("Error loading materials:", error)
      toast({
        title: "Errore",
        description: "Impossibile caricare gli appunti",
        variant: "destructive",
      })
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }

  async function loadSubjects() {
    const { data, error } = await supabase.from("subjects").select("id, name").order("name")
    if (!error && data) {
      // Remove duplicates based on name
      const uniqueSubjects = data.filter((subject, index, self) => 
        index === self.findIndex((s) => s.name === subject.name)
      )
      setSubjects(uniqueSubjects)
    }
  }

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("users").select("role").eq("id", user.id).single()

      setIsAdmin(data?.role === "hacker" || data?.role === "teacher")
    }
  }

  async function handleDownload(material: Material) {
    await incrementMaterialDownloads(material.id)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await awardXP(user.id, 5, "download_material")
    }

    // Actually download the file
    const link = document.createElement("a")
    link.href = material.file_url
    link.download = material.title
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download avviato",
      description: "+5 XP guadagnati!",
    })
    loadMaterials()
  }

  async function handleView(materialId: string) {
    await incrementMaterialViews(materialId)
    loadMaterials()
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploading(true)

    try {
      // Add timeout for the entire upload process
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Upload timeout - riprova con un file più piccolo")), 30000)
      )

      const uploadProcess = async () => {
        const formData = new FormData(e.currentTarget)
        const file = formData.get("file") as File
        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const subjectId = formData.get("subject") as string

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("Non autenticato")

        // Upload file to Supabase Storage
        const fileExt = file.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage.from("materials").upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("materials").getPublicUrl(fileName)

        // Create material record
        const tagsInput = formData.get("tags") as string
        const tags = tagsInput ? tagsInput.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []
        const isPublic = formData.get("is_public") === "true"

        const { error: insertError } = await supabase.from("materials").insert({
          title,
          description,
          subject_id: subjectId,
          file_url: publicUrl || '',
          file_type: file.type.length > 100 ? file.type.substring(0, 100) : file.type,
          file_size: file.size,
          uploaded_by: user.id,
          downloads_count: 0,
          views_count: 0,
          tags: tags,
          is_public: isPublic,
          status: 'active',
          version: 1
        })

        if (insertError) throw insertError

        // Award XP for uploading
        await awardXP(user.id, 20, "upload_material")

        return { success: true }
      }

      await Promise.race([uploadProcess(), timeoutPromise])

      toast({
        title: "Caricamento completato!",
        description: "+20 XP guadagnati per aver condiviso materiale!",
      })

      setUploadOpen(false)
      loadMaterials()
    } catch (error) {
      console.error("Upload error:", error)
      console.error("Upload error details:", JSON.stringify(error, null, 2))
      
      let errorMessage = "Impossibile caricare il file"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        if ('message' in error) {
          errorMessage = (error as any).message
        } else if ('error' in error) {
          errorMessage = (error as any).error?.message || JSON.stringify((error as any).error)
        }
      }
      
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(materialId: string) {
    try {
      await deleteMaterial(materialId)
      toast({
        title: "Materiale eliminato",
        description: "Il materiale è stato eliminato con successo",
      })
      loadMaterials()
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile eliminare il materiale",
        variant: "destructive",
      })
    }
  }

  async function handleEdit(material: Material) {
    setEditingMaterial(material)
    setEditOpen(true)
  }

  async function handleUpdateMaterial(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingMaterial) return

    setUploading(true)
    try {
      const formData = new FormData(e.currentTarget)
      const updateData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        subject_id: formData.get("subject") as string,
        tags: (formData.get("tags") as string).split(',').map(tag => tag.trim()).filter(Boolean),
        is_public: formData.get("is_public") === "true",
      }

      await updateMaterial(editingMaterial.id, updateData)
      toast({
        title: "Materiale aggiornato",
        description: "Il materiale è stato aggiornato con successo",
      })
      setEditOpen(false)
      setEditingMaterial(null)
      loadMaterials()
    } catch (error) {
      console.error("Update error:", error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile aggiornare il materiale",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const subjectNames = ["Tutti", ...new Set(subjects.map((s) => s.name))]

  const filteredMaterials = materials.filter((material) => {
    const matchSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchSubject = selectedSubject === "Tutti" || material.subjects?.name === selectedSubject
    return matchSearch && matchSubject
  })

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-foreground/60 mb-4">Caricamento appunti...</p>
        <Button 
          variant="outline" 
          onClick={() => {
            setLoading(false)
            setTimeout(() => loadMaterials(), 100)
          }}
        >
          Riprova
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Appunti e Materiali</h1>
          <p className="text-foreground/60">Condividi e accedi a risorse didattiche della classe</p>
        </div>

        {isAdmin && (
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Carica Appunto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Carica Nuovo Materiale</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Titolo</label>
                  <Input name="title" required placeholder="Es: Riassunto Fotosintesi" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Descrizione</label>
                  <Textarea name="description" placeholder="Breve descrizione del materiale..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Materia</label>
                  <Select name="subject" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects
                        .filter((subject, index, self) => 
                          index === self.findIndex((s) => s.name === subject.name)
                        )
                        .map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tag (separati da virgola)</label>
                  <Input name="tags" placeholder="es: formule, esami, ripasso" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Visibilità</label>
                  <Select name="is_public" defaultValue="true">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Pubblico</SelectItem>
                      <SelectItem value="false">Privato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">File</label>
                  <Input name="file" type="file" required accept=".pdf,.doc,.docx,.ppt,.pptx" />
                </div>
                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? "Caricamento..." : "Carica"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Material Dialog */}
      <EditMaterialDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        material={editingMaterial as unknown as MaterialType}
        subjects={subjects}
        onSubmit={handleUpdateMaterial}
        uploading={uploading}
      />

      {/* Search and View Toggle */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/40" />
          <input
            type="text"
            placeholder="Cerca appunti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded transition ${
              viewMode === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted-foreground/20"
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded transition ${
              viewMode === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted-foreground/20"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20">
            <h3 className="font-bold mb-4">Filtri</h3>
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3 text-foreground/70">Materia</p>
              <div className="space-y-2">
                {subjectNames.map((subject, index) => (
                  <button
                    key={`${subject}-${index}`}
                    onClick={() => setSelectedSubject(subject)}
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      selectedSubject === subject
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-foreground/60 hover:bg-muted"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Materials Grid/List */}
        <div className="lg:col-span-3">
          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary"
                  onClick={() => handleView(material.id)}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-3xl">📄</div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{material.title}</h3>
                      <p className="text-xs text-foreground/60">
                        {material.file_type} • {formatFileSize(material.file_size)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-foreground/70 mb-4 line-clamp-2">{material.description}</p>

                  {(material as any).tags && (material as any).tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(material as any).tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-foreground/60 mb-4 py-3 border-t border-border">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {material.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" /> {material.downloads}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {material.users?.full_name || "Anonimo"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(material)
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Scarica
                    </Button>
                    
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(material)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Elimina Materiale</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sei sicuro di voler eliminare "{material.title}"? Questa azione non può essere annullata.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annulla</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(material.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Elimina
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMaterials.map((material) => (
                <Card
                  key={material.id}
                  className="p-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary"
                  onClick={() => handleView(material.id)}
                >
                  <div className="flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl">📄</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{material.title}</h3>
                        <p className="text-sm text-foreground/60">
                          {material.subjects?.name} • {material.file_type} • {formatFileSize(material.file_size)} • di{" "}
                          {material.users?.full_name || "Anonimo"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-foreground/60">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {material.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" /> {material.downloads}
                      </span>
                      <Button
                        className="gap-2 bg-primary hover:bg-primary/90"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(material)
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {filteredMaterials.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-foreground/30" />
              <p className="text-foreground/60">Nessun appunto trovato</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
