import { useState } from 'react'
import { supabase } from './lib/supabaseClient'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) setError(error.message)

    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Account created. Check your email if confirmation is enabled.')
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff, #f8fafc)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 20,
          padding: 28,
          border: '1px solid #e5e7eb',
          boxShadow: '0 12px 40px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <h1 style={{ margin: 0, fontSize: 30 }}>⚡ PowerNaija</h1>
          <p style={{ color: '#6b7280', marginTop: 8 }}>
            Solar financing made simple
          </p>
        </div>

        <form onSubmit={handleSignIn} style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={inputStyle}
            />
          </div>

          {error && <div style={errorStyle}>{error}</div>}
          {message && <div style={successStyle}>{message}</div>}

          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            style={secondaryButton}
          >
            {loading ? 'Please wait...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #d1d5db',
  outline: 'none',
  boxSizing: 'border-box'
}

const primaryButton = {
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: 12,
  padding: '12px 14px',
  cursor: 'pointer',
  fontWeight: 700
}

const secondaryButton = {
  background: '#111827',
  color: '#ffffff',
  border: 'none',
  borderRadius: 12,
  padding: '12px 14px',
  cursor: 'pointer',
  fontWeight: 700
}

const errorStyle = {
  background: '#fef2f2',
  color: '#b91c1c',
  border: '1px solid #fecaca',
  borderRadius: 12,
  padding: 12,
  fontSize: 14
}

const successStyle = {
  background: '#ecfdf5',
  color: '#047857',
  border: '1px solid #a7f3d0',
  borderRadius: 12,
  padding: 12,
  fontSize: 14
}