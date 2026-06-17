import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        candidates (
          name,
          title,
          visa_status,
          location
        ),
        jobs (
          title,
          company,
          location,
          recruiter_name,
          recruiter_email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabase
      .from('submissions')
      .insert([{
        candidate_id: body.candidate_id,
        job_id: body.job_id,
        tailored_resume: body.tailored_resume,
        pitch_line: body.pitch_line,
        submitted_via: body.submitted_via || 'email',
        submitted_at: new Date().toISOString(),
        status: 'submitted',
        follow_up_count: 0,
        notes: body.notes || null
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
