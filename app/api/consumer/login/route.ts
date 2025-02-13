import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json()

    console.log("Login attempt for user:", name)

    // Query the users table with specific columns
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id,
        name,
        password,
        phone_number,
        created_at,
        updated_at
      `)
      .eq("name", name)
      .maybeSingle()

    console.log("Database query result:", { user, error })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ 
        success: false, 
        error: "Database error: " + error.message 
      }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 401 })
    }

    // Compare passwords
    if (user.password !== password) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid password" 
      }, { status: 401 })
    }

    // Generate token
    const token = Buffer.from(`${user.id}-${Date.now()}`).toString('base64')

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone_number: user.phone_number
      }
    })

  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Server error: " + (error instanceof Error ? error.message : String(error))
    }, { status: 500 })
  }
}

