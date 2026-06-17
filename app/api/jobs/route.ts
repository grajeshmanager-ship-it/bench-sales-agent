import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
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
      .from('jobs')
      .insert([{
        title: body.title,
        company: body.company,
        location: body.location,
        remote: body.remote ?? true,
        description: body.description,
        required_skills: body.required_skills || [],
        visa_allowed: body.visa_allowed || [],
        rate_min: body.rate_min,
        rate_max: body.rate_max,
        job_type: body.job_type || 'C2C',
        source: body.source,
        source_url: body.source_url,
        recruiter_name: body.recruiter_name,
        recruiter_email: body.recruiter_email,
        recruiter_phone: body.recruiter_phone,
        posted_date: body.posted_date || new Date().toISOString().split('T')[0],
        status: 'new'
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
