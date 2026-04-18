import { useState, useEffect, useCallback } from 'react'

export default function useDados(mes, token) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!mes || !token) return
    setLoading(true)
    setError(null)

    fetch(`/api/dados?mes=${mes}&notion_token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [mes, token, refreshKey])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  return { data, loading, error, refresh }
}
