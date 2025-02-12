import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const { phoneNumber, licenseNumber } = await request.json()

    // Log the incoming request data
    console.log("Login attempt with:", { 
      phoneNumber, 
      licenseNumber,
      licenseNumberTrimmed: licenseNumber.trim()
    })

    // First check if business exists with the license number
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, name, phone, license_number")
      .eq("license_number", licenseNumber.trim())

    // Log the query results
    console.log("Database query result:", { 
      business, 
      error: businessError,
      found: business && business.length > 0 
    })

    if (businessError || !business || business.length === 0) {
      // Let's check what licenses exist in the database
      const { data: allBusinesses } = await supabase
        .from("businesses")
        .select("license_number")
      
      console.log("Available license numbers:", allBusinesses?.map(b => b.license_number))
      
      return NextResponse.json({ 
        success: false, 
        message: "Business not found with the provided license number" 
      }, { status: 400 })
    }

    // Format the provided phone number to match database format (919930916956)
    const formattedPhoneNumber = phoneNumber
      .replace(/\s+/g, '')  // Remove spaces
      .replace(/^\+/, '')   // Remove leading +
      .replace(/^91/, '91') // Ensure 91 prefix

    // Then verify if the phone number matches
    if (business[0].phone !== formattedPhoneNumber) {
      return NextResponse.json({ 
        success: false, 
        message: "Phone number does not match our records" 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      businessId: business[0].id,
      name: business[0].name,
      token: "dummy_token" // Replace with real JWT token in production
    })

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Login failed" 
    }, { status: 400 })
  }
}

