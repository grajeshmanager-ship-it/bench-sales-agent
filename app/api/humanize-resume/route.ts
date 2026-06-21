import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const styleInstructions: Record<string, string> = {
  aggressive: 'Aggressively mirror the JD language. Reorder all skills sections to put JD-matching skills first. Rewrite every bullet to include JD keywords naturally. Rewrite summary completely around the role.',
  balanced: 'Balance natural human voice with strong JD alignment. Mirror key terms but vary the language. Summary should feel like the person wrote it, not a template.',
  subtle: 'Light touch only. Update the summary to mention the role. Move matching skills to top. Keep experience bullets mostly unchanged, add 1-2 JD keywords per role naturally.',
}

export async function POST(req: NextRequest) {
  try {
    const { candidate, jd, roleTitle, domain, style } = await req.json()

    if (!candidate || !jd) {
      return NextResponse.json({ error: 'Candidate and JD are required' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: `You are a senior US IT bench sales recruiter with 15 years of experience. You write resumes that pass ATS systems and impress human recruiters. Your resume writing sounds 100% human — varied sentence lengths, active voice, specific achievements, no AI buzzwords. Never use: leveraged, spearheaded, orchestrated, synergized, dynamic, passionate, results-driven, seasoned professional. Use real recruiter language.`,
      messages: [
        {
          role: 'user',
          content: `Rewrite this candidate's resume tailored to the job description below.

CANDIDATE PROFILE:
Name: ${candidate.name}
Title: ${candidate.title}
Experience: ${candidate.experience_years} years
Visa: ${candidate.visa_status}
Location: ${candidate.location}
Rate: ${candidate.rate}
Primary Skills: ${(candidate.primary_skills || []).join(', ')}
Secondary Skills: ${(candidate.secondary_skills || []).join(', ')}
Domains: ${(candidate.domains || []).join(', ')}
Summary: ${candidate.summary}
Raw Resume: ${candidate.raw_resume || ''}

JOB DESCRIPTION:
${jd}

ROLE: ${roleTitle || 'as specified in JD'}
DOMAIN: ${domain || 'as specified in JD'}

STYLE: ${styleInstructions[style] || styleInstructions.balanced}

RULES:
- No tables, no columns — ATS cannot parse them
- Clean sections only: Summary | Technical Skills | Professional Experience | Education | Certifications
- Bullet points start with strong past-tense action verbs
- Include specific numbers and percentages where possible
- Skills section: list JD-matching skills FIRST
- Summary: 3-4 lines, sounds like a human wrote it
- Never use: leveraged, spearheaded, orchestrated, synergized, passionate, dynamic, results-driven
- Use: built, led, reduced, improved, delivered, designed, managed, increased, cut, owned

After the resume add exactly this separator: ---PITCH---
Then one sentence a bench sales recruiter would say on a cold call for this specific role.

Then add: ---KEYWORDS---
Then comma separated list of JD keywords now in the resume.`,
        },
      ],
    })

const firstBlock = message.content[0]
        const text = firstBlock.type === 'text' ? firstBlock.text : ''

        if (!text) {
                return NextResponse.json({ error: 'Claude did not return readable text. Please try again.' }, { status: 502 })
        }

    const parts = text.split('---PITCH---')
    const resume = parts[0].trim()
    const rest = parts[1] || ''

    const keywordsParts = rest.split('---KEYWORDS---')
    const pitch = keywordsParts[0].trim()
    const keywordsRaw = keywordsParts[1] || ''
    const keywords = keywordsRaw.split(',').map((k: string) => k.trim()).filter(Boolean)

    return NextResponse.json({ resume, pitch, keywords })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
