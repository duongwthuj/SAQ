import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API from '../api/axios'

export default function Laptops() {
  const [laptops, setLaptops] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    API.get('/laptops/')
      .then((res) => setLaptops(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    if (!confirm('Xoa laptop nay?')) return
    try {
      await API.delete(`/laptops/${id}/`)
      load()
    } catch {}
  }

  if (loading) return <div className="loading">Dang tai...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Quan ly Laptops</h1>
        <Link to="/laptops/new" className="btn btn-primary">+ Them laptop</Link>
      </div>

      {laptops.length === 0 ? (
        <div className="empty">Chua co laptop nao</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ten</th>
                <th>Hang</th>
                <th>Gia</th>
                <th>Ton kho</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {laptops.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td style={{ fontWeight: 600 }}>{l.name}</td>
                  <td>{l.brand}</td>
                  <td>{Number(l.price).toLocaleString('vi-VN')}</td>
                  <td>{l.inventory?.quantity ?? '—'}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <Link to={`/laptops/${l.id}/edit`} className="btn btn-outline btn-sm">Sua</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(l.id)}>Xoa</button>
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
