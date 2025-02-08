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
    const businessName = formData.get("businessName") as string
    const address = formData.get("address") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const fssaiLicense = formData.get("fssaiLicense") as string
    const ownerName = formData.get("ownerName") as string
    const tradeLicense = formData.get("tradeLicense") as string
    const gstNumber = formData.get("gstNumber") as string
    const fireSafetyCert = formData.get("fireSafetyCert") as string
    const liquorLicense = formData.get("liquorLicense") as string
    const musicLicense = formData.get("musicLicense") as string

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
          name: businessName,
          address,
          phone,
          email,
          license_number: fssaiLicense,
          owner_name: ownerName,
          trade_license: tradeLicense,
          gst_number: gstNumber,
          fire_safety_cert: fireSafetyCert,
          liquor_license: liquorLicense,
          music_license: musicLicense,
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
  const { data, error } = await supabase.storage.from("business-files").upload(`${Date.now()}-${file.name}`, file)

  if (error) throw error

  const { data: publicUrl } = supabase.storage.from("business-files").getPublicUrl(data.path)
  return publicUrl.publicUrl
}

