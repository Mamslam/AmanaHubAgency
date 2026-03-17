export default function LionLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <polygon points="50,8 70,25 80,50 70,75 50,92 30,75 20,50 30,25" fill="none" stroke="#C9A84C" strokeWidth="2"/>
      <polygon points="50,18 65,30 72,50 65,70 50,82 35,70 28,50 35,30" fill="rgba(201,168,76,0.08)" stroke="#C9A84C" strokeWidth="1.5"/>
      <circle cx="40" cy="44" r="4" fill="#C9A84C"/>
      <circle cx="60" cy="44" r="4" fill="#C9A84C"/>
      <circle cx="40" cy="44" r="2" fill="#0A0A0F"/>
      <circle cx="60" cy="44" r="2" fill="#0A0A0F"/>
      <polygon points="50,52 46,58 54,58" fill="#C9A84C" opacity="0.8"/>
      <line x1="50" y1="8" x2="50" y2="18" stroke="#C9A84C" strokeWidth="1.5" opacity="0.5"/>
      <line x1="70" y1="25" x2="65" y2="30" stroke="#C9A84C" strokeWidth="1.5" opacity="0.5"/>
      <line x1="80" y1="50" x2="72" y2="50" stroke="#C9A84C" strokeWidth="1.5" opacity="0.5"/>
      <line x1="30" y1="25" x2="35" y2="30" stroke="#C9A84C" strokeWidth="1.5" opacity="0.5"/>
      <line x1="20" y1="50" x2="28" y2="50" stroke="#C9A84C" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  )
}
