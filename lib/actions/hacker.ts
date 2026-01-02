"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { env } from "@/lib/env"

export type UserRole = "student" | "admin" | "hacker"

export interface HackerUserSummary {
  id: string
  email: string
  full_name: string
  role: UserRole
  xp_points: number
  level: number
  created_at: string
}

export async function isRoleManagementAvailable() {
  return !!env.SUPABASE_SERVICE_ROLE_KEY
}

async function requireHackerUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Non autenticato")
  }

  // Trova il badge "Hacker della Classe"
  const { data: hackerBadge, error: hackerBadgeError } = await supabase
    .from("badges")
    .select("id")
    .eq("name", "Hacker della Classe")
    .single()

  if (hackerBadgeError || !hackerBadge) {
    throw new Error("Badge 'Hacker della Classe' non configurato")
  }

  // Verifica che l'utente corrente possieda il badge hacker
  const { data: hackerUserBadges } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", user.id)
    .eq("badge_id", hackerBadge.id)

  if (!hackerUserBadges || hackerUserBadges.length === 0) {
    throw new Error("Non autorizzato: questa sezione è riservata agli hacker della classe")
  }

  return { supabase, user, hackerBadgeId: hackerBadge.id }
}

export async function getUsersForRoleManagement(): Promise<HackerUserSummary[]> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return []
  }

  await requireHackerUser()

  const admin = await createAdminClient()

  const { data, error } = await admin
    .from("users")
    .select("id, email, full_name, role, xp_points, level, created_at")
    .order("created_at", { ascending: true })

  if (error) {
    throw error
  }

  return (
    data?.map((u: any) => ({
      id: u.id as string,
      email: (u.email || "") as string,
      full_name: (u.full_name || "Senza nome") as string,
      role: (u.role || "student") as UserRole,
      xp_points: (u.xp_points ?? 0) as number,
      level: (u.level ?? 1) as number,
      created_at: u.created_at as string,
    })) ?? []
  )
}

export async function changeUserRole(formData: FormData) {
  const userId = formData.get("userId") as string | null
  const newRole = formData.get("newRole") as UserRole | null

  if (!userId || !newRole) {
    throw new Error("Dati ruolo mancanti")
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Gestione ruoli non disponibile (manca SUPABASE_SERVICE_ROLE_KEY)")
  }

  const { user: currentUser } = await requireHackerUser()

  // Per sicurezza, impedisci di cambiare il proprio ruolo a qualcosa di non-hacker
  if (currentUser.id === userId && newRole !== "hacker") {
    throw new Error("Non puoi rimuovere il tuo stesso ruolo hacker dalla dashboard")
  }

  const admin = await createAdminClient()

  // Aggiorna ruolo utente
  const { error: updateError } = await admin.from("users").update({ role: newRole }).eq("id", userId)

  if (updateError) {
    throw updateError
  }

  const { data: adminBadge } = await admin
    .from("badges")
    .select("id")
    .eq("name", "Admin della Classe")
    .single()

  const { data: hackerBadge } = await admin
    .from("badges")
    .select("id")
    .eq("name", "Hacker della Classe")
    .single()

  // Utility locali per aggiungere/rimuovere badge se esistono
  if (hackerBadge) {
    if (newRole === "hacker") {
      await admin
        .from("user_badges")
        .upsert({ user_id: userId, badge_id: hackerBadge.id }, { onConflict: "user_id,badge_id" })
    } else {
      await admin.from("user_badges").delete().eq("user_id", userId).eq("badge_id", hackerBadge.id)
    }
  }

  if (adminBadge) {
    if (newRole === "admin") {
      await admin
        .from("user_badges")
        .upsert({ user_id: userId, badge_id: adminBadge.id }, { onConflict: "user_id,badge_id" })
    } else {
      await admin.from("user_badges").delete().eq("user_id", userId).eq("badge_id", adminBadge.id)
    }
  }

  await revalidatePath("/hacker")
}
