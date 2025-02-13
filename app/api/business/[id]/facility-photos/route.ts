import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id
    const { data, error } = await supabase
      .from('facility_photos')
      .select('*')
      .eq('business_id', businessId)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in facility photos API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch facility photos' },
      { status: 500 }
    )
  }
} 