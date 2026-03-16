'use client'
import { Trash2 } from 'lucide-react'

export interface HistoryEntry {
  domain: string
  overallScore: number
  grade: string
  date: string
  scores: { performance: number; accessibility: number; bestPractices: number; seo: number }
  report: unknown
}

const scoreColor = (s: number) => s >= 90 ? 'text-green-400' : s >= 50 ? 'text-amber-400' : 'text-red-400'

export default function AuditHistory({ history, onSelect, onClear }: {
  history: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onClear: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-[#F2EDE4]/60 text-xs uppercase tracking-widest mb-4 px-4">Recent Audits</h3>
      <div className="flex-1 overflow-y-auto space-y-1 px-2">
        {history.length === 0 && (
          <p className="text-[#F2EDE4]/30 text-xs text-center py-4 px-2">No audits yet</p>
        )}
        {history.map((entry, i) => (
          <button
            key={i}
            onClick={() => onSelect(entry)}
            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[#F2EDE4] text-xs font-medium truncate max-w-[140px]">{entry.domain}</span>
              <span className={`text-xs font-bold ${scoreColor(entry.overallScore)}`}>{entry.grade}</span>
            </div>
            <div className="text-[#F2EDE4]/30 text-xs">{new Date(entry.date).toLocaleDateString()}</div>
          </button>
        ))}
      </div>
      {history.length > 0 && (
        <div className="p-3 border-t border-white/10">
          <button
            onClick={onClear}
            className="flex items-center gap-2 text-[#F2EDE4]/40 hover:text-red-400 transition-colors text-xs w-full justify-center py-1"
          >
            <Trash2 size={12} /> Clear History
          </button>
        </div>
      )}
    </div>
  )
}
