import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import DashboardShell from '../components/DashboardShell'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'

export default function AdminDashboard({ profile, setTestRole }) {
  const [profiles, setProfiles] = useState([])
  const [requestCount, setRequestCount] = useState(0)
  const [quoteCount, setQuoteCount] = useState(0)
  const [applicationCount, setApplicationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [profilesRes, requestsRes, quotesRes, applicationsRes] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('requests').select('*', { count: 'exact', head: true }),
          supabase.from('quotes').select('*', { count: 'exact', head: true }),
          supabase.from('financing_applications').select('*', { count: 'exact', head: true })
        ])

        if (profilesRes.error) throw profilesRes.error
        if (requestsRes.error) throw requestsRes.error
        if (quotesRes.error) throw quotesRes.error
        if (applicationsRes.error) throw applicationsRes.error

        setProfiles(profilesRes.data || [])
        setRequestCount(requestsRes.count || 0)
        setQuoteCount(quotesRes.count || 0)
        setApplicationCount(applicationsRes.count || 0)
        setError('')
      } catch (err) {
        setError(err.message || 'Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [])

  const roleSummary = profiles.reduce(
    (acc, item) => {
      const role = String(item.role || 'user').toLowerCase()
      if (role === 'installer') acc.installers += 1
      else if (role === 'bank') acc.banks += 1
      else if (role === 'admin') acc.admins += 1
      else acc.users += 1
      return acc
    },
    { users: 0, installers: 0, banks: 0, admins: 0 }
  )

  return (
    <DashboardShell
      profile={profile}
      title="🛡️ Admin Dashboard"
      setTestRole={setTestRole}
    >
      <ErrorState message={error} />

      <div style={statsGrid}>
        <StatCard label="Profiles" value={profiles.length} />
        <StatCard label="Requests" value={requestCount} />
        <StatCard label="Quotes" value={quoteCount} />
        <StatCard label="Applications" value={applicationCount} />
      </div>

      <div style={statsGrid}>
        <StatCard label="Users" value={roleSummary.users} />
        <StatCard label="Installers" value={roleSummary.installers} />
        <StatCard label="Banks" value={roleSummary.banks} />
        <StatCard label="Admins" value={roleSummary.admins} />
      </div>

      {loading ? (
        <div style={{ padding: 16 }}>Loading admin data...</div>
      ) : profiles.length === 0 ? (
        <EmptyState
          title="No profiles found"
          description="There are no user profiles in the system yet."
        />
      ) : (
        <div style={tableWrap}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>{item.full_name || '-'}</td>
                  <td style={tdStyle}>{item.email || '-'}</td>
                  <td style={tdStyle}>
                    <span style={rolePill(item.role)}>{item.role || 'user'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}

function StatCard({ label, value }) {
  return (
    <div style={statCardStyle}>
      <div style={{ color: '#6b7280', fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  )
}

function rolePill(role) {
  const normalized = String(role || '').toLowerCase()
  let background = '#e5e7eb'
  let color = '#374151'

  if (normalized === 'admin') {
    background = '#fee2e2'
    color = '#991b1b'
  } else if (normalized === 'bank') {
    background = '#dbeafe'
    color = '#1d4ed8'
  } else if (normalized === 'installer') {
    background = '#fef3c7'
    color = '#92400e'
  } else if (normalized === 'user') {
    background = '#dcfce7'
    color = '#166534'
  }

  return {
    background,
    color,
    padding: '6px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'capitalize'
  }
}

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
  gap: 16,
  marginBottom: 18
}

const statCardStyle = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 18
}

const tableWrap = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  overflow: 'auto'
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
}

const thStyle = {
  textAlign: 'left',
  padding: 14,
  borderBottom: '1px solid #e5e7eb',
  background: '#f9fafb'
}

const tdStyle = {
  padding: 14,
  borderBottom: '1px solid #f3f4f6'
}