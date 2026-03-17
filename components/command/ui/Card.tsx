import React from 'react'

interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  hover?: boolean
}

export default function Card({ children, style, className = '', hover = false }: CardProps) {
  return (
    <div className={`cc-card ${hover ? 'cc-card-hover' : ''} ${className}`} style={style}>
      {children}
    </div>
  )
}

interface KPICardProps {
  label: string
  value: string | number
  sub?: string
  trend?: number
  icon?: string
  color?: string
}

export function KPICard({ label, value, sub, trend, icon, color = '#C9A84C' }: KPICardProps) {
  return (
    <div className="cc-card" style={{ padding: '20px', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(242,237,228,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        {icon && <span style={{ fontSize: '20px' }}>{icon}</span>}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {(sub !== undefined || trend !== undefined) && (
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          {trend !== undefined && (
            <span style={{ color: trend >= 0 ? '#4ade80' : '#f87171', fontWeight: 600 }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {sub && <span style={{ color: 'rgba(242,237,228,0.4)' }}>{sub}</span>}
        </div>
      )}
    </div>
  )
}
