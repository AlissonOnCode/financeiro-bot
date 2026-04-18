import { useState, useEffect } from 'react'

const CATEGORIAS = ['Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Moradia', 'Educação', 'Vestuário', 'Outros']

function hoje() {
  return new Date().toISOString().split('T')[0]
}

export default function TransacaoModal({ token, transaction, onClose, onSaved }) {
  const editing = !!transaction

  const [tipo, setTipo] = useState('despesa')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('Alimentação')
  const [data, setData] = useState(hoje())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (transaction) {
      setTipo(transaction.valor < 0 ? 'despesa' : 'receita')
      setValor(String(Math.abs(transaction.valor)))
      setDescricao(transaction.descricao)
      setCategoria(transaction.categoria || 'Outros')
      setData(transaction.data || hoje())
    }
  }, [transaction])

  async function handleSave() {
    if (!valor || !descricao) return
    setSaving(true)
    setError(null)
    const valorFinal = tipo === 'despesa' ? -Math.abs(parseFloat(valor)) : Math.abs(parseFloat(valor))

    try {
      const body = { notion_token: token, descricao, valor: valorFinal, categoria, data }
      if (editing) body.id = transaction.id

      const r = await fetch('/api/transacao', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Excluir esta transação?')) return
    setDeleting(true)
    setError(null)
    try {
      const r = await fetch(`/api/transacao?id=${transaction.id}&notion_token=${encodeURIComponent(token)}`, { method: 'DELETE' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const canSave = valor && parseFloat(valor) > 0 && descricao.trim()

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 200, backdropFilter: 'blur(3px)'
      }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: '#141414', borderRadius: '20px 20px 0 0',
        padding: '0 16px 32px',
        maxHeight: '92dvh', overflowY: 'auto',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 16px' }}>
          <div style={{ width: 36, height: 4, background: '#2A2A2A', borderRadius: 2 }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{editing ? 'Editar transação' : 'Nova transação'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 22, cursor: 'pointer', padding: 4 }}>×</button>
        </div>

        {/* Tipo toggle */}
        <div style={{ display: 'flex', background: '#1A1A1A', borderRadius: 12, padding: 3, marginBottom: 20 }}>
          {['despesa', 'receita'].map(t => (
            <button key={t} onClick={() => setTipo(t)} style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, cursor: 'pointer',
              background: tipo === t ? (t === 'despesa' ? '#E07B54' : '#5A9E6F') : 'transparent',
              color: tipo === t ? '#fff' : '#555',
              fontWeight: 600, fontSize: 14, transition: 'all 0.15s'
            }}>
              {t === 'despesa' ? 'Despesa' : 'Receita'}
            </button>
          ))}
        </div>

        {/* Valor */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Valor (USD)</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: 16 }}>$</span>
            <input
              type="number" inputMode="decimal" min="0" step="0.01"
              value={valor} onChange={e => setValor(e.target.value)}
              placeholder="0.00"
              style={{ ...inputStyle, paddingLeft: 28 }}
            />
          </div>
        </div>

        {/* Descrição */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Descrição</label>
          <input
            type="text" value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Ex: Mercado, Uber..."
            style={inputStyle}
          />
        </div>

        {/* Categoria */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Categoria</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
            {CATEGORIAS.map(c => (
              <button key={c} onClick={() => setCategoria(c)} style={{
                background: categoria === c ? '#2A2A2A' : 'transparent',
                border: `1px solid ${categoria === c ? '#5A9E6F' : '#2A2A2A'}`,
                color: categoria === c ? '#5A9E6F' : '#555',
                borderRadius: 20, padding: '6px 13px', fontSize: 12, cursor: 'pointer'
              }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Data */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Data</label>
          <input
            type="date" value={data}
            onChange={e => setData(e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>

        {error && (
          <div style={{ color: '#E07B54', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{error}</div>
        )}

        <button onClick={handleSave} disabled={!canSave || saving} style={{
          width: '100%', padding: 15, border: 'none', borderRadius: 14,
          background: canSave ? '#5A9E6F' : '#1A1A1A',
          color: canSave ? '#fff' : '#333',
          fontSize: 15, fontWeight: 700, cursor: canSave ? 'pointer' : 'default',
          marginBottom: editing ? 10 : 0
        }}>
          {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar'}
        </button>

        {editing && (
          <button onClick={handleDelete} disabled={deleting} style={{
            width: '100%', padding: 14, border: '1px solid #3A1A1A', borderRadius: 14,
            background: 'transparent', color: '#E07B54',
            fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>
            {deleting ? 'Excluindo...' : 'Excluir transação'}
          </button>
        )}
      </div>
    </>
  )
}

const labelStyle = {
  display: 'block', color: '#555', fontSize: 11,
  fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6
}

const inputStyle = {
  width: '100%', background: '#1A1A1A', border: '1px solid #2A2A2A',
  color: '#F0F0F0', borderRadius: 12, padding: '13px 14px',
  fontSize: 15, outline: 'none'
}
