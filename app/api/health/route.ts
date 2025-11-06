import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    // Lightweight query to ensure DB connectivity; uses head request with count
    const { error } = await supabase.from("users").select("id", { count: "exact", head: true })

    if (error) {
      return NextResponse.json({ status: "degraded", error: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: "ok" })
  } catch (e: any) {
    return NextResponse.json({ status: "error", error: e?.message ?? "unknown" }, { status: 500 })
  }
}
