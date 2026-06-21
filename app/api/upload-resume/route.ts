import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const isPdf = file.name.toLowerCase().endsWith('.pdf')

  if (!isPdf) {
    return NextResponse.json(
      { error: 'Only PDF files are supported for direct upload right now. Please save your resume as a PDF, or use the "Paste resume text" option instead.' },
      { status: 400 }
      )
  }

  const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: 'You are an expert US IT staffing analyst. Extract structured data from resumes. Always respond with valid JSON only, no markdown, no explanation, no code blocks.',
    messages: [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 }
        },
        {
          type: 'text',
          text: 'Parse this resume and return JSON with these exact fields: {"name": "full name", "title": "current job title", "experience_years": number, "visa_status": "H1B/GC/USC/OPT/CPT/H4EAD/TN/other", "location": "city, state", "rate": "expected rate or open", "availability": "immediate/2 weeks/1 month/etc", "primary_skills": ["skill1","skill2","skill3","skill4","skill5"], "secondary_skills": ["skill1","skill2","skill3"], "domains": ["domain1","domain2"], "summary": "2 sentence candidate summary in recruiter language", "work_history": [{"company":"","title":"","duration":"","key_achievement":""}]}'
        }
        ]
    }]
  })

  const firstBlock = message.content[0]
    const text = firstBlock.type === 'text' ? firstBlock.text : ''

  if (!text) {
    return NextResponse.json({ error: 'Claude did not return readable text. Please try again.' }, { status: 502 })
  }

  const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

  return NextResponse.json(parsed)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
