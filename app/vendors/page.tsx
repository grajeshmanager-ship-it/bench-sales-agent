'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    technologies: '',
    tier: 'tier2',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadVendors()
    loadCandidates()
  }, [])

  async function loadVendors() {
    setLoading(true)
    try {
      const res = await fetch('/api/vendors')
      const data = await res.json()
      setVendors(Array.isArray(data) ? data : [])
    } catch (e) {
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  async function loadCandidates() {
    try {
      const res = await fetch('/api/candidates')
      const data = await res.json()
      setCandidates(Array.isArray(data) ? data : [])
    } catch (e) {}
  }

  async function addVendor() {
    if (!form.name || !form.email) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setShowAdd(false)
      setForm({ name: '', company: '', email: '', phone: '', technologies: '', tier: 'tier2' })
      await loadVendors()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function sendHotlist(vendorId: string) {
    if (!selectedCandidate) {
      alert('Select a candidate first')
      return
    }
    setSending(vendorId)
    try {
      const res = await fetch('/api/send-hotlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendorId,
          candidate_id: selectedCandidate,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      alert('Hotlist email sent successfully!')
      await loadVendors()
    } catch (e: any) {
      alert('Error: ' + e.message)
    } finally {
      setSending(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white/50 hover:text-white text-sm">← Back</Link>
          <div>
            <h1 className="text-xl font-semibold">Vendor Outreach</h1>
            <p className="text-sm text-white/50">Manage recruiters and send hotlist emails</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          + Add Vendor
        </button>
      </div>

      {/* Candidate selector for hotlist */}
      <div className="px-8 py-4 border-b border-white/10 flex items-center gap-4">
        <div className="text-sm text-white/50 shrink-0">Send hotlist for:</div>
        <select
          value={selectedCandidate}
          onChange={e => setSelectedCandidate(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">-- Select candidate --</option>
          {candidates.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.title} — {c.visa_status}
            </option>
          ))}
        </select>
      </div>

      {/* Add vendor form */}
      {showAdd && (
        <div className="px-8 py-6 border-b border-white/10 bg-white/2">
          <h2 className="text-sm font-medium mb-4">Add New Vendor</h2>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              { key: 'name', placeholder: 'Recruiter name' },
              { key: 'company', placeholder: 'Company' },
              { key: 'email', placeholder: 'Email address' },
              { key: 'phone', placeholder: 'Phone number' },
              { key: 'technologies', placeholder: 'Technologies (comma separated)' },
            ].map(field => (
              <input
                key={field.key}
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            ))}
            <select
              value={form.tier}
              onChange={e => setForm({ ...form, tier: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="tier1">Tier 1 (Direct client)</option>
              <option value="tier2">Tier 2 (Implementation partner)</option>
              <option value="tier3">Tier 3 (Subvendor)</option>
            </select>
          </div>
          {error && (
            <div className="mb-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={addVendor}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              {saving ? 'Saving...' : 'Save Vendor'}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="border border-white/10 hover:bg-white/5 text-white/50 text-sm px-4 py-2 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Vendors list */}
      <div className="px-8 py-6">
        {loading && (
          <div className="text-center py-20 text-white/30 text-sm animate-pulse">
            Loading vendors...
          </div>
        )}
        {!loading && vendors.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/30 text-sm">No vendors yet. Add recruiters above.</p>
          </div>
        )}
        {!loading && vendors.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm text-white/40 mb-4">{vendors.length} vendors</div>
            {vendors.map(vendor => (
              <div
                key={vendor.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium">{vendor.name}</h3>
                    {vendor.company && (
                      <span className="text-sm text-white/50">{vendor.company}</span>
                    )}
                    <span className="text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full">
                      {vendor.tier}
                    </span>
                  </div>
                  <div className="text-sm text-white/50 mb-2">
                    📧 {vendor.email}
                    {vendor.phone && ` · 📞 ${vendor.phone}`}
                  </div>
                  {vendor.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {vendor.technologies.map((t: string) => (
                        <span key={t} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {vendor.last_contacted && (
                    <div className="text-xs text-white/30 mt-2">
                      Last contacted: {new Date(vendor.last_contacted).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => sendHotlist(vendor.id)}
                  disabled={sending === vendor.id || !selectedCandidate}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shrink-0"
                >
                  {sending === vendor.id ? 'Sending...' : 'Send Hotlist'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
