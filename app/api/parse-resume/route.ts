import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { resume } = await req.json()

    if (!resume) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: `You are an expert US IT staffing analyst. Extract structured data from resumes. Always respond with valid JSON only, no markdown, no explanation, no code blocks.`,
      messages: [
        {
          role: 'user',
          content: `Parse this resume and return JSON with these exact fields:
{
  "name": "full name",
  "title": "current job title",
  "experience_years": number,
  "visa_status": "H1B/GC/USC/OPT/CPT/H4EAD/TN/other",
  "location": "city, state",
  "rate": "expected rate or open",
  "availability": "immediate/2 weeks/1 month/etc",
  "primary_skills": ["skill1","skill2","skill3","skill4","skill5"],
  "secondary_skills": ["skill1","skill2","skill3"],
  "domains": ["domain1","domain2"],
  "summary": "2 sentence candidate summary in recruiter language",
  "work_history": [{"company":"","title":"","duration":"","key_achievement":""}]
}

Resume:
${resume}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
