import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import DashboardShell from '../components/DashboardShell'
import ErrorState from '../components/ErrorState'

export default function UserDashboard({ user, profile }) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadApplications()
  }, [user.id])

  const loadApplications = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('financing_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load user dashboard')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const total = applications.length
    const pending = applications.filter(
      (item) => String(item.status || '').toLowerCase() === 'pending'
    ).length
    const approved = applications.filter(
      (item) => String(item.status || '').toLowerCase() === 'approved'
    ).length
    const totalValue = applications.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    )

    return { total, pending, approved, totalValue }
  }, [applications])

  return (
    <DashboardShell profile={profile} title="User Dashboard">
      <ErrorState message={error} />

      <HeroCard
        title="Track your solar financing journey"
        subtitle="Monitor applications, approval progress and partner bank responses in one modern workspace."
      />

      <div style={statsGrid}>
        <StatCard label="Applications" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Total Value" value={formatCurrency(stats.totalValue)} />
      </div>

      <section style={sectionCard}>
        <div style={sectionHeader}>
          <div>
            <div style={sectionEyebrow}>Finance Pipeline</div>
            <h3 style={sectionTitle}>Recent Applications</h3>
          </div>
          <button type="button" onClick={loadApplications} style={secondaryBtn}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={mutedText}>Loading applications...</div>
        ) : applications.length === 0 ? (
          <EmptyPanel
            title="No applications yet"
            text="Once you submit a financing application, it will appear here with approval progress and bank details."
          />
        ) : (
          <div style={cardGrid}>
            {applications.map((item, index) => (
              <article key={item.id || `${item.request_id}-${index}`} style={glassCard}>
                <div style={rowBetween}>
                  <div>
                    <div style={cardTitle}>
                      {item.product_name ||
                        item.title ||
                        item.system_name ||
                        'Solar Financing Application'}
                    </div>
                    <div style={cardSubtle}>
                      Ref: {item.request_id || item.id || '-'}
                    </div>
                  </div>
                  <div style={statusPill(item.status)}>{formatLabel(item.status || 'pending')}</div>
                </div>

                <div style={infoGrid}>
                  <InfoItem label="Bank" value={item.bank_name || 'Awaiting allocation'} />
                  <InfoItem label="Amount" value={formatCurrency(item.amount || 0)} />
                  <InfoItem label="Installer" value={item.installer_name || item.installer_id || '-'} />
                  <InfoItem label="Created" value={formatDate(item.created_at)} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  )
}

function HeroCard({ title, subtitle }) {
  return (
    <section style={heroCard}>
      <div style={heroIcon}>☀️</div>
      <div>
        <div style={heroTitle}>{title}</div>
        <div style={heroSubtitle}>{subtitle}</div>
      </div>
    </section>
  )
}

function StatCard({ label, value }) {
  return (
    <article style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{String(value)}</div>
    </article>
  )
}

function InfoItem({ label, value }) {
  return (
    <div style={infoItem}>
      <div style={infoLabel}>{label}</div>
      <div style={infoValue}>{String(value)}</div>
    </div>
  )
}

function EmptyPanel({ title, text }) {
  return (
    <div style={emptyPanel}>
      <div style={emptyTitle}>{title}</div>
      <div style={emptyText}>{text}</div>
    </div>
  )
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return '-'
  }
}

function formatLabel(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
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
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 10px',
    borderRadius: 999,
    background,
    color,
    fontWeight: 700,
    fontSize: 12
  }
}

const heroCard = {
  display: 'flex',
  alignItems: 'center',
  gap: 18,
  borderRadius: 28,
  padding: 24,
  background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
  color: '#fff',
  boxShadow: '0 24px 50px rgba(29, 78, 216, 0.20)'
}

const heroIcon = {
  width: 60,
  height: 60,
  borderRadius: 20,
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(255,255,255,0.14)',
  fontSize: 26
}

const heroTitle = {
  fontSize: 26,
  fontWeight: 900,
  lineHeight: 1.15
}

const heroSubtitle = {
  marginTop: 8,
  color: 'rgba(255,255,255,0.82)',
  lineHeight: 1.55,
  maxWidth: 720
}

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16
}

const statCard = {
  borderRadius: 22,
  padding: 20,
  background: 'rgba(255,255,255,0.78)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)'
}

const statLabel = {
  fontSize: 13,
  color: '#64748b',
  marginBottom: 10
}

const statValue = {
  fontSize: 30,
  fontWeight: 900,
  color: '#0f172a',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word'
}

const sectionCard = {
  borderRadius: 26,
  padding: 20,
  background: 'rgba(255,255,255,0.78)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(226, 232, 240, 0.9)'
}

const sectionHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  marginBottom: 18,
  flexWrap: 'wrap'
}

const sectionEyebrow = {
  fontSize: 12,
  fontWeight: 800,
  color: '#2563eb',
  textTransform: 'uppercase',
  letterSpacing: 0.7
}

const sectionTitle = {
  margin: '6px 0 0 0',
  fontSize: 24,
  fontWeight: 900,
  color: '#0f172a'
}

const secondaryBtn = {
  background: '#fff',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 14,
  padding: '10px 14px',
  cursor: 'pointer',
  fontWeight: 700
}

const mutedText = {
  color: '#64748b'
}

const emptyPanel = {
  borderRadius: 18,
  border: '1px dashed #cbd5e1',
  padding: 26,
  textAlign: 'center',
  background: '#f8fafc'
}

const emptyTitle = {
  fontSize: 20,
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 8
}

const emptyText = {
  color: '#64748b',
  lineHeight: 1.6,
  maxWidth: 640,
  margin: '0 auto'
}

const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
  gap: 16
}

const glassCard = {
  borderRadius: 22,
  padding: 18,
  background: '#fff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)'
}

const rowBetween = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  flexWrap: 'wrap'
}

const cardTitle = {
  fontSize: 18,
  fontWeight: 800,
  color: '#0f172a',
  overflowWrap: 'anywhere'
}

const cardSubtle = {
  marginTop: 6,
  fontSize: 13,
  color: '#64748b',
  overflowWrap: 'anywhere'
}

const infoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 14,
  marginTop: 18
}

const infoItem = {
  minWidth: 0
}

const infoLabel = {
  fontSize: 12,
  color: '#64748b',
  marginBottom: 6
}

const infoValue = {
  fontSize: 15,
  fontWeight: 700,
  color: '#0f172a',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word'
}