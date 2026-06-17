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

async function scrapeUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })
    const html = await res.text()
    // Strip HTML tags and clean up
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text.slice(0, 8000)
  } catch (e) {
    return ''
  }
}

async function parseJobsFromText(text: string, keyword: string): Promise<any[]> {
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: 'You are a US IT staffing expert. Extract job listings from raw text. Return valid JSON only, no markdown.',
      messages: [
        {
          role: 'user',
          content: `Extract all job listings for "${keyword}" from this text and return a JSON array:
[{
  "title": "job title",
  "company": "company name",
  "location": "city state or Remote",
  "remote": true/false,
  "description": "job description summary",
  "required_skills": ["skill1","skill2"],
  "visa_allowed": ["H1B","GC","USC"],
  "rate_min": number or null,
  "rate_max": number or null,
  "job_type": "C2C/W2/1099",
  "recruiter_name": "name or null",
  "recruiter_email": "email or null",
  "recruiter_phone": "phone or null",
  "source_url": "url or null"
}]

Text:
${text}`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '[]'
    const clean = responseText.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (e) {
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    const { keyword, location } = await req.json()

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    const searchQuery = encodeURIComponent(`${keyword} ${location || ''} job C2C contract`.trim())
    const today = new Date().toISOString().split('T')[0]

    // Scrape from multiple sources
    const sources = [
      `https://www.dice.com/jobs?q=${searchQuery}&datePosted=1`,
      `https://www.indeed.com/jobs?q=${searchQuery}&fromage=1`,
      `https://remoteok.com/remote-${encodeURIComponent(keyword.toLowerCase().replace(/\s+/g, '-'))}-jobs`,
    ]

    let allJobs: any[] = []

    for (const url of sources) {
      const text = await scrapeUrl(url)
      if (text) {
        const jobs = await parseJobsFromText(text, keyword)
        const source = url.includes('dice') ? 'Dice' : url.includes('indeed') ? 'Indeed' : 'RemoteOK'
        allJobs = [...allJobs, ...jobs.map(j => ({ ...j, source, posted_date: today }))]
      }
    }

    // Save to Supabase
    if (allJobs.length > 0) {
      const { error } = await supabase
        .from('jobs')
        .insert(allJobs.map(job => ({
          title: job.title || keyword,
          company: job.company || 'Unknown',
          location: job.location || location || 'Remote',
          remote: job.remote ?? true,
          description: job.description || '',
          required_skills: job.required_skills || [],
          visa_allowed: job.visa_allowed || [],
          rate_min: job.rate_min || null,
          rate_max: job.rate_max || null,
          job_type: job.job_type || 'C2C',
          source: job.source,
          source_url: job.source_url || null,
          recruiter_name: job.recruiter_name || null,
          recruiter_email: job.recruiter_email || null,
          recruiter_phone: job.recruiter_phone || null,
          posted_date: today,
          status: 'new'
        })))

      if (error) throw error
    }

    return NextResponse.json({
      success: true,
      count: allJobs.length,
      jobs: allJobs
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
