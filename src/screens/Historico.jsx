import { useState } from 'react'

const TIPOS = ['Todos', 'Receitas', 'Despesas']
const CATEGORIAS = ['Todas', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Moradia', 'Educação', 'Vestuário', 'Outros']

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

function FilterChips({ options, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
      {options.map(opt => {
        const on = active === opt
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            background: on ? '#2A2A2A' : 'transparent',
            border: `1px solid ${on ? '#5A9E6F' : '#2A2A2A'}`,
            color: on ? '#5A9E6F' : '#666',
            borderRadius: 20, padding: '5px 13px',
            fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer',
            flexShrink: 0
          }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

export default function Historico({ data, loading, error, onEdit }) {
  const [tipo, setTipo] = useState('Todos')
  const [categoria, setCategoria] = useState('Todas')

  if (loading) return <SkeletonList />
  if (error) return <ErrorMsg msg={error} />
  if (!data) return null

  const filtradas = data.transactions.filter(t => {
    if (tipo === 'Receitas' && t.valor <= 0) return false
    if (tipo === 'Despesas' && t.valor >= 0) return false
    if (categoria !== 'Todas' && t.categoria !== categoria) return false
    return true
  })

  return (
    <div style={{ padding: '14px 14px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <FilterChips options={TIPOS} active={tipo} onChange={setTipo} />
        <FilterChips options={CATEGORIAS} active={categoria} onChange={setCategoria} />
      </div>

      {filtradas.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#444', padding: 48, fontSize: 14 }}>
          Nenhuma transação encontrada
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtradas.map(t => {
            const isReceita = t.valor > 0
            return (
              <div key={t.id} onClick={() => onEdit(t)} style={{
                background: '#1A1A1A', borderRadius: 14,
                padding: '13px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 12, cursor: 'pointer', activeOpacity: 0.7
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.descricao}
                  </div>
                  <div style={{ fontSize: 11, color: '#555' }}>
                    {t.categoria} · {formatDate(t.data)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isReceita ? '#5A9E6F' : '#E07B54' }}>
                    {isReceita ? '+' : '-'}${Math.abs(t.valor).toFixed(2)}
                  </div>
                  <span style={{ color: '#333', fontSize: 16 }}>›</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SkeletonList() {
  return (
    <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: 64 }} />
      ))}
    </div>
  )
}

function ErrorMsg({ msg }) {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <div style={{ color: '#E07B54', fontSize: 14, marginBottom: 8 }}>Erro ao carregar dados</div>
      <div style={{ color: '#555', fontSize: 12 }}>{msg}</div>
    </div>
  )
}
