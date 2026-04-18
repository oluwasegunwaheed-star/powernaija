export default function RejectionNotice({ profile, localReason }) {
  const status = String(profile?.onboarding_status || '').toLowerCase()
  const reason = localReason || profile?.rejection_reason || ''

  if (status !== 'rejected' || !String(reason).trim()) return null

  return (
    <div
      style={{
        background: '#fff7ed',
        color: '#9a3412',
        border: '1px solid #fdba74',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Onboarding returned for correction
      </div>
      <div style={{ lineHeight: 1.5 }}>
        <strong>Reason:</strong> {reason}
      </div>
      <div style={{ marginTop: 8, fontSize: 13 }}>
        Update the form, upload corrected documents if needed, then submit again.
      </div>
    </div>
  )
}