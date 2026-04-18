const TABS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (on) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? '#5A9E6F' : '#666'} strokeWidth="1.8" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  },
  {
    id: 'historico',
    label: 'Histórico',
    icon: (on) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? '#5A9E6F' : '#666'} strokeWidth="1.8" strokeLinecap="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="14" y2="18" />
      </svg>
    )
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: (on) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? '#5A9E6F' : '#666'} strokeWidth="1.8" strokeLinecap="round">
        <line x1="4" y1="20" x2="4" y2="10" />
        <line x1="9" y1="20" x2="9" y2="4" />
        <line x1="14" y1="20" x2="14" y2="14" />
        <line x1="19" y1="20" x2="19" y2="8" />
      </svg>
    )
  }
]

export default function BottomNav({ screen, onChange }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#111', borderTop: '1px solid #1E1E1E',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 100
    }}>
      {TABS.map(tab => {
        const active = screen === tab.id
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '10px 0', background: 'none', border: 'none',
            color: active ? '#5A9E6F' : '#666', fontSize: 10, cursor: 'pointer',
            transition: 'color 0.15s'
          }}>
            {tab.icon(active)}
            <span style={{ fontWeight: active ? 600 : 400 }}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
