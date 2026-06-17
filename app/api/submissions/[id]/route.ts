import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { id } = params

    const { data, error } = await supabase
      .from('submissions')
      .update({
        status: body.status,
        notes: body.notes,
        follow_up_count: body.follow_up_count,
        last_follow_up: body.last_follow_up,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        candidates (
          name,
          title,
          visa_status,
          location,
          primary_skills
        ),
        jobs (
          title,
          company,
          location,
          recruiter_name,
          recruiter_email,
          recruiter_phone
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
