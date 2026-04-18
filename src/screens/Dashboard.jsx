import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const CAT_COLORS = {
  'Alimentação': '#E07B54',
  'Transporte': '#6B9FD4',
  'Saúde': '#7BD4C5',
  'Lazer': '#C57BDB',
  'Moradia': '#D4B86A',
  'Educação': '#5A9E6F',
  'Vestuário': '#D47B8F',
  'Outros': '#777',
}

function Card({ label, value, color, signed }) {
  const abs = Math.abs(value)
  const prefix = signed ? (value >= 0 ? '+' : '-') : (value < 0 ? '-' : '')
  return (
    <div style={{ background: '#1A1A1A', borderRadius: 16, padding: '16px 18px' }}>
      <div style={{ color: '#555', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || '#F0F0F0' }}>
        {prefix}${abs.toFixed(2)}
      </div>
    </div>
  )
}

function SparkBars({ transactions, mes }) {
  const [ano, mesNum] = mes.split('-').map(Number)
  const daysInMonth = new Date(ano, mesNum, 0).getDate()

  const byDay = {}
  transactions.forEach(t => {
    if (t.data) {
      const day = parseInt(t.data.slice(8, 10))
      byDay[day] = (byDay[day] || 0) + Math.abs(t.valor)
    }
  })

  const vals = Object.values(byDay)
  const max = Math.max(...vals, 1)

  return (
    <>
      <div style={{ color: '#555', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
        Atividade do mês
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: 44, gap: 2 }}>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const val = byDay[i + 1] || 0
          return (
            <div key={i} style={{
              flex: 1,
              height: val ? `${Math.max((val / max) * 100, 12)}%` : '6%',
              background: val ? '#5A9E6F' : '#1E1E1E',
              borderRadius: 2,
              transition: 'height 0.3s'
            }} />
          )
        })}
      </div>
    </>
  )
}

export default function Dashboard({ data, loading, error, mes }) {
  if (loading) return <SkeletonDashboard />
  if (error) return <ErrorMsg msg={error} />
  if (!data) return null

  const { transactions, totalReceitas, totalDespesas, saldo, porCategoria } = data

  const donutData = Object.entries(porCategoria)
    .filter(([, v]) => v < 0)
    .map(([name, value]) => ({ name, value: Math.abs(value) }))
    .sort((a, b) => b.value - a.value)

  return (
    <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Card label="Saldo" value={saldo} color={saldo >= 0 ? '#5A9E6F' : '#E07B54'} signed />
        </div>
        <Card label="Receitas" value={totalReceitas} color="#5A9E6F" />
        <Card label="Despesas" value={Math.abs(totalDespesas)} color="#E07B54" />
      </div>

      {donutData.length > 0 ? (
        <div style={{ background: '#1A1A1A', borderRadius: 16, padding: 16 }}>
          <div style={{ color: '#555', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            Despesas por categoria
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                startAngle={90} endAngle={-270}
              >
                {donutData.map(entry => (
                  <Cell key={entry.name} fill={CAT_COLORS[entry.name] || '#777'} />
                ))}
              </Pie>
              <Tooltip
                formatter={v => [`$${v.toFixed(2)}`, '']}
                contentStyle={{ background: '#222', border: '1px solid #2A2A2A', borderRadius: 10, color: '#F0F0F0', fontSize: 13 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 4 }}>
            {donutData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[d.name] || '#777', flexShrink: 0 }} />
                <span style={{ color: '#888' }}>{d.name}</span>
                <span style={{ color: '#F0F0F0', fontWeight: 600 }}>${d.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: '#1A1A1A', borderRadius: 16, padding: 24, textAlign: 'center', color: '#444', fontSize: 14 }}>
          Sem despesas registradas
        </div>
      )}

      <div style={{ background: '#1A1A1A', borderRadius: 16, padding: 16 }}>
        <SparkBars transactions={transactions} mes={mes} />
      </div>
    </div>
  )
}

function SkeletonDashboard() {
  return (
    <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="skeleton" style={{ gridColumn: '1 / -1', height: 76 }} />
        <div className="skeleton" style={{ height: 76 }} />
        <div className="skeleton" style={{ height: 76 }} />
      </div>
      <div className="skeleton" style={{ height: 250 }} />
      <div className="skeleton" style={{ height: 90 }} />
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
