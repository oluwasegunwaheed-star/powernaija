import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import DashboardShell from '../components/DashboardShell'
import ErrorState from '../components/ErrorState'

export default function InstallerDashboard({ user, profile }) {
  const [requests, setRequests] = useState([])
  const [quotes, setQuotes] = useState([])
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingRequestId, setSavingRequestId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [user.id])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      setMessage('')

      const [{ data: requestRows, error: requestError }, { data: quoteRows, error: quoteError }] =
        await Promise.all([
          supabase.from('requests').select('*').order('created_at', { ascending: false }),
          supabase
            .from('quotes')
            .select('*')
            .eq('installer_id', user.id)
            .order('created_at', { ascending: false })
        ])

      if (requestError) throw requestError
      if (quoteError) throw quoteError

      setRequests(requestRows || [])
      setQuotes(quoteRows || [])
    } catch (err) {
      setError(err.message || 'Failed to load installer dashboard')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const submittedQuotes = quotes.length
    const acceptedQuotes = quotes.filter(
      (item) => String(item.status || '').toLowerCase() === 'accepted'
    ).length
    const availableRequests = requests.length
    const averageQuote =
      submittedQuotes > 0
        ? quotes.reduce((sum, item) => sum + Number(item.price || 0), 0) / submittedQuotes
        : 0

    return {
      submittedQuotes,
      acceptedQuotes,
      availableRequests,
      averageQuote
    }
  }, [requests, quotes])

  const quoteMap = useMemo(() => {
    const map = new Map()
    quotes.forEach((item) => {
      const key = item.request_id || item.id
      if (key && !map.has(key)) map.set(key, item)
    })
    return map
  }, [quotes])

  const onDraftChange = (requestId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: value
      }
    }))
  }

  const submitQuote = async (request) => {
    const requestId = request.id || request.request_id
    const draft = drafts[requestId] || {}

    if (!draft.price || !draft.monthly || !draft.timeline) {
      setError('Enter price, monthly plan and timeline before submitting a quote.')
      return
    }

    try {
      setSavingRequestId(requestId)
      setError('')
      setMessage('')

      const { error } = await supabase.from('quotes').insert({
        request_id: requestId,
        installer_id: user.id,
        price: Number(draft.price),
        monthly: Number(draft.monthly),
        timeline: draft.timeline,
        terms: draft.terms || null,
        status: 'submitted'
      })

      if (error) throw error

      setMessage('Quote submitted successfully.')
      setDrafts((prev) => ({ ...prev, [requestId]: {} }))
      await loadData()
    } catch (err) {
      setError(err.message || 'Failed to submit quote')
    } finally {
      setSavingRequestId('')
    }
  }

  return (
    <DashboardShell profile={profile} title="Installer Dashboard">
      <ErrorState message={error} />
      {message ? <SuccessBox text={message} /> : null}

      <HeroCard
        title="Build quotes and win projects faster"
        subtitle="Review incoming requests, send structured offers and manage your installer pipeline with a cleaner, premium workspace."
      />

      <div style={statsGrid}>
        <StatCard label="Available Requests" value={stats.availableRequests} />
        <StatCard label="Submitted Quotes" value={stats.submittedQuotes} />
        <StatCard label="Accepted Quotes" value={stats.acceptedQuotes} />
        <StatCard label="Average Quote" value={formatCurrency(stats.averageQuote)} />
      </div>

      <section style={sectionCard}>
        <div style={sectionHeader}>
          <div>
            <div style={sectionEyebrow}>Sales Pipeline</div>
            <h3 style={sectionTitle}>Open Request Board</h3>
          </div>
          <button type="button" onClick={loadData} style={secondaryBtn}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={mutedText}>Loading installer workspace...</div>
        ) : requests.length === 0 ? (
          <EmptyPanel
            title="No requests available"
            text="New solar requests will appear here for quote submission."
          />
        ) : (
          <div style={requestGrid}>
            {requests.map((request, index) => {
              const requestId = request.id || request.request_id || `request-${index}`
              const existingQuote = quoteMap.get(requestId)
              const draft = drafts[requestId] || {}

              return (
                <article key={requestId} style={requestCard}>
                  <div style={requestTop}>
                    <div>
                      <div style={requestTitle}>{getRequestTitle(request)}</div>
                      <div style={requestSubtitle}>
                        {getRequestSubtitle(request)}
                      </div>
                    </div>

                    {existingQuote ? (
                      <div style={statusPill(existingQuote.status || 'submitted')}>
                        Quote {formatLabel(existingQuote.status || 'submitted')}
                      </div>
                    ) : (
                      <div style={outlinePill}>Open</div>
                    )}
                  </div>

                  <div style={infoGrid}>
                    <InfoItem label="System Size" value={getSystemSize(request)} />
                    <InfoItem label="Budget" value={formatCurrency(request.amount || request.price || 0)} />
                    <InfoItem label="Location" value={request.location || request.state || '-'} />
                    <InfoItem label="Created" value={formatDate(request.created_at)} />
                  </div>

                  {existingQuote ? (
                    <div style={quoteSummaryCard}>
                      <div style={quoteSummaryTitle}>Your latest quote</div>
                      <div style={quoteSummaryGrid}>
                        <InfoItem label="Total Price" value={formatCurrency(existingQuote.price || 0)} />
                        <InfoItem label="Monthly Plan" value={formatCurrency(existingQuote.monthly || 0)} />
                        <InfoItem label="Timeline" value={existingQuote.timeline || '-'} />
                        <InfoItem label="Terms" value={existingQuote.terms || '-'} />
                      </div>
                    </div>
                  ) : (
                    <div style={formWrap}>
                      <div style={formGrid}>
                        <Field label="Total Price (₦)">
                          <input
                            type="number"
                            value={draft.price || ''}
                            onChange={(e) => onDraftChange(requestId, 'price', e.target.value)}
                            style={input}
                            placeholder="Enter total quote"
                          />
                        </Field>

                        <Field label="Monthly Plan (₦)">
                          <input
                            type="number"
                            value={draft.monthly || ''}
                            onChange={(e) => onDraftChange(requestId, 'monthly', e.target.value)}
                            style={input}
                            placeholder="Enter monthly plan"
                          />
                        </Field>

                        <Field label="Timeline">
                          <input
                            value={draft.timeline || ''}
                            onChange={(e) => onDraftChange(requestId, 'timeline', e.target.value)}
                            style={input}
                            placeholder="e.g. 10 working days"
                          />
                        </Field>
                      </div>

                      <Field label="Terms & Conditions">
                        <textarea
                          value={draft.terms || ''}
                          onChange={(e) => onDraftChange(requestId, 'terms', e.target.value)}
                          style={textarea}
                          placeholder="Add warranty, scope, assumptions or exclusions"
                        />
                      </Field>

                      <div style={{ marginTop: 14 }}>
                        <button
                          type="button"
                          onClick={() => submitQuote(request)}
                          disabled={savingRequestId === requestId}
                          style={primaryBtn}
                        >
                          {savingRequestId === requestId ? 'Submitting...' : 'Submit Quote'}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </DashboardShell>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </label>
  )
}

function HeroCard({ title, subtitle }) {
  return (
    <section style={heroCard}>
      <div style={heroIcon}>🛠️</div>
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

function SuccessBox({ text }) {
  return <div style={successBox}>{text}</div>
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

function getRequestTitle(request) {
  const size =
    request.system_size ||
    request.system_size_kva ||
    request.desired_system_size_kva ||
    request.size_kva

  return (
    request.title ||
    request.product_name ||
    request.system_name ||
    (size ? `${size}kVA Solar Backup System` : 'Solar Backup Request')
  )
}

function getRequestSubtitle(request) {
  return (
    request.description ||
    request.appliance_summary ||
    request.purchase_intent ||
    'Ready for installer quotation'
  )
}

function getSystemSize(request) {
  const size =
    request.system_size ||
    request.system_size_kva ||
    request.desired_system_size_kva ||
    request.size_kva
  return size ? `${size} kVA` : '-'
}

function statusPill(status) {
  const text = String(status || '').toLowerCase()
  let background = '#dbeafe'
  let color = '#1d4ed8'

  if (text === 'accepted' || text === 'approved') {
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

const outlinePill = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '7px 10px',
  borderRadius: 999,
  border: '1px solid #cbd5e1',
  color: '#475569',
  fontWeight: 700,
  fontSize: 12,
  background: '#fff'
}

const heroCard = {
  display: 'flex',
  alignItems: 'center',
  gap: 18,
  borderRadius: 28,
  padding: 24,
  background: 'linear-gradient(135deg, #111827 0%, #1d4ed8 100%)',
  color: '#fff',
  boxShadow: '0 24px 50px rgba(17, 24, 39, 0.18)'
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
  maxWidth: 760
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

const primaryBtn = {
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 14,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 800,
  boxShadow: '0 14px 28px rgba(37, 99, 235, 0.20)'
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

const requestGrid = {
  display: 'grid',
  gap: 18
}

const requestCard = {
  borderRadius: 26,
  padding: 20,
  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
  color: '#fff',
  boxShadow: '0 24px 50px rgba(15, 23, 42, 0.16)'
}

const requestTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  flexWrap: 'wrap'
}

const requestTitle = {
  fontSize: 18,
  fontWeight: 900,
  color: '#fff',
  overflowWrap: 'anywhere'
}

const requestSubtitle = {
  marginTop: 8,
  color: 'rgba(255,255,255,0.72)',
  lineHeight: 1.45,
  overflowWrap: 'anywhere'
}

const infoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 14,
  marginTop: 18
}

const infoItem = {
  minWidth: 0
}

const infoLabel = {
  fontSize: 12,
  color: 'rgba(255,255,255,0.62)',
  marginBottom: 6
}

const infoValue = {
  fontSize: 15,
  fontWeight: 700,
  color: '#fff',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word'
}

const formWrap = {
  marginTop: 18,
  borderRadius: 20,
  padding: 18,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)'
}

const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14
}

const fieldLabel = {
  fontSize: 13,
  color: 'rgba(255,255,255,0.82)'
}

const input = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  boxSizing: 'border-box'
}

const textarea = {
  ...input,
  minHeight: 110,
  resize: 'vertical',
  marginTop: 6
}

const quoteSummaryCard = {
  marginTop: 18,
  borderRadius: 20,
  padding: 18,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)'
}

const quoteSummaryTitle = {
  fontSize: 16,
  fontWeight: 800,
  marginBottom: 14
}

const quoteSummaryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 14
}

const successBox = {
  background: '#ecfdf5',
  color: '#047857',
  border: '1px solid #a7f3d0',
  padding: 12,
  borderRadius: 12
}