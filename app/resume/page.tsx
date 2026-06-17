'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ResumePage() {
  const [resumeText, setResumeText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState<any>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function parseResume() {
    if (!resumeText.trim()) return
    setParsing(true)
    setError('')
    setParsed(null)

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeText }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setParsed(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setParsing(false)
    }
  }

  async function saveCandidate() {
    if (!parsed) return
    setSaving(true)
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed, raw_resume: resumeText }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSaved(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="border-b border-white/10 px-8 py-4 flex items-center gap-4">
        <Link href="/" className="text-white/50 hover:text-white text-sm">← Back</Link>
        <div>
          <h1 className="text-xl font-semibold">Resume Parser</h1>
          <p className="text-sm text-white/50">Paste resume → extract full candidate profile</p>
        </div>
      </div>

      <div className="px-8 py-6 grid grid-cols-2 gap-6">
        {/* Input */}
        <div>
          <label className="block text-sm text-white/50 mb-2">Paste resume text</label>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste the full resume here..."
            className="w-full h-[500px] bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono text-white/80 resize-none focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={parseResume}
            disabled={parsing || !resumeText.trim()}
            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
          >
            {parsing ? 'Parsing...' : 'Parse Resume'}
          </button>
          {error && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Output */}
        <div>
          {!parsed && !parsing && (
            <div className="h-[500px] bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <p className="text-white/30 text-sm">Parsed profile will appear here</p>
            </div>
          )}
          {parsing && (
            <div className="h-[500px] bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <p className="text-white/50 text-sm animate-pulse">Analysing resume...</p>
            </div>
          )}
          {parsed && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Name', value: parsed.name },
                  { label: 'Title', value: parsed.title },
                  { label: 'Experience', value: `${parsed.experience_years} years` },
                  { label: 'Visa', value: parsed.visa_status },
                  { label: 'Location', value: parsed.location },
                  { label: 'Rate', value: parsed.rate },
                  { label: 'Available', value: parsed.availability },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-white/40 mb-1">{item.label}</div>
                    <div className="text-sm font-medium">{item.value || '—'}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-xs text-white/40 mb-2">Primary Skills</div>
                <div className="flex flex-wrap gap-2">
                  {(parsed.primary_skills || []).map((s: string) => (
                    <span key={s} className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/40 mb-2">Secondary Skills</div>
                <div className="flex flex-wrap gap-2">
                  {(parsed.secondary_skills || []).map((s: string) => (
                    <span key={s} className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/40 mb-2">Summary</div>
                <p className="text-sm text-white/70 leading-relaxed">{parsed.summary}</p>
              </div>

              <button
                onClick={saveCandidate}
                disabled={saving || saved}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-medium py-3 rounded-xl transition-colors"
              >
                {saved ? '✓ Saved to database' : saving ? 'Saving...' : 'Save Candidate'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
