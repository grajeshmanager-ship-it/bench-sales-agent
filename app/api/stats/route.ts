import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data: submissions } = await supabase.from('submissions').select('status')
    return NextResponse.json({
      applications: submissions?.length || 0,
      reviewed: submissions?.filter(s => s.status === 'reviewed').length || 0,
      interviews: submissions?.filter(s => s.status === 'interview').length || 0,
      offers: submissions?.filter(s => s.status === 'offer').length || 0,
    })
  } catch (e) {
    return NextResponse.json({ applications: 0, reviewed: 0, interviews: 0, offers: 0 })
  }
}
