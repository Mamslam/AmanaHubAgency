import React from 'react'

type Variant = 'gold' | 'ghost' | 'danger' | 'outline' | 'teal'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const variants: Record<Variant, React.CSSProperties> = {
  gold:    { background: '#C9A84C',              color: '#0A0A0F', border: 'none',                              fontWeight: 700 },
  ghost:   { background: 'rgba(255,255,255,0.05)', color: '#F2EDE4', border: '1px solid rgba(255,255,255,0.1)' },
  danger:  { background: 'rgba(220,38,38,0.15)',  color: '#f87171', border: '1px solid rgba(220,38,38,0.3)'   },
  outline: { background: 'transparent',           color: '#C9A84C', border: '1px solid rgba(201,168,76,0.4)'  },
  teal:    { background: 'rgba(45,212,191,0.12)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.3)'  },
}

const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: '5px 10px',  fontSize: '12px', borderRadius: '6px' },
  md: { padding: '8px 14px',  fontSize: '13px', borderRadius: '6px' },
  lg: { padding: '11px 20px', fontSize: '14px', borderRadius: '8px' },
}

export default function Button({
  variant = 'ghost',
  size = 'md',
  loading,
  icon,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'var(--font-dm-sans), sans-serif',
        fontWeight: 500,
        transition: 'all 0.15s',
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
    >
      {loading ? (
        <span
          className="animate-spin"
          style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }}
        />
      ) : icon}
      {children}
    </button>
  )
}
