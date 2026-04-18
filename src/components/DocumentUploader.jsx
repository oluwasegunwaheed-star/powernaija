import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ErrorState from './ErrorState'

export default function DocumentUploader({
  bucketId,
  ownerId,
  role,
  onboardingTable,
  onboardingId,
  requiredDocuments = []
}) {
  const [documentType, setDocumentType] = useState(
    requiredDocuments[0]?.value || ''
  )
  const [file, setFile] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const uploaderRef = useRef(null)
  const fileInputRef = useRef(null)

  const loadDocuments = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('onboarding_documents')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('onboarding_table', onboardingTable)
        .eq('onboarding_id', onboardingId)
        .order('document_type', { ascending: true })
        .order('version', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      setDocuments(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (onboardingId) {
      loadDocuments()
    }
  }, [onboardingId])

  const currentDocuments = useMemo(() => {
    return documents.filter((doc) => doc.is_current !== false)
  }, [documents])

  const historyDocuments = useMemo(() => {
    return documents.filter((doc) => doc.is_current === false)
  }, [documents])

  const rejectedCurrentDocuments = useMemo(() => {
    return currentDocuments.filter(
      (doc) => String(doc.upload_status || '').toLowerCase() === 'rejected'
    )
  }, [currentDocuments])

  const selectedCurrentDocument = useMemo(() => {
    return currentDocuments.find((doc) => doc.document_type === documentType) || null
  }, [currentDocuments, documentType])

  const sanitizeFileName = (name) => {
    return String(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')
  }

  const startReplace = (doc) => {
    setDocumentType(doc.document_type)
    setFile(null)
    setError('')
    setMessage(
      `Replace mode: ${formatDocType(doc.document_type)} · current version ${doc.version || 1}`
    )

    requestAnimationFrame(() => {
      if (uploaderRef.current) {
        uploaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.focus()
          fileInputRef.current.click()
        }
      }, 250)
    })
  }

  const handleUpload = async () => {
    try {
      if (!documentType) {
        setError('Please select a document type.')
        return
      }

      if (!file) {
        setError('Please choose a file to upload.')
        return
      }

      setUploading(true)
      setError('')
      setMessage('')

      const existingCurrent = currentDocuments.find(
        (doc) => doc.document_type === documentType
      )

      const safeName = sanitizeFileName(file.name)
      const filePath = `${ownerId}/${onboardingId}/${Date.now()}-${safeName}`

      const { error: storageError } = await supabase.storage
        .from(bucketId)
        .upload(filePath, file, { upsert: false })

      if (storageError) throw storageError

      if (existingCurrent) {
        const { error: oldRowError } = await supabase
          .from('onboarding_documents')
          .update({ is_current: false })
          .eq('id', existingCurrent.id)

        if (oldRowError) throw oldRowError
      }

      const nextVersion = existingCurrent
        ? Number(existingCurrent.version || 1) + 1
        : 1

      const { error: dbError } = await supabase
        .from('onboarding_documents')
        .insert({
          owner_id: ownerId,
          role,
          onboarding_table: onboardingTable,
          onboarding_id: onboardingId,
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          mime_type: file.type || null,
          upload_status: 'uploaded',
          verified: false,
          notes: null,
          replaced_document_id: existingCurrent?.id || null,
          version: nextVersion,
          is_current: true
        })

      if (dbError) throw dbError

      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setMessage(
        existingCurrent
          ? 'Replacement uploaded successfully. Previous version kept in history.'
          : 'Document uploaded successfully.'
      )

      await loadDocuments()
    } catch (err) {
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleView = async (filePath) => {
    try {
      setError('')

      const { data, error } = await supabase.storage
        .from(bucketId)
        .createSignedUrl(filePath, 60 * 10)

      if (error) throw error

      window.open(data.signedUrl, '_blank')
    } catch (err) {
      setError(err.message || 'Failed to open document')
    }
  }

  const resetPicker = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div style={card}>
      <h3 style={{ marginTop: 0 }}>Supporting Documents</h3>
      <p style={{ color: '#64748b', marginTop: 0 }}>
        Upload the required onboarding documents for review.
      </p>

      <ErrorState message={error} />
      {message ? <SuccessBox text={message} /> : null}

      {rejectedCurrentDocuments.length > 0 ? (
        <div style={noticeBox}>
          <div style={noticeTitle}>Documents needing correction</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {rejectedCurrentDocuments.map((doc) => (
              <div key={doc.id} style={noticeItem}>
                <div style={{ fontWeight: 700 }}>
                  {formatDocType(doc.document_type)} · Version {doc.version || 1}
                </div>
                <div style={{ fontSize: 13, color: '#9a3412', marginTop: 4 }}>
                  {doc.file_name}
                </div>
                <div style={noticeReason}>
                  <strong>Reviewer note:</strong> {doc.notes || 'Please replace this file.'}
                </div>

                <div style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => startReplace(doc)}
                    style={replaceBtn}
                  >
                    Replace This Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div ref={uploaderRef} style={uploadGrid}>
        <label style={field}>
          <span style={label}>Document type</span>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            style={input}
          >
            <option value="">Select document</option>
            {requiredDocuments.map((doc) => (
              <option key={doc.value} value={doc.value}>
                {doc.label}
              </option>
            ))}
          </select>
        </label>

        <label style={field}>
          <span style={label}>Choose file</span>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={input}
          />
        </label>

        <div style={{ display: 'flex', alignItems: 'end', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            style={primaryBtn}
          >
            {uploading
              ? 'Uploading...'
              : selectedCurrentDocument
              ? 'Replace Document'
              : 'Upload Document'}
          </button>

          <button
            type="button"
            onClick={resetPicker}
            disabled={uploading}
            style={secondaryBtn}
          >
            Clear
          </button>
        </div>
      </div>

      {selectedCurrentDocument ? (
        <div style={replaceHintBox}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            Current file for this document type
          </div>
          <div style={{ fontSize: 13, color: '#475569' }}>
            {selectedCurrentDocument.file_name} · Version {selectedCurrentDocument.version || 1}
          </div>
          {selectedCurrentDocument.upload_status === 'rejected' && selectedCurrentDocument.notes ? (
            <div style={{ marginTop: 8, color: '#9a3412', fontSize: 13 }}>
              <strong>Reviewer note:</strong> {selectedCurrentDocument.notes}
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ marginTop: 18 }}>
        <h4 style={{ marginBottom: 10 }}>Current Documents</h4>

        {loading ? (
          <div style={{ color: '#64748b' }}>Loading documents...</div>
        ) : currentDocuments.length === 0 ? (
          <div style={emptyBox}>No documents uploaded yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {currentDocuments.map((doc) => (
              <div key={doc.id} style={docRow}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={docHeader}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={docTitle}>
                        {formatDocType(doc.document_type)} · Version {doc.version || 1}
                      </div>
                      <div style={docFileName}>
                        {doc.file_name}
                      </div>
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

                  <div style={docMeta}>
                    Uploaded: {formatDate(doc.created_at)}
                  </div>

                  {doc.notes ? (
                    <div style={docNoteBox}>
                      <strong>Reviewer note:</strong> {doc.notes}
                    </div>
                  ) : null}

                  <div style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => startReplace(doc)}
                      style={secondaryBtn}
                    >
                      Replace This Document
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleView(doc.file_path)}
                  style={secondaryBtn}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {historyDocuments.length > 0 ? (
        <div style={{ marginTop: 18 }}>
          <h4 style={{ marginBottom: 10 }}>Document History</h4>
          <div style={{ display: 'grid', gap: 10 }}>
            {historyDocuments.map((doc) => (
              <div key={doc.id} style={historyRow}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={docTitle}>
                    {formatDocType(doc.document_type)} · Version {doc.version || 1}
                  </div>
                  <div style={docFileName}>
                    {doc.file_name}
                  </div>
                  <div style={docMeta}>
                    Historical version · Uploaded: {formatDate(doc.created_at)}
                  </div>
                  {doc.notes ? (
                    <div style={docNoteBox}>
                      <strong>Reviewer note:</strong> {doc.notes}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => handleView(doc.file_path)}
                  style={secondaryBtn}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function formatDocType(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return '-'
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

function SuccessBox({ text }) {
  return <div style={successBox}>{text}</div>
}

const card = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 16,
  marginTop: 16
}

const noticeBox = {
  background: '#fff7ed',
  color: '#9a3412',
  border: '1px solid #fdba74',
  borderRadius: 12,
  padding: 14,
  marginBottom: 16
}

const noticeTitle = {
  fontWeight: 700,
  marginBottom: 10
}

const noticeItem = {
  border: '1px solid #fdba74',
  borderRadius: 10,
  padding: 10,
  background: '#fffbeb'
}

const noticeReason = {
  marginTop: 6,
  fontSize: 13,
  lineHeight: 1.45
}

const replaceHintBox = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 12,
  marginTop: 14
}

const uploadGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14
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
  background: '#fff'
}

const primaryBtn = {
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 700
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

const replaceBtn = {
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '10px 14px',
  cursor: 'pointer',
  fontWeight: 700
}

const docRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 12
}

const historyRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  border: '1px dashed #cbd5e1',
  borderRadius: 12,
  padding: 12,
  background: '#f8fafc'
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

const docMeta = {
  fontSize: 12,
  color: '#64748b',
  marginTop: 8
}

const docNoteBox = {
  background: '#fff7ed',
  color: '#9a3412',
  border: '1px solid #fdba74',
  borderRadius: 10,
  padding: 10,
  marginTop: 10,
  fontSize: 13,
  lineHeight: 1.45
}

const emptyBox = {
  border: '1px dashed #cbd5e1',
  borderRadius: 12,
  padding: 16,
  color: '#64748b'
}

const successBox = {
  background: '#ecfdf5',
  color: '#047857',
  border: '1px solid #a7f3d0',
  padding: 12,
  borderRadius: 12,
  marginBottom: 16
}