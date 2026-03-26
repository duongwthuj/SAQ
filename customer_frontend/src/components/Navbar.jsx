import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          SAQ Store
        </Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>San pham</Link>
          {user ? (
            <>
              <Link to="/cart" style={styles.link}>Gio hang</Link>
              <Link to="/orders" style={styles.link}>Don hang</Link>
              <Link to="/profile" style={styles.link}>{user.username}</Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Dang xuat
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Dang nhap</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Dang ky</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: '#fff',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--primary)',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  link: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text)',
    textDecoration: 'none',
  },
}
