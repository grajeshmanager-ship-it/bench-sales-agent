import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function generateHotlistEmail(candidate: any, vendor: any): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: `You are a senior US IT bench sales recruiter. Write short, punchy hotlist emails that get responses. No fluff, no long intros. Get to the point fast. Sound human, not corporate.`,
    messages: [
      {
        role: 'user',
        content: `Write a hotlist email to a vendor recruiter about this candidate.

CANDIDATE:
Name: ${candidate.name}
Title: ${candidate.title}
Experience: ${candidate.experience_years} years
Visa: ${candidate.visa_status}
Location: ${candidate.location}
Rate: ${candidate.rate}
Available: ${candidate.availability}
Primary Skills: ${(candidate.primary_skills || []).join(', ')}
Domains: ${(candidate.domains || []).join(', ')}

VENDOR:
Name: ${vendor.name}
Company: ${vendor.company}
Technologies they work with: ${(vendor.technologies || []).join(', ')}

Write a short hotlist email with:
- Subject line starting with HOTLIST |
- 3-4 lines max body
- Candidate highlights only
- End with asking if they have open requirements
- Sign off as "Bench Sales Team"

Format:
SUBJECT: [subject line]
BODY:
[email body]`,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

export async function POST(req: NextRequest) {
  try {
    const { vendor_id, candidate_id } = await req.json()

    if (!vendor_id || !candidate_id) {
      return NextResponse.json({ error: 'vendor_id and candidate_id are required' }, { status: 400 })
    }

    // Get vendor and candidate
    const [vendorRes, candidateRes] = await Promise.all([
      supabase.from('vendors').select('*').eq('id', vendor_id).single(),
      supabase.from('candidates').select('*').eq('id', candidate_id).single(),
    ])

    if (vendorRes.error) throw vendorRes.error
    if (candidateRes.error) throw candidateRes.error

    const vendor = vendorRes.data
    const candidate = candidateRes.data

    // Generate email content
    const emailContent = await generateHotlistEmail(candidate, vendor)

    // Parse subject and body
    const subjectMatch = emailContent.match(/SUBJECT:\s*(.+)/i)
    const bodyMatch = emailContent.match(/BODY:\s*([\s\S]+)/i)

    const subject = subjectMatch ? subjectMatch[1].trim() : `HOTLIST | ${candidate.title} | ${candidate.experience_years}yrs | ${candidate.visa_status} | ${candidate.location}`
    const body = bodyMatch ? bodyMatch[1].trim() : emailContent

    // Save to email_threads
    const { error: emailError } = await supabase
      .from('email_threads')
      .insert([{
        vendor_id: vendor.id,
        subject,
        direction: 'outbound',
        body,
        from_email: process.env.NEXT_PUBLIC_APP_URL || 'bench@company.com',
        to_email: vendor.email,
        sent_at: new Date().toISOString(),
        status: 'sent'
      }])

    if (emailError) throw emailError

    // Update vendor last_contacted
    await supabase
      .from('vendors')
      .update({ last_contacted: new Date().toISOString() })
      .eq('id', vendor_id)

    return NextResponse.json({
      success: true,
      subject,
      body,
      to: vendor.email
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
