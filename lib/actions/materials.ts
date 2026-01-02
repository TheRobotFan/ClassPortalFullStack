"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { awardXP } from "./gamification"

export type Material = {
  id: string
  title: string
  description: string | null
  subject_id: string
  file_url: string | null
  file_type: string | null
  file_size: number | null
  uploaded_by: string
  downloads_count: number
  views_count: number
  version: number
  tags: string[] | null
  is_public: boolean
  status: string
  created_at: string
  updated_at: string
  subjects: {
    id: string
    name: string
    color: string | null
  } | null
  users: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export async function getMaterials(subjectId?: string, status: string = 'active'): Promise<Material[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from("materials")
    .select(`
      *,
      subjects:subjects(id, name, color),
      users:users!materials_uploaded_by_fkey(id, full_name, avatar_url)
    `)
    .eq('status', status)
    .order("created_at", { ascending: false })

  // Utente autenticato: mostra sia i materiali pubblici che i suoi materiali privati
  if (user) {
    query = query.or(`is_public.eq.true,uploaded_by.eq.${user.id}`)
  } else {
    // Utente anonimo: solo materiali pubblici
    query = query.eq('is_public', true)
  }

  if (subjectId) {
    query = query.eq("subject_id", subjectId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching materials:", error)
    return []
  }

  return data || []
}

export async function getMaterialById(id: string): Promise<Material | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("materials")
    .select(`
      *,
      subjects:subjects(id, name, color),
      users:users!materials_uploaded_by_fkey(id, full_name, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching material:", error)
    return null
  }

  return data
}

export async function getUserMaterials(userId: string): Promise<Material[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("materials")
    .select(`
      *,
      subjects:subjects(id, name, color),
      users:users!materials_uploaded_by_fkey(id, full_name, avatar_url)
    `)
    .eq("uploaded_by", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user materials:", error)
    return []
  }

  return data || []
}

export async function createMaterial(formData: {
  title: string
  description: string
  file_url: string
  file_type: string
  file_size: number
  subject_id: string
  tags?: string[]
  is_public?: boolean
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  const { data, error } = await supabase
    .from("materials")
    .insert({
      ...formData,
      uploaded_by: user.id,
      version: 1,
      status: 'active',
      is_public: formData.is_public ?? true,
      tags: formData.tags || [],
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath("/appunti")
  return data
}

export async function updateMaterial(id: string, formData: {
  title?: string
  description?: string
  subject_id?: string
  tags?: string[]
  is_public?: boolean
  status?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  // Verifica che l'utente sia il proprietario del materiale
  const { data: existing } = await supabase
    .from("materials")
    .select("uploaded_by")
    .eq("id", id)
    .single()

  if (!existing || existing.uploaded_by !== user.id) {
    throw new Error("Non autorizzato a modificare questo materiale")
  }

  const { data, error } = await supabase
    .from("materials")
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  revalidatePath("/appunti")
  return data
}

export async function incrementMaterialDownloads(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc("increment_material_downloads", {
    material_id: id,
  })

  if (error) console.error("Error incrementing downloads:", error)
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Non autenticato")

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userData?.role !== "admin" && userData?.role !== "hacker") {
    throw new Error("Solo amministratori e hacker possono eliminare materiali")
  }

  // Delete material comments first (due to foreign key constraint)
  const { error: commentsError } = await supabase
    .from("material_comments")
    .delete()
    .eq("material_id", id)

  if (commentsError) {
    console.error("Error deleting material comments:", commentsError)
    throw new Error("Errore nell'eliminazione dei commenti del materiale")
  }

  // Delete the material
  const { error: materialError } = await supabase
    .from("materials")
    .delete()
    .eq("id", id)

  if (materialError) {
    console.error("Error deleting material:", materialError)
    throw new Error("Errore nell'eliminazione del materiale")
  }

  revalidatePath("/appunti")
  return { success: true }
}

export async function incrementMaterialViews(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.rpc("increment_material_views", {
    material_id: id,
  })

  if (error) console.error("Error incrementing views:", error)
}

export async function searchMaterials(query: string, subjectId?: string): Promise<Material[]> {
  const supabase = await createClient()

  let dbQuery = supabase
    .from("materials")
    .select(`
      *,
      subjects:subjects(id, name, color),
      users:users!materials_uploaded_by_fkey(id, full_name, avatar_url)
    `)
    // Temporaneamente rimossi filtri
    // .eq('"status"', 'active')
    // .eq('is_public', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false })

  if (subjectId) {
    dbQuery = dbQuery.eq("subject_id", subjectId)
  }

  const { data, error } = await dbQuery

  if (error) {
    console.error("Error searching materials:", error)
    return []
  }

  return data || []
}
