import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/orders/', { params: { customer_id: user.id } })
      .then((res) => setOrders(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Dang tai...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 className="page-title">Don hang cua toi</h1>
      {orders.length === 0 ? (
        <div className="empty">
          <p>Chua co don hang nao</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Mua sam ngay</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Trang thai</th>
                <th>Tong tien</th>
                <th>Ngay tao</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  <td style={{ fontWeight: 600 }}>{Number(o.total_amount).toLocaleString('vi-VN')} VND</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {new Date(o.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <Link to={`/orders/${o.id}`} className="btn btn-outline btn-sm">Chi tiet</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
