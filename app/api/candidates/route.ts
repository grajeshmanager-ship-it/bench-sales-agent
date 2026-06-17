import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('candidates')
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
      .from('candidates')
      .insert([{
        name: body.name,
        title: body.title,
        experience_years: body.experience_years,
        visa_status: body.visa_status,
        location: body.location,
        rate: body.rate,
        availability: body.availability,
        primary_skills: body.primary_skills,
        secondary_skills: body.secondary_skills,
        domains: body.domains,
        summary: body.summary,
        raw_resume: body.raw_resume,
        parsed_data: body,
        status: 'active'
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
