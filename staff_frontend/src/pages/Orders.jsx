import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/orders/')
      .then((res) => setOrders(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Dang tai...</div>

  return (
    <div>
      <h1 className="page-title">Quan ly Don hang</h1>
      {orders.length === 0 ? (
        <div className="empty">Chua co don hang nao</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer ID</th>
                <th>Trang thai</th>
                <th>Tong tien</th>
                <th>Ngay tao</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customer_id}</td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  <td style={{ fontWeight: 600 }}>{Number(o.total_amount).toLocaleString('vi-VN')}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
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
