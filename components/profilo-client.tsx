"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, MapPin, Edit2, Settings, LogOut, Phone, Calendar, Camera, Upload, Trash2 } from "lucide-react"
import { UserActivity } from "@/components/user-activity"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ProfiloClientProps {
  user: any
  stats: any
  badges: any[]
}

export function ProfiloClient({ user, stats, badges }: ProfiloClientProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState(user.avatar_url)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Errore",
        description: "Per favore seleziona un'immagine valida",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Errore",
        description: "L'immagine non può superare i 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)
    try {
      // Get current user
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
      if (userError || !authUser) {
        console.error("Auth error:", userError)
        throw new Error("Utente non autenticato")
      }

      console.log("User authenticated:", authUser.id)

      // Upload image to Supabase Storage with simpler path
      const fileExt = file.name.split('.').pop()
      const fileName = `${authUser.id}.${fileExt}`
      const filePath = fileName // Direct path without folder

      console.log("Uploading file:", filePath)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        })

      if (uploadError) {
        console.error("Upload error details:", uploadError)
        throw uploadError
      }

      console.log("Upload successful:", uploadData)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      console.log("Public URL:", publicUrl)

      // Update user profile with new avatar URL
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', authUser.id)
        .select()

      if (updateError) {
        console.error("Profile update error:", updateError)
        throw updateError
      }

      console.log("Profile updated:", updateData)

      setImageUrl(publicUrl)
      toast({
        title: "Immagine aggiornata!",
        description: "La tua immagine del profilo è stata aggiornata con successo",
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile aggiornare l'immagine del profilo",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async () => {
    if (!confirm("Sei sicuro di voler rimuovere la tua immagine del profilo?")) return

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error("Utente non autenticato")

      // Remove avatar URL from user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', authUser.id)

      if (updateError) throw updateError

      setImageUrl(null)
      toast({
        title: "Immagine rimossa",
        description: "La tua immagine del profilo è stata rimossa",
      })
    } catch (error) {
      console.error('Error removing image:', error)
      toast({
        title: "Errore",
        description: "Impossibile rimuovere l'immagine del profilo",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    if (confirm("Sei sicuro di voler effettuare il logout?")) {
      setIsLoggingOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
      router.refresh()
    }
  }

  const getBadgeRarity = (badge: any) => {
    if (!badge.badge) return "common"
    const value = badge.badge.requirement_value
    if (value >= 100) return "legendary"
    if (value >= 50) return "epic"
    if (value >= 10) return "rare"
    return "common"
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
      case "epic":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-400"
      case "rare":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non specificato"
    return new Date(dateString).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex gap-6 items-start flex-1">
              <div className="relative group">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.full_name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                {imageUrl && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Rimuovi immagine"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex gap-3 items-center mb-2">
                  <h1 className="text-3xl font-bold">{user.full_name || "Utente"}</h1>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium capitalize">
                    {user.role || "student"}
                  </span>
                </div>
                {user.bio && <p className="text-foreground/70 mb-3">{user.bio}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                  {user.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  )}
                  {user.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.city}
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </div>
                  )}
                  {user.birth_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(user.birth_date)}
                    </div>
                  )}
                </div>
                {user.created_at && (
                  <p className="text-xs text-foreground/50 mt-2">Membro da {formatJoinDate(user.created_at)}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3 flex-col sm:flex-row">
              <Link href="/utente/edit">
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Edit2 className="w-4 h-4" />
                  Modifica Profilo
                </Button>
              </Link>
              <Link href="/profilo/impostazioni">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Settings className="w-4 h-4" />
                  Impostazioni
                </Button>
              </Link>
              <Button
                variant="outline"
                className="gap-2 text-destructive hover:bg-destructive/10 bg-transparent"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Uscita..." : "Logout"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 text-center group hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-2xl font-bold text-primary mb-1">{stats.materials || 0}</div>
            <p className="text-sm text-foreground/60">Appunti Caricati</p>
            <p className="text-xs text-foreground/40 mt-1">Materiali condivisi</p>
          </Card>
          <Card className="p-6 text-center group hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-2xl font-bold text-secondary mb-1">{stats.discussions || 0}</div>
            <p className="text-sm text-foreground/60">Discussioni</p>
            <p className="text-xs text-foreground/40 mt-1">Argomenti creati</p>
          </Card>
          <Card className="p-6 text-center group hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">✍️</div>
            <div className="text-2xl font-bold text-primary mb-1">{stats.comments || 0}</div>
            <p className="text-sm text-foreground/60">Commenti</p>
            <p className="text-xs text-foreground/40 mt-1">Risposte inviate</p>
          </Card>
          <Card className="p-6 text-center group hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🎓</div>
            <div className="text-2xl font-bold text-secondary mb-1">{stats.quizzes || 0}</div>
            <p className="text-sm text-foreground/60">Quiz Completati</p>
            <p className="text-xs text-foreground/40 mt-1">Test superati</p>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6 text-center group hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-2xl font-bold text-orange-600 mb-1">{stats.projects || 0}</div>
            <p className="text-sm text-foreground/60">Progetti</p>
            <p className="text-xs text-foreground/40 mt-1">Progetti creati</p>
          </Card>
          <Card className="p-6 text-center group hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">💪</div>
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.exercises || 0}</div>
            <p className="text-sm text-foreground/60">Esercizi</p>
            <p className="text-xs text-foreground/40 mt-1">Esercizi creati</p>
          </Card>
        </div>

        {/* Stats Summary */}
        <div className="flex justify-center mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.refresh()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Aggiorna Statistiche
          </Button>
        </div>

        {/* XP and Level Card */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Livello {stats.level || 1}</h3>
              <p className="text-sm text-foreground/60">{stats.xp || 0} XP totali</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all"
              style={{
                width: `${Math.min(((stats.xp || 0) % 500) / 5, 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-foreground/50 mt-2">{500 - ((stats.xp || 0) % 500)} XP al prossimo livello</p>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full md:w-auto md:grid-cols-3 mb-6">
            <TabsTrigger value="badges">Badge ({badges.length})</TabsTrigger>
            <TabsTrigger value="activity">Attività</TabsTrigger>
            <TabsTrigger value="stats">Statistiche</TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">I tuoi Badge</h2>
              {badges.length > 0 ? (
                <div className="grid md:grid-cols-4 gap-4">
                  {badges.map((userBadge: any) => {
                    const badge = userBadge.badge
                    const rarity = getBadgeRarity(userBadge)
                    return (
                      <Card
                        key={userBadge.id}
                        className="p-6 text-center border-2 border-primary/20 hover:border-primary/50 transition"
                      >
                        <div className="text-4xl mb-3">{badge.icon_url || "🏆"}</div>
                        <h3 className="font-semibold mb-2">{badge.name}</h3>
                        <p className="text-xs text-foreground/60 mb-2">{badge.description}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(rarity)}`}>{rarity}</span>
                        {userBadge.earned_at && (
                          <p className="text-xs text-foreground/50 mt-2">
                            Ottenuto il {formatDate(userBadge.earned_at)}
                          </p>
                        )}
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-foreground/60 mb-4">Nessun badge ancora</p>
                  <p className="text-sm text-foreground/50">Continua a contribuire per sbloccare i tuoi primi badge!</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <UserActivity userId={user.id} />
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Statistiche Dettagliate</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Contributi Totali</span>
                    <span className="text-primary font-bold">{stats.totalContributions || 0}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.min((stats.totalContributions || 0) * 2, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Giorni Attivi Consecutivi</span>
                    <span className="text-secondary font-bold">{stats.streak || 0} giorni</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-secondary h-2 rounded-full"
                      style={{ width: `${Math.min((stats.streak || 0) * 10, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">Giorni Attivi Totali</span>
                    <span className="text-primary font-bold">{stats.totalActiveDays || 0} giorni</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.min((stats.totalActiveDays || 0) * 3, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
