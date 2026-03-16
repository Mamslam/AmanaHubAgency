'use client'
import { useState } from 'react'
import { Copy, Mail } from 'lucide-react'

interface OutreachData {
  subject: string
  body: string
}

interface Props {
  outreachEN: OutreachData
  outreachFR: OutreachData
  outreachDE: OutreachData
}

const tabs = [
  { key: 'EN', flag: '🇬🇧' },
  { key: 'FR', flag: '🇫🇷' },
  { key: 'DE', flag: '🇩🇪' },
] as const

export default function OutreachEmail({ outreachEN, outreachFR, outreachDE }: Props) {
  const [activeTab, setActiveTab] = useState<'EN' | 'FR' | 'DE'>('EN')
  const [subjects, setSubjects] = useState({ EN: outreachEN.subject, FR: outreachFR.subject, DE: outreachDE.subject })
  const [bodies, setBodies] = useState({ EN: outreachEN.body, FR: outreachFR.body, DE: outreachDE.body })
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(`Subject: ${subjects[activeTab]}\n\n${bodies[activeTab]}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openGmail = () => {
    const url = `mailto:?subject=${encodeURIComponent(subjects[activeTab])}&body=${encodeURIComponent(bodies[activeTab])}`
    window.open(url)
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-[#F2EDE4] font-semibold mb-4">Client Outreach Email</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#C9A84C] text-[#0A0A0F]'
                : 'bg-white/5 text-[#F2EDE4]/60 hover:text-[#F2EDE4]'
            }`}
          >
            {tab.flag} {tab.key}
          </button>
        ))}
      </div>

      {/* Subject */}
      <div className="mb-3">
        <label className="text-[#F2EDE4]/50 text-xs mb-1 block">Subject</label>
        <input
          value={subjects[activeTab]}
          onChange={e => setSubjects(prev => ({ ...prev, [activeTab]: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#F2EDE4] text-sm focus:outline-none focus:border-[#C9A84C]/50"
        />
      </div>

      {/* Body */}
      <div className="mb-4">
        <label className="text-[#F2EDE4]/50 text-xs mb-1 block">Body</label>
        <textarea
          value={bodies[activeTab]}
          onChange={e => setBodies(prev => ({ ...prev, [activeTab]: e.target.value }))}
          rows={8}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[#F2EDE4] text-sm focus:outline-none focus:border-[#C9A84C]/50 resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={copy}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-[#F2EDE4] rounded-lg text-sm transition-colors"
        >
          <Copy size={14} />
          {copied ? 'Copied!' : 'Copy Email'}
        </button>
        <button
          onClick={openGmail}
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C]/20 hover:bg-[#C9A84C]/30 text-[#C9A84C] rounded-lg text-sm transition-colors"
        >
          <Mail size={14} />
          Open in Gmail
        </button>
      </div>
    </div>
  )
}
