"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateUserProfile } from "@/lib/actions/user"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface EditProfileFormProps {
  user: any
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    city: user?.city || "",
    phone: user?.phone || "",
    birth_date: user?.birth_date || "",
    bio: user?.bio || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      if (!formData.first_name || !formData.last_name) {
        setError("Nome e cognome sono obbligatori")
        setIsLoading(false)
        return
      }

      await updateUserProfile(formData)
      setSuccess(true)
      setTimeout(() => {
        router.push("/profilo")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio del profilo")
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-8">
      <div className="mb-6">
        <Link href="/profilo">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Torna al Profilo
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Modifica Profilo</h1>
        <p className="text-foreground/60 mt-2">Aggiorna le tue informazioni personali</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Mario"
              required
            />
          </div>

          <div>
            <Label htmlFor="last_name">
              Cognome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Rossi"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Città</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Roma"
            />
          </div>

          <div>
            <Label htmlFor="birth_date">Data di Nascita</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Telefono</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+39 123 456 7890"
          />
        </div>

        <div>
          <Label htmlFor="bio">Biografia</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Raccontaci qualcosa di te..."
            rows={4}
          />
        </div>

        <div>
          <Label className="text-sm text-foreground/60">Email (non modificabile)</Label>
          <Input value={user.email} disabled className="bg-muted" />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{error}</div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
            Profilo aggiornato con successo! Reindirizzamento...
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" disabled={isLoading}>
            <Save className="w-4 h-4" />
            {isLoading ? "Salvataggio..." : "Salva Modifiche"}
          </Button>
          <Link href="/profilo">
            <Button type="button" variant="outline" disabled={isLoading}>
              Annulla
            </Button>
          </Link>
        </div>
      </form>
    </Card>
  )
}
