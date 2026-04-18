import DashboardShell from '../components/DashboardShell'

export default function WaitingStatusPage({ profile, title }) {
  const rawStatus = String(profile?.onboarding_status || 'submitted').toLowerCase()
  const status = formatLabel(rawStatus)
  const role = formatLabel(profile?.role || 'user')

  const submittedAt = profile?.submitted_at
    ? new Date(profile.submitted_at).toLocaleString()
    : 'Recorded in system'

  return (
    <DashboardShell profile={profile} title={title || `${role} Status`}>
      <section style={heroCard}>
        <div style={heroIcon}>{getRoleIcon(profile?.role)}</div>

        <div style={{ minWidth: 0 }}>
          <div style={heroBadge(rawStatus)}>{status}</div>
          <h2 style={heroTitle}>Your onboarding is under review</h2>
          <p style={heroSubtitle}>
            Your account has been submitted successfully and is currently being reviewed by the
            admin team. You will automatically get access to your full dashboard once approval is
            completed.
          </p>
        </div>
      </section>

      <div style={statsGrid}>
        <StatCard label="Role" value={role} />
        <StatCard label="Current Status" value={status} />
        <StatCard label="Submitted" value={submittedAt} />
      </div>

      <section style={sectionCard}>
        <div style={sectionHeader}>
          <div>
            <div style={sectionEyebrow}>Review Progress</div>
            <h3 style={sectionTitle}>What happens next</h3>
          </div>
        </div>

        <div style={timelineGrid}>
          <TimelineCard
            number="01"
            title="Submission received"
            text="Your onboarding form and uploaded documents have been saved successfully."
            active
          />
          <TimelineCard
            number="02"
            title="Admin review"
            text="The admin team checks your onboarding details, supporting documents and account readiness."
            active={rawStatus === 'submitted' || rawStatus === 'under_review'}
          />
          <TimelineCard
            number="03"
            title="Decision issued"
            text="You will either be approved for dashboard access or returned for correction with notes."
            active={false}
          />
        </div>

        {profile?.rejection_reason ? (
          <div style={noteBox}>
            <div style={noteTitle}>Latest review note</div>
            <div style={noteText}>{profile.rejection_reason}</div>
          </div>
        ) : null}
      </section>

      <section style={sectionCard}>
        <div style={sectionHeader}>
          <div>
            <div style={sectionEyebrow}>Current Access</div>
            <h3 style={sectionTitle}>While you wait</h3>
          </div>
        </div>

        <div style={infoGrid}>
          <InfoPanel
            title="Dashboard access"
            text="Your operational dashboard will unlock automatically after approval."
          />
          <InfoPanel
            title="Status updates"
            text="If corrections are needed, you will be redirected back to onboarding with review notes."
          />
          <InfoPanel
            title="Documents"
            text="Uploaded documents remain attached to your onboarding and can be replaced if rejected."
          />
        </div>
      </section>
    </DashboardShell>
  )
}

function TimelineCard({ number, title, text, active }) {
  return (
    <article
      style={{
        ...timelineCard,
        border: active ? '1px solid rgba(37, 99, 235, 0.30)' : timelineCard.border,
        background: active ? 'rgba(239, 246, 255, 0.9)' : timelineCard.background
      }}
    >
      <div
        style={{
          ...timelineNumber,
          background: active ? '#2563eb' : '#cbd5e1'
        }}
      >
        {number}
      </div>
      <div style={timelineTitle}>{title}</div>
      <div style={timelineText}>{text}</div>
    </article>
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

function InfoPanel({ title, text }) {
  return (
    <article style={infoPanel}>
      <div style={infoTitle}>{title}</div>
      <div style={infoText}>{text}</div>
    </article>
  )
}

function formatLabel(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getRoleIcon(role) {
  const text = String(role || '').toLowerCase()
  if (text === 'installer') return '🛠️'
  if (text === 'bank') return '🏦'
  if (text === 'admin') return '🛡️'
  return '☀️'
}

function heroBadge(status) {
  let background = 'rgba(251, 191, 36, 0.16)'
  let color = '#92400e'

  if (status === 'under_review') {
    background = 'rgba(59, 130, 246, 0.14)'
    color = '#1d4ed8'
  } else if (status === 'approved') {
    background = 'rgba(34, 197, 94, 0.14)'
    color = '#166534'
  } else if (status === 'rejected') {
    background = 'rgba(239, 68, 68, 0.14)'
    color = '#991b1b'
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    borderRadius: 999,
    background,
    color,
    fontWeight: 800,
    fontSize: 12,
    marginBottom: 14
  }
}

const heroCard = {
  display: 'flex',
  alignItems: 'center',
  gap: 18,
  borderRadius: 28,
  padding: 24,
  background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
  color: '#fff',
  boxShadow: '0 24px 50px rgba(37, 99, 235, 0.18)'
}

const heroIcon = {
  width: 64,
  height: 64,
  borderRadius: 20,
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(255,255,255,0.14)',
  fontSize: 28,
  flexShrink: 0
}

const heroTitle = {
  margin: 0,
  fontSize: 28,
  fontWeight: 900,
  lineHeight: 1.15
}

const heroSubtitle = {
  marginTop: 10,
  marginBottom: 0,
  color: 'rgba(255,255,255,0.82)',
  lineHeight: 1.65,
  maxWidth: 820
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
  fontSize: 22,
  fontWeight: 900,
  color: '#0f172a',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  lineHeight: 1.3
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

const timelineGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 16
}

const timelineCard = {
  borderRadius: 22,
  padding: 18,
  background: '#fff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 14px 30px rgba(15, 23, 42, 0.05)'
}

const timelineNumber = {
  width: 42,
  height: 42,
  borderRadius: 14,
  display: 'grid',
  placeItems: 'center',
  color: '#fff',
  fontWeight: 900,
  fontSize: 13,
  marginBottom: 14
}

const timelineTitle = {
  fontSize: 18,
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 8
}

const timelineText = {
  color: '#64748b',
  lineHeight: 1.6
}

const noteBox = {
  marginTop: 18,
  background: '#fff7ed',
  color: '#9a3412',
  border: '1px solid #fdba74',
  borderRadius: 14,
  padding: 14
}

const noteTitle = {
  fontWeight: 800,
  marginBottom: 6
}

const noteText = {
  lineHeight: 1.55
}

const infoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 16
}

const infoPanel = {
  borderRadius: 20,
  padding: 18,
  background: '#fff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 14px 30px rgba(15, 23, 42, 0.04)'
}

const infoTitle = {
  fontSize: 17,
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: 8
}

const infoText = {
  color: '#64748b',
  lineHeight: 1.6
}