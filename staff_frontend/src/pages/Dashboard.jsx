import { useState, useEffect } from 'react'
import API from '../api/axios'

export default function Dashboard() {
  const [stats, setStats] = useState({ laptops: 0, clothes: 0, orders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      API.get('/laptops/').catch(() => ({ data: { count: 0, results: [] } })),
      API.get('/clothes/').catch(() => ({ data: { count: 0, results: [] } })),
      API.get('/orders/').catch(() => ({ data: { count: 0, results: [] } })),
    ]).then(([lap, clo, ord]) => {
      setStats({
        laptops: lap.data.count ?? (lap.data.results || lap.data).length,
        clothes: clo.data.count ?? (clo.data.results || clo.data).length,
        orders: ord.data.count ?? (ord.data.results || ord.data).length,
      })
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading">Dang tai...</div>

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <div className="card stat-card">
          <div className="stat-value">{stats.laptops}</div>
          <div className="stat-label">Laptops</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{stats.clothes}</div>
          <div className="stat-label">Quan ao</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{stats.orders}</div>
          <div className="stat-label">Don hang</div>
        </div>
      </div>
    </div>
  )
}
