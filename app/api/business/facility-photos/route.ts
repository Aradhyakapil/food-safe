import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.business_id || !data.photo_url || !data.location) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 })
    }

    const { data: newPhoto, error: insertError } = await supabase
      .from("facility_photos")
      .insert([data])
      .select()

    if (insertError) throw insertError

    const { data: photos, error: fetchError } = await supabase
      .from("facility_photos")
      .select("*")
      .eq("business_id", data.business_id)
      .order("created_at", { ascending: false })

    if (fetchError) throw fetchError

    return NextResponse.json({ 
      success: true, 
      data: photos 
    })

  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add photo" 
    }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { businessId: string } }
) {
  try {
    const businessId = parseInt(params.businessId)
    
    const { data, error } = await supabase
      .from("facility_photos")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      data: data 
    })

  } catch (error) {
    console.error("Error fetching facility photos:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch facility photos" 
    }, { status: 500 })
  }
} 