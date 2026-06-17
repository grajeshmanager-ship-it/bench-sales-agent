'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {
    setLoading(true)
    try {
      const res = await fetch('/api/submissions')
      const data = await res.json()
      setSubmissions(Array.isArray(data) ? data : [])
    } catch (e) {
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await loadSubmissions()
    } catch (e) {}
  }

  const filters = ['all', 'submitted', 'interview', 'offer', 'rejected']

  const filtered = filter === 'all'
    ? submissions
    : submissions.filter(s => s.status === filter)

  function statusColor(status: string) {
    switch (status) {
      case 'submitted': return 'bg-blue-500/20 text-blue-300'
      case 'interview': return 'bg-green-500/20 text-green-300'
      case 'offer': return 'bg-yellow-500/20 text-yellow-300'
      case 'rejected': return 'bg-red-500/20 text-red-300'
      default: return 'bg-white/10 text-white/50'
    }
  }

  const stats = {
    total: submissions.length,
    interview: submissions.filter(s => s.status === 'interview').length,
    offer: submissions.filter(s => s.status === 'offer').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="border-b border-white/10 px-8 py-4 flex items-center gap-4">
        <Link href="/" className="text-white/50 hover:text-white text-sm">← Back</Link>
        <div>
          <h1 className="text-xl font-semibold">Submissions Tracker</h1>
          <p className="text-sm text-white/50">Track every submission — status, follow-ups, pipeline</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 py-6 grid grid-cols-4 gap-4">
        {[
          { label: 'Total Submissions', value: stats.total, color: 'text-white' },
          { label: 'Interviews', value: stats.interview, color: 'text-green-400' },
          { label: 'Offers', value: stats.offer, color: 'text-yellow-400' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-white/50 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-8 pb-4 flex gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Submissions list */}
      <div className="px-8 pb-8">
        {loading && (
          <div className="text-center py-20 text-white/30 text-sm animate-pulse">
            Loading submissions...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/30 text-sm">No submissions yet.</p>
            <Link
              href="/jobs"
              className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300"
            >
              Go scrape some jobs →
            </Link>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(sub => (
              <div
                key={sub.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">
                        {sub.jobs?.title || 'Unknown Role'}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-sm text-white/50 mb-2">
                      {sub.candidates?.name || 'Unknown Candidate'}
                      {sub.jobs?.company && ` → ${sub.jobs.company}`}
                      {sub.jobs?.location && ` · ${sub.jobs.location}`}
                    </div>
                    <div className="text-xs text-white/30">
                      Submitted {new Date(sub.created_at).toLocaleDateString()}
                      {sub.follow_up_count > 0 && ` · ${sub.follow_up_count} follow-ups sent`}
                      {sub.submitted_via && ` · via ${sub.submitted_via}`}
                    </div>
                    {sub.notes && (
                      <div className="mt-2 text-xs text-white/40 bg-white/5 rounded-lg px-3 py-2">
                        {sub.notes}
                      </div>
                    )}
                  </div>

                  {/* Status controls */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <select
                      value={sub.status}
                      onChange={e => updateStatus(sub.id, e.target.value)}
                      className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                      <option value="on_hold">On Hold</option>
                    </select>
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
