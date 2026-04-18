import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const MES_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function shiftMes(mes, delta) {
  let [y, m] = mes.split('-').map(Number)
  m += delta
  if (m > 12) { m = 1; y++ }
  if (m < 1) { m = 12; y-- }
  return `${y}-${String(m).padStart(2, '0')}`
}

function labelMes(mes) {
  const [, m] = mes.split('-')
  return MES_LABELS[parseInt(m) - 1]
}

export default function Relatorios({ data, loading, error, mes, token }) {
  const [historico, setHistorico] = useState([])
  const [loadingHist, setLoadingHist] = useState(true)

  useEffect(() => {
    if (!token) return
    setLoadingHist(true)
    const meses = [shiftMes(mes, -3), shiftMes(mes, -2), shiftMes(mes, -1), mes]

    Promise.all(
      meses.map(m =>
        fetch(`/api/dados?mes=${m}&notion_token=${encodeURIComponent(token)}`)
          .then(r => r.json())
          .then(d => ({ mes: m, totalReceitas: d.totalReceitas || 0, totalDespesas: d.totalDespesas || 0 }))
          .catch(() => ({ mes: m, totalReceitas: 0, totalDespesas: 0 }))
      )
    ).then(results => {
      setHistorico(results)
      setLoadingHist(false)
    })
  }, [mes, token])

  if (loading || loadingHist) return <SkeletonRelatorios />
  if (error) return <ErrorMsg msg={error} />

  const chartData = historico.map(h => ({
    name: labelMes(h.mes),
    Receitas: parseFloat(h.totalReceitas.toFixed(2)),
    Despesas: parseFloat(Math.abs(h.totalDespesas).toFixed(2)),
  }))

  const topDespesas = (data?.transactions || [])
    .filter(t => t.valor < 0)
    .sort((a, b) => a.valor - b.valor)
    .slice(0, 5)

  const maxTop = topDespesas[0] ? Math.abs(topDespesas[0].valor) : 1

  return (
    <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: '#1A1A1A', borderRadius: 16, padding: 16 }}>
        <div style={{ color: '#555', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
          Comparativo mensal
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -18, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#222', border: '1px solid #2A2A2A', borderRadius: 10, color: '#F0F0F0', fontSize: 13 }}
              formatter={v => [`$${v.toFixed(2)}`, '']}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#666', paddingTop: 12 }} />
            <Bar dataKey="Receitas" fill="#5A9E6F" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Despesas" fill="#E07B54" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#1A1A1A', borderRadius: 16, padding: 16 }}>
        <div style={{ color: '#555', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
          Maiores despesas do mês
        </div>
        {topDespesas.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#444', padding: 20, fontSize: 14 }}>
            Sem despesas registradas
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topDespesas.map((t, i) => {
              const pct = (Math.abs(t.valor) / maxTop) * 100
              return (
                <div key={t.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#DDD', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                      {t.descricao}
                    </span>
                    <span style={{ color: '#E07B54', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      ${Math.abs(t.valor).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ background: '#2A2A2A', borderRadius: 4, height: 4 }}>
                    <div style={{
                      background: '#E07B54', height: '100%', borderRadius: 4,
                      width: `${pct}%`,
                      opacity: 1 - i * 0.12,
                      transition: 'width 0.5s'
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonRelatorios() {
  return (
    <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 260 }} />
      <div className="skeleton" style={{ height: 200 }} />
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
