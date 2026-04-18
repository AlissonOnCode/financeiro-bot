import { useState } from 'react'

export default function Setup({ onSave }) {
  const [token, setToken] = useState('')

  return (
    <div style={{
      background: '#0F0F0F', minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        width: 64, height: 64, background: '#1A1A1A', borderRadius: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, marginBottom: 24
      }}>
        💰
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Financeiro Bot</h1>
      <p style={{ color: '#666', fontSize: 13, marginBottom: 36, textAlign: 'center', lineHeight: 1.5 }}>
        Insira seu Notion Integration Token<br />para acessar seus dados
      </p>

      <input
        value={token}
        onChange={e => setToken(e.target.value)}
        placeholder="ntn_..."
        autoComplete="off"
        spellCheck={false}
        style={{
          width: '100%', maxWidth: 360,
          background: '#1A1A1A', border: '1px solid #2A2A2A',
          color: '#F0F0F0', borderRadius: 12,
          padding: '14px 16px', fontSize: 14, outline: 'none', marginBottom: 12
        }}
      />

      <button
        onClick={() => token.trim() && onSave(token.trim())}
        disabled={!token.trim()}
        style={{
          width: '100%', maxWidth: 360,
          background: token.trim() ? '#5A9E6F' : '#1A1A1A',
          border: 'none', color: token.trim() ? '#fff' : '#444',
          borderRadius: 12, padding: 14, fontSize: 15,
          fontWeight: 600, cursor: token.trim() ? 'pointer' : 'default',
          transition: 'background 0.2s'
        }}
      >
        Entrar
      </button>
    </div>
  )
}
