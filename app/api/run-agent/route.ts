import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { data: jobs } = await supabase.from('jobs').select('*').eq('status', 'new').limit(10)
    
    return NextResponse.json({
      applied: jobs?.length || 0,
      called: Math.floor((jobs?.length || 0) * 0.8),
      emailed: jobs?.length || 0,
      message: 'Agent run simulated - ready for full implementation'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message, applied: 0, called: 0 }, { status: 500 })
  }
}
