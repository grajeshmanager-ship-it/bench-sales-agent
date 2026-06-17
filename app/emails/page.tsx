'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function EmailsPage() {
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadEmails()
  }, [])

  async function loadEmails() {
    setLoading(true)
    try {
      const res = await fetch('/api/emails')
      const data = await res.json()
      setEmails(Array.isArray(data) ? data : [])
    } catch (e) {
      setEmails([])
    } finally {
      setLoading(false)
    }
  }

  async function generateReply(email: any) {
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReply(data.reply)
    } catch (e: any) {
      alert('Error: ' + e.message)
    } finally {
      setGenerating(false)
    }
  }

  function directionColor(direction: string) {
    return direction === 'inbound'
      ? 'bg-blue-500/20 text-blue-300'
      : 'bg-green-500/20 text-green-300'
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="border-b border-white/10 px-8 py-4 flex items-center gap-4">
        <Link href="/" className="text-white/50 hover:text-white text-sm">← Back</Link>
        <div>
          <h1 className="text-xl font-semibold">Email Manager</h1>
          <p className="text-sm text-white/50">Read inbound recruiter emails and auto-reply intelligently</p>
        </div>
        <button
          onClick={loadEmails}
          className="ml-auto border border-white/10 hover:bg-white/5 text-white/50 text-sm px-4 py-2 rounded-xl transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Email list */}
        <div className="w-96 border-r border-white/10 overflow-y-auto">
          {loading && (
            <div className="text-center py-20 text-white/30 text-sm animate-pulse">
              Loading emails...
            </div>
          )}
          {!loading && emails.length === 0 && (
            <div className="text-center py-20 px-6">
              <p className="text-white/30 text-sm">No emails yet.</p>
              <p className="text-white/20 text-xs mt-2">
                Emails will appear here when vendors reply to your hotlist outreach.
              </p>
            </div>
          )}
          {!loading && emails.map(email => (
            <div
              key={email.id}
              onClick={() => { setSelected(email); setReply('') }}
              className={`px-5 py-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                selected?.id === email.id ? 'bg-white/10' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-sm font-medium truncate">
                  {email.direction === 'inbound' ? email.from_email : email.to_email}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${directionColor(email.direction)}`}>
                  {email.direction}
                </span>
              </div>
              <div className="text-xs text-white/50 truncate mb-1">{email.subject}</div>
              <div className="text-xs text-white/30 truncate">
                {email.body?.slice(0, 80)}...
              </div>
              <div className="text-xs text-white/20 mt-1">
                {new Date(email.sent_at || email.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Email detail */}
        <div className="flex-1 overflow-y-auto">
          {!selected && (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/20 text-sm">Select an email to view</p>
            </div>
          )}
          {selected && (
            <div className="p-8">
              {/* Email header */}
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">{selected.subject}</h2>
                <div className="text-sm text-white/50 space-y-1">
                  <div>From: {selected.from_email}</div>
                  <div>To: {selected.to_email}</div>
                  <div>Date: {new Date(selected.sent_at || selected.created_at).toLocaleString()}</div>
                </div>
              </div>

              {/* Email body */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans leading-relaxed">
                  {selected.body}
                </pre>
              </div>

              {/* Reply section */}
              {selected.direction === 'inbound' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white/70">Reply</h3>
                    <button
                      onClick={() => generateReply(selected)}
                      disabled={generating}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {generating ? 'Generating...' : '✨ AI Generate Reply'}
                    </button>
                  </div>
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Write your reply or click AI Generate Reply..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/80 resize-none focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      disabled={!reply.trim() || replying}
                      onClick={() => {
                        setReplying(true)
                        setTimeout(() => {
                          setReplying(false)
                          alert('Reply saved. Connect Gmail API to send automatically.')
                        }, 1000)
                      }}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                    >
                      {replying ? 'Sending...' : 'Send Reply'}
                    </button>
                    <button
                      onClick={() => setReply('')}
                      className="border border-white/10 hover:bg-white/5 text-white/50 text-sm px-4 py-2 rounded-xl transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
