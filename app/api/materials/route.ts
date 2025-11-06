import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { 
  getMaterials, 
  getMaterialById, 
  createMaterial, 
  updateMaterial, 
  deleteMaterial,
  getUserMaterials,
  searchMaterials
} from '@/lib/actions/materials'

const createMaterialSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  description: z.string().optional(),
  subject_id: z.string().uuid("ID materia non valido"),
  file_url: z.string().url("URL file non valido"),
  file_type: z.string().min(1, "Tipo file obbligatorio"),
  file_size: z.number().positive("Dimensione file non valida"),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
})

const updateMaterialSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio").optional(),
  description: z.string().optional(),
  subject_id: z.string().uuid("ID materia non valido").optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
  status: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const subjectId = searchParams.get('subjectId')
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'active'

    if (id) {
      // Get specific material
      const material = await getMaterialById(id)
      if (!material) {
        return NextResponse.json({ error: 'Materiale non trovato' }, { status: 404 })
      }
      return NextResponse.json(material)
    }

    if (userId) {
      // Get materials for specific user
      const materials = await getUserMaterials(userId)
      return NextResponse.json(materials)
    }

    if (search) {
      // Search materials
      const materials = await searchMaterials(search, subjectId || undefined)
      return NextResponse.json(materials)
    }

    // Get all materials (optionally filtered by subject)
    const materials = await getMaterials(subjectId || undefined, status)
    return NextResponse.json(materials)
  } catch (error) {
    console.error('Error in GET /api/materials:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createMaterialSchema.parse(body)

    const material = await createMaterial({
      title: validatedData.title,
      description: validatedData.description || '',
      file_url: validatedData.file_url,
      file_type: validatedData.file_type,
      file_size: validatedData.file_size || 0,
      subject_id: validatedData.subject_id,
      tags: validatedData.tags || [],
      is_public: validatedData.is_public !== undefined ? validatedData.is_public : true,
    })

    return NextResponse.json(material, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/materials:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Non autenticato') {
        return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 })
      }
      if (error.name === "ZodError") {
        return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// PUT /api/materials - Update a material
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID materiale richiesto' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateMaterialSchema.parse(body)

    const material = await updateMaterial(id, validatedData)
    return NextResponse.json(material)
  } catch (error) {
    console.error('Error in PUT /api/materials:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Non autenticato') {
        return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 })
      }
      if (error.message.includes('Non autorizzato')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.name === "ZodError") {
        return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// DELETE /api/materials - Delete a material
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID materiale richiesto' },
        { status: 400 }
      )
    }

    await deleteMaterial(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/materials:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Non autenticato') {
        return NextResponse.json({ error: 'Utente non autenticato' }, { status: 401 })
      }
      if (error.message.includes('Non autorizzato')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message === 'Materiale non trovato') {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
