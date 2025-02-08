import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const { phoneNumber, licenseNumber } = await request.json()

    // Check if business exists with given phone number and license number
    const { data, error } = await supabase
      .from("businesses")
      .select()
      .eq("phone", phoneNumber)
      .eq("license_number", licenseNumber)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
    }

    // In a real application, you would generate a proper JWT token here
    const token = "dummy_token"

    return NextResponse.json({ success: true, token, business: data })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}

