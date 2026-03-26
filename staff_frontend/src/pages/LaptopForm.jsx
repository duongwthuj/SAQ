import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/axios'

export default function LaptopForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    name: '', brand: '', price: '', description: '', category: '', specs: '{}',
  })
  const [inventory, setInventory] = useState('')
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    API.get('/laptops/categories/').then((res) => setCategories(res.data.results || res.data)).catch(() => {})
    if (isEdit) {
      API.get(`/laptops/${id}/`).then((res) => {
        const d = res.data
        setForm({
          name: d.name,
          brand: d.brand || '',
          price: d.price,
          description: d.description || '',
          category: d.category || '',
          specs: d.specs ? JSON.stringify(d.specs) : '{}',
        })
        setInventory(d.inventory?.quantity ?? '')
      }).catch(() => {})
    }
  }, [id])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    let specs = {}
    try { specs = JSON.parse(form.specs) } catch { setError('Specs khong phai JSON hop le'); setSaving(false); return }

    const payload = { ...form, specs, price: form.price }
    if (form.category) payload.category = Number(form.category)
    else delete payload.category

    try {
      let laptopId = id
      if (isEdit) {
        await API.put(`/laptops/${id}/`, payload)
      } else {
        const { data } = await API.post('/laptops/', payload)
        laptopId = data.id
      }

      if (inventory !== '' && inventory !== null) {
        try {
          await API.get(`/laptops/inventory/${laptopId}/`)
        } catch {
          await API.post('/laptops/inventory/', { laptop_id: laptopId, quantity: Number(inventory) })
        }
      }

      navigate('/laptops')
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'object' ? JSON.stringify(d) : 'Loi luu')
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 className="page-title">{isEdit ? 'Sua laptop' : 'Them laptop moi'}</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group"><label>Ten</label><input value={form.name} onChange={set('name')} required /></div>
        <div className="form-group"><label>Hang</label><input value={form.brand} onChange={set('brand')} /></div>
        <div className="form-group"><label>Gia</label><input type="number" step="0.01" value={form.price} onChange={set('price')} required /></div>
        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={set('category')}>
            <option value="">-- Chon --</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Mo ta</label><textarea rows={3} value={form.description} onChange={set('description')} /></div>
        <div className="form-group"><label>Specs (JSON)</label><textarea rows={3} value={form.specs} onChange={set('specs')} /></div>
        <div className="form-group"><label>Ton kho</label><input type="number" value={inventory} onChange={(e) => setInventory(e.target.value)} placeholder="So luong" /></div>
        {error && <p className="error-msg">{error}</p>}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Dang luu...' : 'Luu'}</button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/laptops')}>Huy</button>
        </div>
      </form>
    </div>
  )
}
