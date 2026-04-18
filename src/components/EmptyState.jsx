export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: 24,
        textAlign: 'center',
        border: '1px solid #e5e7eb'
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: '#6b7280', marginTop: 0, marginBottom: 16 }}>
        {description}
      </p>

      {actionLabel && (
        <button
          onClick={onAction}
          style={{
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: 10,
            padding: '10px 14px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}