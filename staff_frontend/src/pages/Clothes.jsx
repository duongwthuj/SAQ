import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

export default function Clothes() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    API.get('/clothes/')
      .then((res) => setItems(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    if (!confirm('Xoa san pham nay?')) return
    try {
      await API.delete(`/clothes/${id}/`)
      load()
    } catch {}
  }

  if (loading) return <div className="loading">Dang tai...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Quan ly Quan ao</h1>
        <Link to="/clothes/new" className="btn btn-primary">+ Them</Link>
      </div>

      {items.length === 0 ? (
        <div className="empty">Chua co san pham nao</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ten</th>
                <th>Hang</th>
                <th>Gia</th>
                <th>Size</th>
                <th>Ton kho</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.brand}</td>
                  <td>{Number(c.price).toLocaleString('vi-VN')}</td>
                  <td>{c.size || '—'}</td>
                  <td>{c.inventory?.quantity ?? '—'}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <Link to={`/clothes/${c.id}/edit`} className="btn btn-outline btn-sm">Sua</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Xoa</button>
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
