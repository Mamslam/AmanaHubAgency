'use client'
import { useState } from 'react'
import type { ScraperInput } from '@/types/scraper'

const NICHE_SUGGESTIONS = [
  'restaurant', 'boulangerie', 'pizzeria', 'coiffeur', 'plombier',
  'électricien', 'restaurant halal', 'artisan', 'pharmacie', 'médecin',
  'dentiste', 'avocat', 'comptable', 'architecte', 'garage automobile',
  'fleuriste', 'bijouterie', 'épicerie', 'salle de sport', 'hôtel',
]

const COUNTRY_OPTIONS = [
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'MA', label: '🇲🇦 Morocco' },
  { value: 'BE', label: '🇧🇪 Belgium' },
  { value: 'CH', label: '🇨🇭 Switzerland' },
  { value: 'SN', label: '🇸🇳 Senegal' },
  { value: 'DZ', label: '🇩🇿 Algeria' },
  { value: 'TN', label: '🇹🇳 Tunisia' },
  { value: 'AE', label: '🇦🇪 UAE' },
  { value: 'GB', label: '🇬🇧 UK' },
  { value: 'other', label: '🌍 Other' },
]

interface SearchFormProps {
  onStart: (input: ScraperInput) => void
  running: boolean
}

export function SearchForm({ onStart, running }: SearchFormProps) {
  const [niche, setNiche] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('DE')
  const [language, setLanguage] = useState<ScraperInput['language']>('DE')
  const [limit, setLimit] = useState(50)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = niche
    ? NICHE_SUGGESTIONS.filter(s => s.toLowerCase().includes(niche.toLowerCase())).slice(0, 6)
    : NICHE_SUGGESTIONS.slice(0, 6)

  const handleStart = () => {
    if (!niche.trim() || !city.trim()) return
    onStart({ niche: niche.trim(), city: city.trim(), country, language, limit })
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '20px',
    }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#C9A84C', marginBottom: '16px' }}>Smart Scraper</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 90px 120px', gap: '10px', alignItems: 'end', marginBottom: '16px' }}>
        {/* Niche */}
        <div style={{ position: 'relative' }}>
          <label style={{ fontSize: '11px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '5px' }}>Niche / Business type</label>
          <input
            className="cc-input"
            value={niche}
            onChange={e => setNiche(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="restaurant, coiffeur..."
            style={{ width: '100%' }}
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px', marginTop: '2px', overflow: 'hidden',
            }}>
              {filteredSuggestions.map(s => (
                <div
                  key={s}
                  onMouseDown={() => { setNiche(s); setShowSuggestions(false) }}
                  style={{ padding: '8px 12px', fontSize: '13px', color: 'rgba(242,237,228,0.8)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,168,76,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* City */}
        <div>
          <label style={{ fontSize: '11px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '5px' }}>City</label>
          <input
            className="cc-input"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Berlin, Paris, Casablanca..."
            style={{ width: '100%' }}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
          />
        </div>

        {/* Country */}
        <div>
          <label style={{ fontSize: '11px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '5px' }}>Country</label>
          <select
            className="cc-select"
            value={country}
            onChange={e => setCountry(e.target.value)}
            style={{ width: '100%' }}
          >
            {COUNTRY_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label style={{ fontSize: '11px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '5px' }}>Language</label>
          <select
            className="cc-select"
            value={language}
            onChange={e => setLanguage(e.target.value as ScraperInput['language'])}
            style={{ width: '100%' }}
          >
            {(['DE', 'FR', 'AR', 'EN'] as const).map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Limit */}
        <div>
          <label style={{ fontSize: '11px', color: 'rgba(242,237,228,0.5)', display: 'block', marginBottom: '5px' }}>
            Limit: <span style={{ color: '#C9A84C', fontWeight: 600 }}>{limit}</span>
          </label>
          <input
            type="range"
            min={10}
            max={100}
            step={10}
            value={limit}
            onChange={e => setLimit(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#C9A84C' }}
          />
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={running || !niche.trim() || !city.trim()}
        style={{
          padding: '10px 28px', fontSize: '14px', fontWeight: 700,
          background: running || !niche || !city ? 'rgba(201,168,76,0.3)' : '#C9A84C',
          color: running || !niche || !city ? 'rgba(201,168,76,0.5)' : '#0A0A0F',
          border: 'none', borderRadius: '7px',
          cursor: running || !niche || !city ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        {running ? (
          <>
            <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A0A0F', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
            Scraping...
          </>
        ) : '▶ Start Scraping'}
      </button>
    </div>
  )
}
