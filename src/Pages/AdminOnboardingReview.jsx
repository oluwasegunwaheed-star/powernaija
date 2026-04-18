import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import DashboardShell from '../components/DashboardShell'
import ErrorState from '../components/ErrorState'

const ROLE_OPTIONS = ['all', 'user', 'installer', 'bank']
const STATUS_OPTIONS = ['all', 'draft', 'submitted', 'under_review', 'approved', 'rejected']

export default function AdminOnboardingReview({ profile }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [detailData, setDetailData] = useState(null)
  const [documents, setDocuments] = useState([])
  const [docNotes, setDocNotes] = useState({})
  const [docActionId, setDocActionId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const [actionLoading, setActionLoading] = useState(false)
  const [reviewNote, setReviewNote] = useState('')

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      setLoading(true)
      setError('')
      setMessage('')

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          onboarding_status,
          approval_status,
          verification_status,
          submitted_at,
          reviewed_at,
          rejection_reason
        `)
        .in('role', ['user', 'installer', 'bank'])
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .order('email', { ascending: true })

      if (error) throw error
      setRecords(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load onboarding records')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchesRole = roleFilter === 'all' || item.role === roleFilter
      const matchesStatus =
        statusFilter === 'all' ||
        String(item.onboarding_status || '').toLowerCase() === statusFilter

      const haystack = [
        item.full_name || '',
        item.email || '',
        item.role || '',
        item.onboarding_status || ''
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !search.trim() || haystack.includes(search.trim().toLowerCase())

      return matchesRole && matchesStatus && matchesSearch
    })
  }, [records, roleFilter, statusFilter, search])

  const getTableName = (role) => {
    if (role === 'user') return 'user_onboarding'
    if (role === 'installer') return 'installer_onboarding'
    if (role === 'bank') return 'bank_onboarding'
    return null
  }

  const loadDetails = async (record) => {
    try {
      setSelected(record)
      setDetailLoading(true)
      setDetailError('')
      setDetailData(null)
      setDocuments([])
      setDocNotes({})
      setReviewNote(record?.rejection_reason || '')
      setShowHistory(false)

      const tableName = getTableName(record.role)
      if (!tableName) throw new Error('Unknown onboarding role')

      const { data: onboardingRow, error: onboardingError } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', record.id)
        .maybeSingle()

      if (onboardingError) throw onboardingError
      setDetailData(onboardingRow)

      if (onboardingRow?.id) {
        const { data: docs, error: docsError } = await supabase
          .from('onboarding_documents')
          .select('*')
          .eq('owner_id', record.id)
          .eq('role', record.role)
          .eq('onboarding_table', tableName)
          .eq('onboarding_id', onboardingRow.id)
          .order('document_type', { ascending: true })
          .order('version', { ascending: false })
          .order('created_at', { ascending: false })

        if (docsError) throw docsError

        const docsList = docs || []
        setDocuments(docsList)

        const initialNotes = {}
        docsList.forEach((doc) => {
          initialNotes[doc.id] = doc.notes || ''
        })
        setDocNotes(initialNotes)
      }
    } catch (err) {
      setDetailError(err.message || 'Failed to load onboarding details')
    } finally {
      setDetailLoading(false)
    }
  }

  const refreshSelectedDetails = async () => {
    if (selected) {
      await loadDetails(selected)
    }
  }

  const currentDocuments = useMemo(() => {
    return documents.filter((doc) => doc.is_current !== false)
  }, [documents])

  const historicalDocuments = useMemo(() => {
    return documents.filter((doc) => doc.is_current === false)
  }, [documents])

  const updateStatuses = async ({
    onboardingStatus,
    approvalStatus,
    verificationStatus,
    rejectionReason
  }) => {
    if (!selected) return

    try {
      setActionLoading(true)
      setDetailError('')
      setMessage('')

      const tableName = getTableName(selected.role)
      if (!tableName) throw new Error('Unknown onboarding role')

      const reviewedAt = new Date().toISOString()

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_status: onboardingStatus,
          approval_status: approvalStatus,
          verification_status: verificationStatus,
          reviewed_at: reviewedAt,
          rejection_reason: rejectionReason || null
        })
        .eq('id', selected.id)

      if (profileError) throw profileError

      const { error: onboardingError } = await supabase
        .from(tableName)
        .update({
          onboarding_status: onboardingStatus,
          approval_status: approvalStatus,
          verification_status: verificationStatus,
          reviewed_at: reviewedAt,
          reviewed_by: profile?.id || null,
          rejection_reason: rejectionReason || null
        })
        .eq('user_id', selected.id)

      if (onboardingError) throw onboardingError

      const { error: reviewLogError } = await supabase
        .from('onboarding_reviews')
        .insert({
          owner_id: selected.id,
          role: selected.role,
          decision:
            onboardingStatus === 'approved'
              ? 'approved'
              : onboardingStatus === 'rejected'
              ? 'rejected'
              : 'under_review',
          reviewer_id: profile?.id || null,
          review_notes: rejectionReason || null
        })

      if (reviewLogError) {
        console.warn('Review log insert failed:', reviewLogError.message)
      }

      try {
        await supabase.from('onboarding_status_events').insert({
          owner_id: selected.id,
          role: selected.role,
          old_status: selected.onboarding_status || null,
          new_status: onboardingStatus,
          old_approval_status: selected.approval_status || null,
          new_approval_status: approvalStatus,
          old_verification_status: selected.verification_status || null,
          new_verification_status: verificationStatus,
          changed_by: profile?.id || null,
          notes: rejectionReason || null
        })
      } catch (eventErr) {
        console.warn('Status event insert skipped:', eventErr?.message || eventErr)
      }

      setMessage(`Onboarding ${onboardingStatus} successfully`)
      await loadProfiles()

      const updatedSelected = {
        ...selected,
        onboarding_status: onboardingStatus,
        approval_status: approvalStatus,
        verification_status: verificationStatus,
        reviewed_at: reviewedAt,
        rejection_reason: rejectionReason || null
      }

      setSelected(updatedSelected)
      await loadDetails(updatedSelected)
    } catch (err) {
      setDetailError(err.message || 'Failed to update onboarding status')
    } finally {
      setActionLoading(false)
    }
  }

  const updateDocument = async (docId, updates) => {
    try {
      setDocActionId(docId)
      setDetailError('')
      setMessage('')

      const { error } = await supabase
        .from('onboarding_documents')
        .update(updates)
        .eq('id', docId)

      if (error) throw error

      setMessage('Document status updated')
      await refreshSelectedDetails()
    } catch (err) {
      setDetailError(err.message || 'Failed to update document status')
    } finally {
      setDocActionId(null)
    }
  }

  const verifyDocument = async (doc) => {
    const note = docNotes[doc.id] || ''
    await updateDocument(doc.id, {
      verified: true,
      upload_status: 'uploaded',
      notes: note || null
    })
  }

  const rejectDocument = async (doc) => {
    const note = docNotes[doc.id] || ''
    if (!note.trim()) {
      setDetailError('Add a note before rejecting a document.')
      return
    }

    await updateDocument(doc.id, {
      verified: false,
      upload_status: 'rejected',
      notes: note.trim()
    })
  }

  const markUnderReview = async () => {
    await updateStatuses({
      onboardingStatus: 'under_review',
      approvalStatus: 'pending',
      verificationStatus: 'pending',
      rejectionReason: ''
    })
  }

  const approveRecord = async () => {
    const hasUnverifiedDocs =
      currentDocuments.length > 0 && currentDocuments.some((doc) => !doc.verified)

    if (hasUnverifiedDocs) {
      setDetailError('Verify all current uploaded documents before approving this onboarding.')
      return
    }

    await updateStatuses({
      onboardingStatus: 'approved',
      approvalStatus: 'approved',
      verificationStatus: 'verified',
      rejectionReason: ''
    })
  }

  const rejectRecord = async () => {
    if (!reviewNote.trim()) {
      setDetailError('Enter a rejection reason before rejecting.')
      return
    }

    await updateStatuses({
      onboardingStatus: 'rejected',
      approvalStatus: 'rejected',
      verificationStatus: 'rejected',
      rejectionReason: reviewNote.trim()
    })
  }

  const openDocument = async (doc) => {
    try {
      const bucketId =
        doc.role === 'user'
          ? 'user-onboarding-docs'
          : doc.role === 'installer'
          ? 'installer-onboarding-docs'
          : 'bank-onboarding-docs'

      const { data, error } = await supabase.storage
        .from(bucketId)
        .createSignedUrl(doc.file_path, 60 * 10)

      if (error) throw error
      window.open(data.signedUrl, '_blank')
    } catch (err) {
      setDetailError(err.message || 'Failed to open document')
    }
  }

  return (
    <DashboardShell profile={profile} title="Admin Onboarding Review">
      <ErrorState message={error} />
      {message ? <SuccessBox text={message} /> : null}

      <div style={topGrid}>
        <div style={leftPane}>
          <div style={panel}>
            <h3 style={sectionTitle}>Filters</h3>

            <div style={filterGrid}>
              <label style={field}>
                <span style={label}>Role</span>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={input}>
                  {ROLE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {capitalize(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={field}>
                <span style={label}>Status</span>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={input}>
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {capitalize(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={field}>
                <span style={label}>Search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search email or name"
                  style={input}
                />
              </label>
            </div>
          </div>

          <div style={panel}>
            <div style={listHeader}>
              <h3 style={{ margin: 0 }}>Submissions</h3>
              <button type="button" onClick={loadProfiles} style={secondaryBtn}>
                Refresh
              </button>
            </div>

            {loading ? (
              <div style={mutedText}>Loading submissions...</div>
            ) : filteredRecords.length === 0 ? (
              <div style={emptyBox}>No onboarding submissions found.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {filteredRecords.map((item) => {
                  const active = selected?.id === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => loadDetails(item)}
                      style={{
                        ...recordCard,
                        border: active ? '1px solid #2563eb' : '1px solid #e5e7eb',
                        background: active ? '#eff6ff' : '#fff'
                      }}
                    >
                      <div style={recordTop}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={recordTitle}>{item.full_name || item.email}</div>
                          <div style={recordEmail}>{item.email}</div>
                        </div>

                        <div style={{ flexShrink: 0 }}>
                          <div style={pill(item.role, 'role')}>{item.role}</div>
                        </div>
                      </div>

                      <div style={recordMeta}>
                        <span style={pill(item.onboarding_status, 'status')}>
                          {item.onboarding_status || 'draft'}
                        </span>
                        <span style={recordSubmittedText}>
                          Submitted: {formatDate(item.submitted_at)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div style={rightPane}>
          <div style={panel}>
            <h3 style={sectionTitle}>Submission Details</h3>

            {!selected ? (
              <div style={emptyBox}>Select a submission to review.</div>
            ) : detailLoading ? (
              <div style={mutedText}>Loading details...</div>
            ) : (
              <>
                <ErrorState message={detailError} />

                <div style={summaryGrid}>
                  <SummaryItem label="Name" value={selected.full_name || '-'} />
                  <SummaryItem label="Email" value={selected.email || '-'} />
                  <SummaryItem label="Role" value={selected.role || '-'} />
                  <SummaryItem label="Status" value={selected.onboarding_status || '-'} />
                  <SummaryItem label="Approval" value={selected.approval_status || '-'} />
                  <SummaryItem label="Verification" value={selected.verification_status || '-'} />
                </div>

                {selected?.onboarding_status === 'rejected' && selected?.rejection_reason ? (
                  <div style={rejectionBox}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Rejection Reason</div>
                    <div>{selected.rejection_reason}</div>
                  </div>
                ) : null}

                <div style={block}>
                  <h4 style={blockTitle}>Onboarding Data</h4>
                  {detailData ? (
                    <div style={jsonBox}>
                      <pre style={jsonPre}>{JSON.stringify(detailData, null, 2)}</pre>
                    </div>
                  ) : (
                    <div style={emptyBox}>No onboarding form row found.</div>
                  )}
                </div>

                <div style={block}>
                  <div style={docSectionHeader}>
                    <h4 style={{ margin: 0 }}>Current Documents</h4>
                    {historicalDocuments.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowHistory((prev) => !prev)}
                        style={secondaryBtn}
                      >
                        {showHistory ? 'Hide History' : `Show History (${historicalDocuments.length})`}
                      </button>
                    ) : null}
                  </div>

                  {currentDocuments.length === 0 ? (
                    <div style={emptyBox}>No current documents uploaded yet.</div>
                  ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                      {currentDocuments.map((doc) => (
                        <div key={doc.id} style={docRow}>
                          <div style={{ width: '100%', minWidth: 0 }}>
                            <div style={docHeader}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={docTitle}>
                                  {formatDocType(doc.document_type)} · Version {doc.version || 1}
                                </div>
                                <div style={docFileName}>{doc.file_name}</div>
                              </div>

                              <div style={docBadgeWrap}>
                                <span style={docStatusPill(doc.upload_status)}>
                                  {doc.upload_status || 'uploaded'}
                                </span>
                                <span style={docVerifiedPill(doc.verified)}>
                                  {doc.verified ? 'Verified' : 'Not verified'}
                                </span>
                              </div>
                            </div>

                            <div style={docMetaText}>
                              Uploaded: {formatDate(doc.created_at)}
                            </div>

                            <div style={{ marginTop: 10 }}>
                              <label style={field}>
                                <span style={label}>Document note</span>
                                <textarea
                                  value={docNotes[doc.id] || ''}
                                  onChange={(e) =>
                                    setDocNotes((prev) => ({
                                      ...prev,
                                      [doc.id]: e.target.value
                                    }))
                                  }
                                  placeholder="Add verification note or rejection reason"
                                  style={docNoteArea}
                                />
                              </label>
                            </div>

                            {doc.notes ? (
                              <div style={docNotePreview}>
                                <strong>Current note:</strong> {doc.notes}
                              </div>
                            ) : null}

                            <div style={docActionRow}>
                              <button type="button" onClick={() => openDocument(doc)} style={secondaryBtn}>
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() => verifyDocument(doc)}
                                disabled={docActionId === doc.id}
                                style={verifyBtn}
                              >
                                {docActionId === doc.id ? 'Saving...' : 'Verify'}
                              </button>

                              <button
                                type="button"
                                onClick={() => rejectDocument(doc)}
                                disabled={docActionId === doc.id}
                                style={rejectBtn}
                              >
                                {docActionId === doc.id ? 'Saving...' : 'Reject'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {showHistory && historicalDocuments.length > 0 ? (
                  <div style={block}>
                    <h4 style={blockTitle}>Document History</h4>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {historicalDocuments.map((doc) => (
                        <div key={doc.id} style={historyRow}>
                          <div style={{ width: '100%', minWidth: 0 }}>
                            <div style={docHeader}>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={docTitle}>
                                  {formatDocType(doc.document_type)} · Version {doc.version || 1}
                                </div>
                                <div style={docFileName}>{doc.file_name}</div>
                              </div>

                              <div style={docBadgeWrap}>
                                <span style={docStatusPill(doc.upload_status)}>
                                  {doc.upload_status || 'uploaded'}
                                </span>
                                <span style={docVerifiedPill(doc.verified)}>
                                  {doc.verified ? 'Verified' : 'Not verified'}
                                </span>
                              </div>
                            </div>

                            <div style={docMetaText}>
                              Historical version · Uploaded: {formatDate(doc.created_at)}
                            </div>

                            {doc.notes ? (
                              <div style={docNotePreview}>
                                <strong>Note:</strong> {doc.notes}
                              </div>
                            ) : null}

                            <div style={docActionRow}>
                              <button type="button" onClick={() => openDocument(doc)} style={secondaryBtn}>
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div style={block}>
                  <h4 style={blockTitle}>Reviewer Notes</h4>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Add rejection reason or review note"
                    style={textarea}
                  />
                </div>

                <div style={actionRow}>
                  <button type="button" onClick={markUnderReview} disabled={actionLoading} style={reviewBtn}>
                    {actionLoading ? 'Saving...' : 'Mark Under Review'}
                  </button>

                  <button type="button" onClick={approveRecord} disabled={actionLoading} style={approveBtn}>
                    {actionLoading ? 'Saving...' : 'Approve'}
                  </button>

                  <button type="button" onClick={rejectRecord} disabled={actionLoading} style={rejectBtn}>
                    {actionLoading ? 'Saving...' : 'Reject'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

function SummaryItem({ label, value }) {
  return (
    <div style={summaryCard}>
      <div style={summaryLabel}>{label}</div>
      <div style={summaryValue}>{String(value || '-')}</div>
    </div>
  )
}

function SuccessBox({ text }) {
  return <div style={successBox}>{text}</div>
}

function capitalize(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDocType(value) {
  return capitalize(value)
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return '-'
  }
}

function pill(value, type) {
  const text = String(value || '').toLowerCase()

  let background = '#e5e7eb'
  let color = '#334155'

  if (type === 'role') {
    if (text === 'user') {
      background = '#dcfce7'
      color = '#166534'
    } else if (text === 'installer') {
      background = '#fef3c7'
      color = '#92400e'
    } else if (text === 'bank') {
      background = '#dbeafe'
      color = '#1d4ed8'
    }
  } else {
    if (text === 'approved') {
      background = '#dcfce7'
      color = '#166534'
    } else if (text === 'submitted' || text === 'under_review') {
      background = '#fef3c7'
      color = '#92400e'
    } else if (text === 'rejected') {
      background = '#fee2e2'
      color = '#991b1b'
    }
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 10px',
    borderRadius: 999,
    background,
    color,
    fontWeight: 700,
    fontSize: 12,
    textTransform: 'capitalize'
  }
}

function docStatusPill(status) {
  const text = String(status || '').toLowerCase()

  let background = '#e5e7eb'
  let color = '#334155'

  if (text === 'uploaded') {
    background = '#dbeafe'
    color = '#1d4ed8'
  } else if (text === 'rejected') {
    background = '#fee2e2'
    color = '#991b1b'
  } else if (text === 'pending') {
    background = '#fef3c7'
    color = '#92400e'
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 10px',
    borderRadius: 999,
    background,
    color,
    fontWeight: 700,
    fontSize: 12,
    textTransform: 'capitalize'
  }
}

function docVerifiedPill(verified) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 10px',
    borderRadius: 999,
    background: verified ? '#dcfce7' : '#fef3c7',
    color: verified ? '#166534' : '#92400e',
    fontWeight: 700,
    fontSize: 12
  }
}

const topGrid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)',
  gap: 16,
  alignItems: 'start'
}

const leftPane = {
  display: 'grid',
  gap: 16,
  minWidth: 0
}

const rightPane = {
  display: 'grid',
  minWidth: 0
}

const panel = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 16,
  minWidth: 0
}

const sectionTitle = {
  marginTop: 0,
  marginBottom: 14,
  textAlign: 'center'
}

const block = {
  marginTop: 18
}

const blockTitle = {
  marginBottom: 10,
  textAlign: 'center'
}

const filterGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 12
}

const field = {
  display: 'grid',
  gap: 6
}

const label = {
  fontSize: 13,
  color: '#475569'
}

const input = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #d1d5db',
  boxSizing: 'border-box',
  background: '#fff',
  minWidth: 0
}

const textarea = {
  ...input,
  minHeight: 120,
  resize: 'vertical'
}

const listHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  marginBottom: 12
}

const recordCard = {
  width: '100%',
  textAlign: 'left',
  borderRadius: 14,
  padding: 12,
  cursor: 'pointer',
  minWidth: 0
}

const recordTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12
}

const recordTitle = {
  fontWeight: 700,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  lineHeight: 1.35
}

const recordEmail = {
  fontSize: 13,
  color: '#64748b',
  marginTop: 4,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  lineHeight: 1.35
}

const recordMeta = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  marginTop: 10,
  flexWrap: 'wrap'
}

const recordSubmittedText = {
  fontSize: 12,
  color: '#64748b',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word'
}

const summaryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
  alignItems: 'start'
}

const summaryCard = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 12,
  minWidth: 0
}

const summaryLabel = {
  fontSize: 12,
  color: '#64748b',
  marginBottom: 6
}

const summaryValue = {
  fontWeight: 700,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  lineHeight: 1.4
}

const rejectionBox = {
  background: '#fff7ed',
  color: '#9a3412',
  border: '1px solid #fdba74',
  borderRadius: 12,
  padding: 14,
  marginTop: 18
}

const jsonBox = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 12,
  background: '#f8fafc',
  maxHeight: 320,
  overflow: 'auto',
  minWidth: 0
}

const jsonPre = {
  margin: 0,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowWrap: 'anywhere'
}

const docSectionHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  marginBottom: 10,
  flexWrap: 'wrap'
}

const docRow = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 12,
  minWidth: 0
}

const historyRow = {
  border: '1px dashed #cbd5e1',
  borderRadius: 12,
  padding: 12,
  background: '#f8fafc',
  minWidth: 0
}

const docHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  flexWrap: 'wrap'
}

const docTitle = {
  fontWeight: 700,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word'
}

const docFileName = {
  fontSize: 13,
  color: '#64748b',
  marginTop: 4,
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  lineHeight: 1.35
}

const docBadgeWrap = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  alignItems: 'center'
}

const docMetaText = {
  fontSize: 12,
  color: '#64748b',
  marginTop: 8
}

const docActionRow = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginTop: 10
}

const docNoteArea = {
  ...input,
  minHeight: 90,
  resize: 'vertical'
}

const docNotePreview = {
  background: '#fff7ed',
  color: '#9a3412',
  border: '1px solid #fdba74',
  borderRadius: 10,
  padding: 10,
  marginTop: 10,
  fontSize: 13,
  lineHeight: 1.45
}

const mutedText = {
  color: '#64748b'
}

const emptyBox = {
  border: '1px dashed #cbd5e1',
  borderRadius: 12,
  padding: 16,
  color: '#64748b',
  textAlign: 'center'
}

const actionRow = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginTop: 16
}

const secondaryBtn = {
  background: '#fff',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 10,
  padding: '10px 14px',
  cursor: 'pointer',
  fontWeight: 600
}

const reviewBtn = {
  background: '#d97706',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 700
}

const verifyBtn = {
  background: '#16a34a',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '10px 14px',
  cursor: 'pointer',
  fontWeight: 700
}

const approveBtn = {
  background: '#16a34a',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 700
}

const rejectBtn = {
  background: '#dc2626',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 700
}

const successBox = {
  background: '#ecfdf5',
  color: '#047857',
  border: '1px solid #a7f3d0',
  padding: 12,
  borderRadius: 12,
  marginBottom: 16
}