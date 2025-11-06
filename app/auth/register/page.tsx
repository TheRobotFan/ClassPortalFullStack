"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Lock, User, Eye, EyeOff, Calendar, MapPin, Phone } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Auth data
    email: "",
    password: "",
    confirm: "",
    // Step 2: Profile data
    first_name: "",
    last_name: "",
    date_of_birth: "",
    city: "",
    phone: "",
    bio: "",
    role: "student",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirm) {
      setError("Le password non coincidono")
      return
    }
    if (formData.password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri")
      return
    }
    setError(null)
    setStep(2)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.first_name || !formData.last_name) {
      setError("Nome e cognome sono obbligatori")
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            full_name: `${formData.first_name} ${formData.last_name}`,
            date_of_birth: formData.date_of_birth,
            city: formData.city,
            phone: formData.phone,
            bio: formData.bio,
            role: formData.role,
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            full_name: `${formData.first_name} ${formData.last_name}`,
            date_of_birth: formData.date_of_birth || null,
            city: formData.city || null,
            phone: formData.phone || null,
            bio: formData.bio || null,
            profile_completed: true,
            xp_points: 0,
            level: 1,
            consecutive_active_days: 0,
            total_active_days: 0,
          })
          .eq("id", data.user.id)

        if (updateError) {
          console.error("[v0] Error updating user profile:", updateError)
        }

        router.push(`/utente/${data.user.id}`)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Errore durante la registrazione")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
        <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-2xl mx-auto mb-4">
              📚
            </div>
            <h1 className="text-2xl font-bold mb-2">{step === 1 ? "Crea un Account" : "Completa il Profilo"}</h1>
            <p className="text-foreground/60">
              {step === 1 ? "Unisciti al portale della Classe 1R" : "Inserisci i tuoi dati personali"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="mario@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-foreground/40 hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Conferma Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirm"
                    value={formData.confirm}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-foreground/40 hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                Continua
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Mario"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cognome *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Rossi"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data di Nascita</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Città</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Roma"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-foreground/40" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ruolo</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="student">Studente</option>
                  <option value="teacher">Insegnante</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Biografia (opzionale)</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Raccontaci qualcosa di te..."
                  rows={3}
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" required className="rounded" />
                Accetto i termini e le condizioni
              </label>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  disabled={loading}
                >
                  Indietro
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90">
                  {loading ? "Registrazione..." : "Completa Registrazione"}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-foreground/60 mb-4">Hai già un account?</p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full bg-transparent">
                Accedi
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
