import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = params.id
    const { data, error } = await supabase
      .from('hygiene_ratings')
      .select('*')
      .eq('business_id', businessId)
      .order('inspection_date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in hygiene ratings API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hygiene ratings' },
      { status: 500 }
    )
  }
} 