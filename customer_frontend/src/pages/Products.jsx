import { useState, useEffect } from 'react'
import API from '../api/axios'
import ProductCard from '../components/ProductCard'

const TABS = [
  { key: 'all', label: 'Tat ca' },
  { key: 'laptop', label: 'Laptops' },
  { key: 'clothes', label: 'Quan ao' },
]

export default function Products() {
  const [tab, setTab] = useState('all')
  const [laptops, setLaptops] = useState([])
  const [clothes, setClothes] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [search])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const params = search ? { search } : {}
      const [lapRes, cloRes] = await Promise.all([
        API.get('/laptops/', { params }),
        API.get('/clothes/', { params }),
      ])
      setLaptops(lapRes.data.results || lapRes.data)
      setClothes(cloRes.data.results || cloRes.data)
    } catch {}
    setLoading(false)
  }

  const filtered = () => {
    const lap = (tab === 'all' || tab === 'laptop') ? laptops.map(p => ({ ...p, _type: 'laptop' })) : []
    const clo = (tab === 'all' || tab === 'clothes') ? clothes.map(p => ({ ...p, _type: 'clothes' })) : []
    return [...lap, ...clo]
  }

  return (
    <div>
      <h1 className="page-title">San pham</h1>

      <div style={styles.toolbar}>
        <div style={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          placeholder="Tim kiem san pham..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />
      </div>

      {loading ? (
        <div className="loading">Dang tai...</div>
      ) : filtered().length === 0 ? (
        <div className="empty">Khong tim thay san pham</div>
      ) : (
        <div className="grid grid-3">
          {filtered().map((p) => (
            <ProductCard key={`${p._type}-${p.id}`} product={p} type={p._type} />
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  tabs: {
    display: 'flex',
    gap: 8,
  },
  search: {
    padding: '8px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: 14,
    width: 260,
  },
}
