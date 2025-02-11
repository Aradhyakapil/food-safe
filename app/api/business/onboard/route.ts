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

    // Extract basic information
    const business_name = formData.get("business_name") as string
    const address = formData.get("address") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const license_number = formData.get("license_number") as string
    const owner_name = formData.get("owner_name") as string
    const trade_license = formData.get("trade_license") as string
    const gst_number = formData.get("gst_number") as string
    const fire_safety_cert = formData.get("fire_safety_cert") as string
    const liquor_license = formData.get("liquor_license") as string
    const music_license = formData.get("music_license") as string

    // Handle file uploads
    const businessLogo = formData.get("business_logo") as File
    const ownerPhoto = formData.get("owner_photo") as File

    // Upload files and get URLs
    const businessLogoUrl = businessLogo ? await uploadFile(businessLogo) : null
    const ownerPhotoUrl = ownerPhoto ? await uploadFile(ownerPhoto) : null

    // Create business entry
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert([
        {
          name: business_name,
          address,
          phone,
          email,
          license_number: license_number,
          owner_name: owner_name,
          trade_license: trade_license,
          gst_number: gst_number,
          fire_safety_cert: fire_safety_cert,
          liquor_license: liquor_license,
          music_license: music_license,
          logo_url: businessLogoUrl,
          owner_photo_url: ownerPhotoUrl,
        },
      ])
      .select()

    if (businessError) throw businessError

    const businessId = business[0].id

    // Handle team members
    const teamMemberNames = formData.getAll("team_member_names") as string[]
    const teamMemberRoles = formData.getAll("team_member_roles") as string[]
    const teamMemberPhotos = formData.getAll("team_member_photos") as File[]

    for (let i = 0; i < teamMemberNames.length; i++) {
      const photoUrl = await uploadFile(teamMemberPhotos[i])
      await supabase.from("team_members").insert([
        {
          business_id: businessId,
          name: teamMemberNames[i],
          role: teamMemberRoles[i],
          photo_url: photoUrl,
        },
      ])
    }

    // Handle facility photos
    const facilityPhotoAreaNames = formData.getAll("facility_photo_area_names") as string[]
    const facilityPhotos = formData.getAll("facility_photos") as File[]

    for (let i = 0; i < facilityPhotoAreaNames.length; i++) {
      const photoUrl = await uploadFile(facilityPhotos[i])
      await supabase.from("facility_photos").insert([
        {
          business_id: businessId,
          area_name: facilityPhotoAreaNames[i],
          photo_url: photoUrl,
        },
      ])
    }

    return NextResponse.json({ success: true, businessId })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Onboarding failed" },
      { status: 500 },
    )
  }
}

async function uploadFile(file: File): Promise<string> {
  const { data, error } = await supabase.storage.from("food-safety-files").upload(`${Date.now()}-${file.name}`, file)

  if (error) throw error

  const { data: publicUrl } = supabase.storage.from("food-safety-files").getPublicUrl(data.path)
  return publicUrl.publicUrl
}

