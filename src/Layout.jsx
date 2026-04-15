import { useState, useEffect } from 'react'
import { Home, User, Building, Shield, Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from './lib/supabaseClient'

function Layout({ role, page, setPage, children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreen()
    window.addEventListener('resize', checkScreen)

    return () => window.removeEventListener('resize', checkScreen)
  }, [])

  const menu = [
    { key: 'user', label: 'User', icon: <Home size={18} /> },
    { key: 'installer', label: 'Installer', icon: <User size={18} /> },
    { key: 'bank', label: 'Bank', icon: <Building size={18} /> },
    { key: 'admin', label: 'Admin', icon: <Shield size={18} /> },
  ]

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div style={styles.wrapper}>
      {/* SIDEBAR */}
      <div
        style={{
          ...styles.sidebar,
          width: collapsed ? '70px' : '230px',
          left: isMobile ? (mobileOpen ? 0 : '-100%') : 0, // 🔥 FIX HERE
        }}
      >
        <h2 style={styles.logo}>
          {collapsed ? '⚡' : '⚡ PowerNaija'}
        </h2>

        {menu.map((item) => (
          <motion.button
            key={item.key}
            whileHover={{ scale: 1.05 }}
            style={{
              ...styles.navBtn,
              background:
                page === item.key ? '#2563EB' : '#F3F4F6',
              color: page === item.key ? '#fff' : '#000',
            }}
            onClick={() => {
              setPage(item.key)
              setMobileOpen(false)
            }}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </motion.button>
        ))}

        <button
          style={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '➡️' : '⬅️'}
        </button>
      </div>

      {/* MAIN */}
      <div
        style={{
          ...styles.main,
          marginLeft: isMobile ? 0 : collapsed ? '70px' : '230px',
        }}
      >
        <div style={styles.topbar}>
          <button
            style={styles.menuBtn}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu size={20} />
          </button>

          <span>Role: {role}</span>

          <button style={styles.logout} onClick={logout}>
            Logout
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.content}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    height: '100vh',
    background: '#F9FAFB',
  },

  sidebar: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    background: '#fff',
    padding: '20px',
    borderRight: '1px solid #e5e7eb',
    transition: '0.3s',
    zIndex: 1000,
  },

  logo: {
    marginBottom: '20px',
    color: '#2563EB',
  },

  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '8px',
  },

  collapseBtn: {
    marginTop: 'auto',
    padding: '8px',
    border: 'none',
    cursor: 'pointer',
    background: '#ddd',
    borderRadius: '6px',
  },

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },

  topbar: {
    height: '60px',
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    borderBottom: '1px solid #e5e7eb',
  },

  menuBtn: {
    display: 'block',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },

  logout: {
    background: '#EF4444',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
  },

  content: {
    padding: '20px',
    overflowY: 'auto',
  },
}

export default Layout