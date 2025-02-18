import { supabase } from "./supabase"

export async function uploadFile(
  file: File,
  businessId: number,
  folderName: string
): Promise<string | null> {
  try {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 10)
    const fileExt = file.name.split('.').pop()
    const filePath = `${folderName}/${businessId}/${timestamp}-${randomId}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('food-safety-files')
      .upload(filePath, file)

    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('food-safety-files')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    return null
  }
} 