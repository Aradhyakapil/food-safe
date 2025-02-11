import { NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    console.log("Received form data:", Object.fromEntries(formData))

    // Extract all required fields
    const business_name = formData.get("business_name") as string
    const address = formData.get("address") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const license_number = formData.get("license_number") as string
    const business_type = formData.get("business_type") as string
    const owner_name = formData.get("owner_name") as string
    const trade_license = formData.get("trade_license") as string
    const gst_number = formData.get("gst_number") as string
    const fire_safety_cert = formData.get("fire_safety_cert") as string
    const liquor_license = formData.get("liquor_license") as string
    const music_license = formData.get("music_license") as string

    // Validate required fields
    if (!business_name || !address || !phone || !email || !license_number || 
        !business_type || !owner_name || !trade_license || !gst_number || 
        !fire_safety_cert) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 422 }
      )
    }

    // Handle file uploads
    const businessLogo = formData.get("business_logo") as File
    const ownerPhoto = formData.get("owner_photo") as File

    if (!businessLogo || !ownerPhoto) {
      return NextResponse.json(
        { success: false, error: "Business logo and owner photo are required" },
        { status: 422 }
      )
    }

    // Upload files and get URLs
    const businessLogoUrl = await uploadFile(businessLogo)
    const ownerPhotoUrl = await uploadFile(ownerPhoto)

    if (!businessLogoUrl || !ownerPhotoUrl) {
      return NextResponse.json(
        { success: false, error: "Failed to upload images" },
        { status: 500 }
      )
    }

    // Format phone number without converting to BigInt
    const phoneNumber = phone.replace(/\D/g, '')

    // Create business entry
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert([
        {
          name: business_name,
          address,
          phone: phoneNumber, // Store as string instead of BigInt
          email,
          license_number,
          business_type,
          owner_name,
          trade_license,
          gst_number,
          fire_safety_cert,
          liquor_license,
          music_license,
          logo_url: businessLogoUrl,
          owner_photo_url: ownerPhotoUrl,
        },
      ])
      .select()

    if (businessError) {
      console.error("Supabase error:", businessError)
      return NextResponse.json(
        { success: false, error: "Failed to create business entry" },
        { status: 500 }
      )
    }

    if (!business || business.length === 0) {
      return NextResponse.json(
        { success: false, error: "No business data returned after insert" },
        { status: 500 }
      )
    }

    const businessId = business[0].id

    // Handle team members
    const teamMemberNames = formData.get("team_member_names")?.toString() || ""
    const teamMemberRoles = formData.get("team_member_roles")?.toString() || ""
    const teamMemberPhotos = formData.getAll("team_member_photos") as File[]

    if (teamMemberNames && teamMemberRoles && teamMemberPhotos.length > 0) {
      const names = teamMemberNames.split(",")
      const roles = teamMemberRoles.split(",")

      for (let i = 0; i < names.length; i++) {
        const photoUrl = await uploadFile(teamMemberPhotos[i])
        const { error: teamError } = await supabase.from("team_members").insert([
          {
            business_id: businessId,
            name: names[i].trim(),
            role: roles[i].trim(),
            photo_url: photoUrl,
          },
        ])

        if (teamError) {
          console.error("Team member insert error:", teamError)
        }
      }
    }

    // Handle facility photos
    const facilityAreaNames = formData.get("facility_photo_area_names")?.toString() || ""
    const facilityPhotos = formData.getAll("facility_photos") as File[]

    if (facilityAreaNames && facilityPhotos.length > 0) {
      const areaNames = facilityAreaNames.split(",")

      for (let i = 0; i < areaNames.length; i++) {
        const photoUrl = await uploadFile(facilityPhotos[i])
        const { error: facilityError } = await supabase.from("facility_photos").insert([
          {
            business_id: businessId,
            area_name: areaNames[i].trim(),
            photo_url: photoUrl,
          },
        ])

        if (facilityError) {
          console.error("Facility photo insert error:", facilityError)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      businessId: business[0].id,
      message: "Business onboarded successfully" 
    })

  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Onboarding failed" 
      },
      { status: 500 }
    )
  }
}

async function uploadFile(file: File): Promise<string> {
  const { data, error } = await supabase.storage.from("food-safety-files").upload(`${Date.now()}-${file.name}`, file)

  if (error) throw error

  const { data: publicUrl } = supabase.storage.from("food-safety-files").getPublicUrl(data.path)
  return publicUrl.publicUrl
}

