import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Received data:", data) // Debug log

    const {
      businessId,
      manufacturingDetails,
      batchProduction,
      packagingCompliance
    } = data

    if (!businessId || !manufacturingDetails) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: businessId and manufacturingDetails" 
      }, { status: 400 })
    }

    // Insert manufacturing details
    const { data: mfgData, error: mfgError } = await supabase
      .from("manufacturing_details")
      .insert([{
        business_id: businessId,
        production_capacity: manufacturingDetails.production_capacity || null,
        manufacturing_license: manufacturingDetails.manufacturing_license || null,
        iso_certification: manufacturingDetails.iso_certification || null,
        haccp_certification: manufacturingDetails.haccp_certification || null,
        description: manufacturingDetails.description || null,
      }])
      .select()

    if (mfgError) {
      console.error("Manufacturing details error:", mfgError)
      throw mfgError
    }

    // Insert batch production details if provided
    if (batchProduction) {
      const { error: batchError } = await supabase
        .from("batch_production_details")
        .insert([{
          business_id: businessId,
          ...batchProduction,
        }])

      if (batchError) {
        console.error("Batch production error:", batchError)
        throw batchError
      }
    }

    // Insert packaging compliance if provided
    if (packagingCompliance) {
      const { error: packagingError } = await supabase
        .from("packaging_compliance")
        .insert([packagingCompliance])

      if (packagingError) {
        console.error("Packaging compliance error:", packagingError)
        throw packagingError
      }
    }

    return NextResponse.json({
      success: true,
      message: "Manufacturing details saved successfully",
      data: mfgData
    })

  } catch (error) {
    console.error("Manufacturing onboarding error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to save manufacturing details",
        details: error
      }, 
      { status: 500 }
    )
  }
} 