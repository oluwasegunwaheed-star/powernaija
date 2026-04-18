import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function DashboardShell({ profile, title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 960
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(false)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const roleLabel = useMemo(
    () => formatLabel(profile?.role || 'user'),
    [profile?.role]
  )

  const statusLabel = useMemo(
    () => formatLabel(profile?.onboarding_status || 'draft'),
    [profile?.onboarding_status]
  )

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await supabase.auth.signOut()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div style={page}>
      <div style={bgGlowOne} />
      <div style={bgGlowTwo} />

      {isMobile && sidebarOpen ? (
        <div
          style={overlay}
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        style={{
          ...sidebar,
          transform:
            isMobile && !sidebarOpen ? 'translateX(-110%)' : 'translateX(0)',
          boxShadow:
            isMobile && sidebarOpen
              ? '0 30px 80px rgba(15, 23, 42, 0.24)'
              : sidebar.boxShadow
        }}
      >
        <div style={brandRow}>
          <div style={brandMark}>⚡</div>
          <div>
            <div style={brandTitle}>PowerNaija</div>
            <div style={brandSubtitle}>Solar finance workflow</div>
          </div>

          {isMobile ? (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              style={iconBtn}
            >
              ✕
            </button>
          ) : null}
        </div>

        <div style={profileCard}>
          <div style={smallLabel}>Current role</div>
          <div style={bigValue}>{roleLabel}</div>
          <div style={profileMeta}>{profile?.email || 'No email'}</div>
        </div>

        <div style={statusCard}>
          <div style={smallLabel}>Onboarding status</div>
          <div style={bigValue}>{statusLabel}</div>
          <div style={statusPill(profile?.onboarding_status)}>{statusLabel}</div>
        </div>

        <div style={sideSection}>
          <div style={sideSectionTitle}>Workspace</div>
          <div style={miniCard}>
            <div style={miniCardTitle}>Account</div>
            <div style={miniCardText}>
              Signed in as <strong>{profile?.email || '-'}</strong>
            </div>
          </div>
          <div style={miniCard}>
            <div style={miniCardTitle}>Mode</div>
            <div style={miniCardText}>
              Dashboard content adapts to your role and approval status.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            style={logoutBtn}
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>

      <main
        style={{
          ...main,
          marginLeft: isMobile ? 0 : 320
        }}
      >
        <div style={topBar}>
          <div style={topBarLeft}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              style={menuBtn}
            >
              ☰
            </button>

            <div>
              <div style={pageTitle}>{title}</div>
              <div style={pageSubtitle}>
                Modern operations workspace for onboarding, approvals and delivery
              </div>
            </div>
          </div>

          <div style={topBarRight}>
            <div style={headerBadge(profile?.role)}>{roleLabel}</div>
          </div>
        </div>

        <div style={contentWrap}>{children}</div>
      </main>
    </div>
  )
}

function formatLabel(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function headerBadge(role) {
  const text = String(role || '').toLowerCase()
  let background = 'rgba(37, 99, 235, 0.1)'
  let color = '#1d4ed8'

  if (text === 'installer') {
    background = 'rgba(217, 119, 6, 0.12)'
    color = '#b45309'
  } else if (text === 'bank') {
    background = 'rgba(14, 165, 233, 0.12)'
    color = '#0369a1'
  } else if (text === 'admin') {
    background = 'rgba(139, 92, 246, 0.12)'
    color = '#6d28d9'
  } else if (text === 'user') {
    background = 'rgba(16, 185, 129, 0.12)'
    color = '#047857'
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 14px',
    borderRadius: 999,
    background,
    color,
    fontWeight: 700,
    fontSize: 13
  }
}

function statusPill(status) {
  const text = String(status || '').toLowerCase()
  let background = '#fef3c7'
  let color = '#92400e'

  if (text === 'approved') {
    background = '#dcfce7'
    color = '#166534'
  } else if (text === 'rejected') {
    background = '#fee2e2'
    color = '#991b1b'
  } else if (text === 'draft') {
    background = '#e5e7eb'
    color = '#334155'
  }

  return {
    display: 'inline-flex',
    marginTop: 12,
    padding: '7px 10px',
    borderRadius: 999,
    background,
    color,
    fontWeight: 700,
    fontSize: 12
  }
}

const page = {
  minHeight: '100vh',
  background:
    'linear-gradient(180deg, #f8fafc 0%, #eef2ff 45%, #f8fafc 100%)',
  position: 'relative',
  overflow: 'hidden'
}

const bgGlowOne = {
  position: 'fixed',
  top: -100,
  right: -60,
  width: 320,
  height: 320,
  borderRadius: '50%',
  background: 'rgba(59, 130, 246, 0.12)',
  filter: 'blur(70px)',
  pointerEvents: 'none'
}

const bgGlowTwo = {
  position: 'fixed',
  bottom: -120,
  left: -80,
  width: 340,
  height: 340,
  borderRadius: '50%',
  background: 'rgba(168, 85, 247, 0.10)',
  filter: 'blur(80px)',
  pointerEvents: 'none'
}

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  zIndex: 30
}

const sidebar = {
  position: 'fixed',
  top: 20,
  left: 20,
  bottom: 20,
  width: 300,
  zIndex: 40,
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(18px)',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  borderRadius: 28,
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.10)'
}

const brandRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 14
}

const brandMark = {
  width: 44,
  height: 44,
  borderRadius: 14,
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  color: '#fff',
  fontSize: 20,
  boxShadow: '0 12px 24px rgba(37, 99, 235, 0.25)'
}

const brandTitle = {
  fontSize: 17,
  fontWeight: 800,
  color: '#0f172a'
}

const brandSubtitle = {
  fontSize: 12,
  color: '#64748b',
  marginTop: 2
}

const iconBtn = {
  marginLeft: 'auto',
  width: 42,
  height: 42,
  borderRadius: 14,
  border: '1px solid #e2e8f0',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 16
}

const profileCard = {
  borderRadius: 22,
  padding: 18,
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid #e2e8f0'
}

const statusCard = {
  borderRadius: 22,
  padding: 18,
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid #e2e8f0'
}

const smallLabel = {
  fontSize: 13,
  color: '#64748b',
  marginBottom: 8
}

const bigValue = {
  fontSize: 20,
  fontWeight: 800,
  color: '#0f172a'
}

const profileMeta = {
  marginTop: 8,
  fontSize: 13,
  color: '#475569',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word'
}

const sideSection = {
  display: 'grid',
  gap: 12
}

const sideSectionTitle = {
  fontSize: 13,
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: 0.6
}

const miniCard = {
  borderRadius: 18,
  padding: 16,
  border: '1px solid #e2e8f0',
  background: '#ffffff'
}

const miniCardTitle = {
  fontSize: 13,
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: 6
}

const miniCardText = {
  fontSize: 13,
  color: '#64748b',
  lineHeight: 1.5,
  overflowWrap: 'anywhere'
}

const logoutBtn = {
  width: '100%',
  border: 'none',
  borderRadius: 16,
  padding: '14px 16px',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: '#fff',
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 16px 30px rgba(37, 99, 235, 0.22)'
}

const main = {
  minHeight: '100vh',
  padding: '20px 20px 32px 20px',
  transition: 'margin-left 0.25s ease'
}

const topBar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  marginBottom: 22,
  padding: '14px 16px',
  borderRadius: 24,
  background: 'rgba(255,255,255,0.72)',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  backdropFilter: 'blur(16px)'
}

const topBarLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  minWidth: 0
}

const topBarRight = {
  display: 'flex',
  alignItems: 'center',
  gap: 10
}

const menuBtn = {
  width: 46,
  height: 46,
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 18
}

const pageTitle = {
  fontSize: 28,
  fontWeight: 900,
  color: '#0f172a',
  lineHeight: 1.15
}

const pageSubtitle = {
  fontSize: 13,
  color: '#64748b',
  marginTop: 4,
  lineHeight: 1.4
}

const contentWrap = {
  display: 'grid',
  gap: 18
}