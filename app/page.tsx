import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Bench Sales Agent</h1>
          <p className="text-sm text-white/50">Autonomous AI recruiter</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm text-white/50">Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-8 py-6 grid grid-cols-4 gap-4">
        {[
          { label: 'Candidates', value: '0', sub: 'on bench' },
          { label: 'Jobs Scraped', value: '0', sub: 'today' },
          { label: 'Submissions', value: '0', sub: 'this week' },
          { label: 'Interviews', value: '0', sub: 'scheduled' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm text-white/70 mt-1">{stat.label}</div>
            <div className="text-xs text-white/30 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Modules */}
      <div className="px-8 py-2 grid grid-cols-3 gap-4">
        {[
          {
            title: 'Resume Parser',
            desc: 'Upload and parse candidate resumes. Extract skills, visa, rate, availability.',
            href: '/resume',
            icon: '📄',
            status: 'ready',
          },
          {
            title: 'Job Scraper',
            desc: 'Scrape fresh requirements from Dice, Indeed, C2C portals — today only.',
            href: '/jobs',
            icon: '🔍',
            status: 'ready',
          },
          {
            title: 'Resume Humanizer',
            desc: 'Auto-tailor resume per job description. ATS-compliant, 100% human-sounding.',
            href: '/humanize',
            icon: '✍️',
            status: 'ready',
          },
          {
            title: 'Vendor Outreach',
            desc: 'Find recruiter contacts and auto-send hotlist emails.',
            href: '/vendors',
            icon: '📧',
            status: 'ready',
          },
          {
            title: 'Submissions Tracker',
            desc: 'Track every submission — status, follow-ups, interview pipeline.',
            href: '/submissions',
            icon: '📊',
            status: 'ready',
          },
          {
            title: 'Email Manager',
            desc: 'Read inbound recruiter emails and auto-reply intelligently.',
            href: '/emails',
            icon: '📬',
            status: 'coming soon',
          },
        ].map((mod) => (
          <Link
            key={mod.title}
            href={mod.status === 'coming soon' ? '#' : mod.href}
            className={`bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all group ${mod.status === 'coming soon' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-3xl mb-3">{mod.icon}</div>
            <div className="font-medium mb-1 group-hover:text-indigo-400 transition-colors">
              {mod.title}
            </div>
            <div className="text-sm text-white/50 leading-relaxed">{mod.desc}</div>
            {mod.status === 'coming soon' && (
              <div className="mt-3 text-xs text-white/30 border border-white/10 rounded-full px-2 py-0.5 inline-block">
                Coming soon
              </div>
            )}
          </Link>
        ))}
      </div>
    </main>
  )
}
