"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { completeUserProfile } from "@/lib/actions/user"
import { Sparkles } from "lucide-react"

interface OnboardingFormProps {
  user: any
  authUser: any
}

export function OnboardingForm({ user, authUser }: OnboardingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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

    try {
      if (!formData.first_name || !formData.last_name) {
        setError("Nome e cognome sono obbligatori")
        setIsLoading(false)
        return
      }

      await completeUserProfile(formData)
      router.push("/guida")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Errore durante il salvataggio del profilo")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Benvenuto nella Classe 1R!</h1>
        <p className="text-foreground/60">Completa il tuo profilo per iniziare</p>
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
          <Label htmlFor="bio">Biografia (opzionale)</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Raccontaci qualcosa di te..."
            rows={4}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{error}</div>
        )}

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg" disabled={isLoading}>
          {isLoading ? "Salvataggio..." : "Completa Profilo"}
        </Button>
      </form>
    </Card>
  )
}
