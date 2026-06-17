'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HumanizePage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [jd, setJd] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [domain, setDomain] = useState('')
  const [style, setStyle] = useState('balanced')
  const [humanizing, setHumanizing] = useState(false)
  const [output, setOutput] = useState<any>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/candidates')
      .then(r => r.json())
      .then(data => setCandidates(Array.isArray(data) ? data : []))
  }, [])

  async function humanize() {
    if (!selectedCandidate || !jd.trim()) return
    setHumanizing(true)
    setError('')
    setOutput(null)

    try {
      const res = await fetch('/api/humanize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate: selectedCandidate,
          jd,
          roleTitle,
          domain,
          style,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOutput(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setHumanizing(false)
    }
  }

  function copyResume() {
    if (!output?.resume) return
    navigator.clipboard.writeText(output.resume)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="border-b border-white/10 px-8 py-4 flex items-center gap-4">
        <Link href="/" className="text-white/50 hover:text-white text-sm">← Back</Link>
        <div>
          <h1 className="text-xl font-semibold">Resume Humanizer</h1>
          <p className="text-sm text-white/50">Tailor resume per JD — ATS-compliant, 100% human-sounding</p>
        </div>
      </div>

      <div className="px-8 py-6 grid grid-cols-2 gap-6">
        {/* Left — inputs */}
        <div className="space-y-4">
          {/* Candidate selector */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Select candidate</label>
            <select
              value={selectedCandidate?.id || ''}
              onChange={e => setSelectedCandidate(candidates.find(c => c.id === e.target.value) || null)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Select a candidate --</option>
              {candidates.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.title} — {c.visa_status} — {c.location}
                </option>
              ))}
            </select>
          </div>

          {/* Role + domain */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/50 mb-2">Role title</label>
              <input
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior Java Developer"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Domain</label>
              <input
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="e.g. Banking, Healthcare"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Humanization style</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'aggressive', label: 'Aggressive', desc: 'Max keyword match' },
                { value: 'balanced', label: 'Balanced', desc: 'Natural + aligned' },
                { value: 'subtle', label: 'Subtle', desc: 'Light touch only' },
              ].map(s => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`border rounded-xl p-3 text-left transition-all ${
                    style === s.value
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-white/40 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* JD */}
          <div>
            <label className="block text-sm text-white/50 mb-2">Job description</label>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste the full job description from Dice, Indeed, C2C portal..."
              className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80 resize-none focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={humanize}
            disabled={humanizing || !selectedCandidate || !jd.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
          >
            {humanizing ? 'Humanizing...' : 'Generate Tailored Resume'}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Right — output */}
        <div>
          {!output && !humanizing && (
            <div className="h-full min-h-[500px] bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <p className="text-white/30 text-sm">Tailored resume will appear here</p>
            </div>
          )}
          {humanizing && (
            <div className="h-full min-h-[500px] bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
              <p className="text-white/50 text-sm animate-pulse">Humanizing resume...</p>
            </div>
          )}
          {output && (
            <div className="space-y-4">
              {/* Pitch line */}
              {output.pitch && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                  <div className="text-xs text-indigo-400 mb-1">Cold call pitch line</div>
                  <p className="text-sm text-white/80 italic">"{output.pitch}"</p>
                </div>
              )}

              {/* Keywords matched */}
              {output.keywords?.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-xs text-white/40 mb-2">Keywords matched</div>
                  <div className="flex flex-wrap gap-2">
                    {output.keywords.map((k: string) => (
                      <span key={k} className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full">✓ {k}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume output */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-white/40">Tailored resume</div>
                  <button
                    onClick={copyResume}
                    className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans leading-relaxed max-h-[500px] overflow-y-auto">
                  {output.resume}
                </pre>
              </div>

              <button
                onClick={humanize}
                className="w-full border border-white/10 hover:bg-white/5 text-white/70 font-medium py-3 rounded-xl transition-colors text-sm"
              >
                Regenerate
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
