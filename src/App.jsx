import { useState } from 'react'
import Dashboard from './screens/Dashboard.jsx'
import Historico from './screens/Historico.jsx'
import Relatorios from './screens/Relatorios.jsx'
import Setup from './screens/Setup.jsx'
import BottomNav from './components/BottomNav.jsx'
import TransacaoModal from './components/TransacaoModal.jsx'
import useDados from './hooks/useDados.js'
import usePullToRefresh from './hooks/usePullToRefresh.js'

const MES_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function getCurrentMes() {
  return new Date().toISOString().slice(0, 7)
}

function shiftMes(mes, delta) {
  let [y, m] = mes.split('-').map(Number)
  m += delta
  if (m > 12) { m = 1; y++ }
  if (m < 1) { m = 12; y-- }
  return `${y}-${String(m).padStart(2, '0')}`
}

function formatMesLabel(mes) {
  const [y, m] = mes.split('-')
  return `${MES_LABELS[parseInt(m) - 1]} ${y}`
}

export default function App() {
  const [screen, setScreen] = useState('dashboard')
  const [mes, setMes] = useState(getCurrentMes)
  const [token, setToken] = useState(() => localStorage.getItem('notion_token') || '')
  const [modal, setModal] = useState(null) // null | { transaction?: object }

  const { data, loading, error, refresh } = useDados(mes, token)
  const { containerRef, indicatorRef } = usePullToRefresh(refresh)

  if (!token) {
    return <Setup onSave={t => { localStorage.setItem('notion_token', t); setToken(t) }} />
  }

  const canGoNext = mes < getCurrentMes()

  function openAdd() { setModal({}) }
  function openEdit(t) { setModal({ transaction: t }) }
  function closeModal() { setModal(null) }
  function handleSaved() { closeModal(); refresh() }

  const screenProps = { data, loading, error, mes, token, onEdit: openEdit }

  return (
    <div style={{ background: '#0F0F0F', minHeight: '100dvh', color: '#F0F0F0' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 8px 10px',
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(15,15,15,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #1A1A1A'
      }}>
        <NavBtn onClick={() => setMes(m => shiftMes(m, -1))}>‹</NavBtn>
        <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: 0.3 }}>{formatMesLabel(mes)}</span>
        <NavBtn onClick={() => setMes(m => shiftMes(m, 1))} disabled={!canGoNext}>›</NavBtn>
      </header>

      <main ref={containerRef} style={{ paddingBottom: 72, overflowY: 'auto', height: 'calc(100dvh - 53px)', position: 'relative', overscrollBehaviorY: 'contain' }}>
        <div ref={indicatorRef} style={{
          position: 'absolute', top: 10, left: '50%',
          transform: 'translateX(-50%) translateY(0)',
          opacity: 0, pointerEvents: 'none',
          background: '#1A1A1A', borderRadius: 20, padding: '5px 14px',
          fontSize: 12, color: '#5A9E6F', whiteSpace: 'nowrap', zIndex: 5,
          border: '1px solid #2A2A2A'
        }}>
          ↓ Puxe para atualizar
        </div>

        {screen === 'dashboard'  && <Dashboard  {...screenProps} />}
        {screen === 'historico'  && <Historico  {...screenProps} />}
        {screen === 'relatorios' && <Relatorios {...screenProps} />}
      </main>

      {/* FAB */}
      <button onClick={openAdd} style={{
        position: 'fixed', bottom: 84, right: 18, zIndex: 50,
        width: 52, height: 52, borderRadius: '50%',
        background: '#5A9E6F', border: 'none', color: '#fff',
        fontSize: 26, lineHeight: 1, cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(90,158,111,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        +
      </button>

      <BottomNav screen={screen} onChange={setScreen} />

      {modal !== null && (
        <TransacaoModal
          token={token}
          transaction={modal.transaction}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

function NavBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: 'none', border: 'none', color: disabled ? '#333' : '#888',
      fontSize: 26, lineHeight: 1, cursor: disabled ? 'default' : 'pointer',
      padding: '0 12px', userSelect: 'none'
    }}>
      {children}
    </button>
  )
}
