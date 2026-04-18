export default function ErrorState({ message }) {
  if (!message || !String(message).trim()) return null

  return (
    <div
      style={{
        background: '#fef2f2',
        color: '#b91c1c',
        border: '1px solid #fecaca',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16
      }}
    >
      <strong>Error:</strong> {message}
    </div>
  )
}