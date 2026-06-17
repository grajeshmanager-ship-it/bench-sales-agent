import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: `You are a senior US IT bench sales recruiter. Write short, professional email replies to vendor recruiters. Be direct, friendly, and get to the point fast. Sound human. Never use corporate buzzwords.`,
      messages: [
        {
          role: 'user',
          content: `Write a reply to this recruiter email.

ORIGINAL EMAIL:
Subject: ${email.subject}
From: ${email.from_email}
Body:
${email.body}

Write a reply that:
- Responds directly to what they asked
- If they asked for a resume — confirm you will send it right away
- If they asked about rate — say you are flexible and ask their budget
- If they want to schedule an interview — confirm availability and ask for time slots
- If they rejected — thank them and ask to keep candidate in mind for future roles
- If unclear — ask a clarifying question

Keep it under 5 lines. Sound like a real recruiter, not a bot.
Return only the email body, no subject line needed.`,
        },
      ],
    })

    const reply = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ reply })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
