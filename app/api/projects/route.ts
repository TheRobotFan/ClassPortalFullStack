import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  subject_id: z.string().uuid().optional(),
  status: z.enum(["planning", "in_progress", "completed"]).default("planning"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.number().positive().optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status")
  const subject = searchParams.get("subject")
  const search = searchParams.get("search")

  try {
    let query = supabase
      .from("projects")
      .select(`
        *,
        subject:subjects(name, color),
        created_by_user:users(full_name, avatar_url),
        project_members(
          user_id,
          role,
          user:users(full_name, avatar_url)
        )
      `)

    if (status) query = query.eq("status", status)
    if (subject) query = query.eq("subject_id", subject)
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Projects GET error:", error)
      return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Projects GET unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...validatedData,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Projects POST error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add creator as team leader
    const { error: memberError } = await supabase.from("project_members").insert({
      project_id: data.id,
      user_id: session.user.id,
      role: "leader",
    })

    if (memberError) {
      console.error("Failed to add creator as team leader:", memberError)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("Projects POST unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
