'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [scraping, setScraping] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs')
      const data = await res.json()
      setJobs(Array.isArray(data) ? data : [])
    } catch (e) {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  async function scrapeJobs() {
    if (!keyword.trim()) return
    setScraping(true)
    setError('')
    try {
      const res = await fetch('/api/scrape-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, location }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      await loadJobs()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setScraping(false)
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-300'
      case 'submitted': return 'bg-yellow-500/20 text-yellow-300'
      case 'interview': return 'bg-green-500/20 text-green-300'
      case 'rejected': return 'bg-red-500/20 text-red-300'
      default: return 'bg-white/10 text-white/50'
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="border-b border-white/10 px-8 py-4 flex items-center gap-4">
        <Link href="/" className="text-white/50 hover:text-white text-sm">← Back</Link>
        <div>
          <h1 className="text-xl font-semibold">Job Scraper</h1>
          <p className="text-sm text-white/50">Scrape fresh requirements from Dice, Indeed, C2C — today only</p>
        </div>
      </div>

      {/* Scraper controls */}
      <div className="px-8 py-6 border-b border-white/10">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm text-white/50 mb-2">Technology / keyword</label>
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="e.g. Java Developer, React, Python"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm text-white/50 mb-2">Location (optional)</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Texas, Remote"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={scrapeJobs}
            disabled={scraping || !keyword.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            {scraping ? 'Scraping...' : 'Scrape Jobs'}
          </button>
        </div>
        {error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Jobs list */}
      <div className="px-8 py-6">
        {loading && (
          <div className="text-center py-20 text-white/30 text-sm animate-pulse">Loading jobs...</div>
        )}
        {!loading && jobs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/30 text-sm">No jobs yet. Scrape some requirements above.</p>
          </div>
        )}
        {!loading && jobs.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm text-white/40 mb-4">{jobs.length} jobs found</div>
            {jobs.map(job => (
              <div key={job.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{job.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(job.status)}`}>
                        {job.status}
                      </span>
                      {job.remote && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Remote</span>
                      )}
                    </div>
                    <div className="text-sm text-white/50 mb-2">
                      {job.company} {job.location && `· ${job.location}`}
                      {job.rate_min && ` · $${job.rate_min}${job.rate_max ? `–$${job.rate_max}` : '+'}/hr`}
                    </div>
                    {job.required_skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {job.required_skills.slice(0, 6).map((s: string) => (
                          <span key={s} className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                    {job.recruiter_email && (
                      <div className="text-xs text-white/40">
                        📧 {job.recruiter_name || 'Recruiter'} · {job.recruiter_email}
                        {job.recruiter_phone && ` · ${job.recruiter_phone}`}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      href={`/humanize?job=${job.id}`}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors text-center"
                    >
                      Tailor Resume
                    </Link>
                    {job.source_url && (
                      
                        href={job.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs border border-white/10 hover:bg-white/10 text-white/50 px-3 py-1.5 rounded-lg transition-colors text-center"
                      >
                        View Job
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
