import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import DashboardRouter from './DashboardRouter'
import AuthPage from './AuthPage'
import LandingPage from './Pages/LandingPage'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import TermsOfUse from './Pages/TermsOfUse'

function getRoute() {
  const path = window.location.pathname.toLowerCase()

  if (path === '/auth') return 'auth'
  if (path === '/dashboard') return 'dashboard'
  if (path === '/privacy-policy') return 'privacy'
  if (path === '/terms-of-use') return 'terms'
  return 'landing'
}

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

async function fetchProfileWithTimeout(userId, timeoutMs = 8000) {
  const profilePromise = supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Profile query timed out')), timeoutMs)
  )

  const result = await Promise.race([profilePromise, timeoutPromise])

  if (result?.error) throw result.error
  return result?.data || null
}

export default function App() {
  const [route, setRoute] = useState(getRoute())
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [booting, setBooting] = useState(true)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onPopState = () => setRoute(getRoute())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        setError('')

        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!mounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (!currentUser) {
          setProfile(null)
          setBooting(false)
          return
        }

        try {
          const loadedProfile = await fetchProfileWithTimeout(currentUser.id, 8000)
          if (!mounted) return
          setProfile(loadedProfile)
        } catch (profileErr) {
          if (!mounted) return
          console.error('Profile load error:', profileErr)
          setProfile(null)
          setError(profileErr.message || 'Failed to load profile')
        }
      } catch (err) {
        if (!mounted) return
        console.error('App init error:', err)
        setError(err.message || 'Failed to initialize app')
      } finally {
        if (mounted) setBooting(false)
      }
    }

    init()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setError('')

      if (!currentUser) {
        setProfile(null)
        setDashboardLoading(false)
        navigate('/')
        return
      }

      setDashboardLoading(true)

      try {
        const loadedProfile = await fetchProfileWithTimeout(currentUser.id, 8000)
        setProfile(loadedProfile)
        navigate('/dashboard')
      } catch (err) {
        console.error('Auth state profile load error:', err)
        setProfile(null)
        setError(err.message || 'Failed to load profile after sign in')
        navigate('/auth')
      } finally {
        setDashboardLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const openLanding = () => navigate('/')
  const openAuth = () => navigate('/auth')
  const openDashboard = () => navigate('/dashboard')
  const openPrivacy = () => navigate('/privacy-policy')
  const openTerms = () => navigate('/terms-of-use')

  if (route === 'landing') {
    return (
      <>
        {error ? <TopErrorBanner text={error} /> : null}
        <LandingPage
          onGetStarted={openAuth}
          onSignIn={openAuth}
          onOpenDashboard={openDashboard}
          onOpenPrivacy={openPrivacy}
          onOpenTerms={openTerms}
          isLoggedIn={!!user}
        />
      </>
    )
  }

  if (route === 'privacy') {
    return <PrivacyPolicy onBackHome={openLanding} onSignIn={openAuth} />
  }

  if (route === 'terms') {
    return <TermsOfUse onBackHome={openLanding} onSignIn={openAuth} />
  }

  if (route === 'auth') {
    if (user && profile) {
      return <DashboardRouter user={user} profile={profile} />
    }

    return (
      <>
        {error ? <TopErrorBanner text={error} /> : null}
        <AuthPage />
      </>
    )
  }

  if (route === 'dashboard') {
    if (booting || dashboardLoading) {
      return (
        <div style={loadingPage}>
          <div style={loadingCard}>
            <div style={spinner} />
            <div style={loadingTitle}>Loading PowerNaija...</div>
            <div style={loadingText}>Preparing your workspace</div>
          </div>
        </div>
      )
    }

    if (!user) {
      return (
        <>
          {error ? <TopErrorBanner text={error} /> : null}
          <LandingPage
            onGetStarted={openAuth}
            onSignIn={openAuth}
            onOpenDashboard={openDashboard}
            onOpenPrivacy={openPrivacy}
            onOpenTerms={openTerms}
            isLoggedIn={false}
          />
        </>
      )
    }

    if (!profile) {
      return (
        <div style={loadingPage}>
          <div style={loadingCard}>
            <div style={loadingTitle}>Profile not available</div>
            <div style={loadingText}>
              Sign in again or check that this account has a profile row in Supabase.
            </div>
            <div style={{ marginTop: 16 }}>
              <button type="button" onClick={openAuth} style={retryBtn}>
                Go to Sign In
              </button>
            </div>
            {error ? <div style={inlineError}>{error}</div> : null}
          </div>
        </div>
      )
    }

    return <DashboardRouter user={user} profile={profile} />
  }

  return (
    <>
      {error ? <TopErrorBanner text={error} /> : null}
      <LandingPage
        onGetStarted={openAuth}
        onSignIn={openAuth}
        onOpenDashboard={openDashboard}
        onOpenPrivacy={openPrivacy}
        onOpenTerms={openTerms}
        isLoggedIn={!!user}
      />
    </>
  )
}

function TopErrorBanner({ text }) {
  return (
    <div style={topErrorWrap}>
      <div style={topErrorBox}>
        <strong style={{ marginRight: 8 }}>Notice:</strong>
        {text}
      </div>
    </div>
  )
}

const topErrorWrap = {
  position: 'fixed',
  top: 16,
  left: 16,
  right: 16,
  zIndex: 9999,
  display: 'flex',
  justifyContent: 'center'
}

const topErrorBox = {
  maxWidth: 900,
  width: '100%',
  background: '#fff7ed',
  color: '#9a3412',
  border: '1px solid #fdba74',
  borderRadius: 14,
  padding: '12px 14px',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.10)'
}

const loadingPage = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
  padding: 20
}

const loadingCard = {
  width: '100%',
  maxWidth: 420,
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid #e2e8f0',
  borderRadius: 24,
  padding: 28,
  textAlign: 'center',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.10)'
}

const spinner = {
  width: 42,
  height: 42,
  borderRadius: '50%',
  border: '4px solid #dbeafe',
  borderTop: '4px solid #2563eb',
  margin: '0 auto 16px auto',
  animation: 'spin 1s linear infinite'
}

const loadingTitle = {
  fontSize: 22,
  fontWeight: 900,
  color: '#0f172a'
}

const loadingText = {
  marginTop: 8,
  color: '#64748b',
  lineHeight: 1.5
}

const retryBtn = {
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 14,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 800
}

const inlineError = {
  marginTop: 14,
  background: '#fff7ed',
  color: '#9a3412',
  border: '1px solid #fdba74',
  borderRadius: 12,
  padding: 12,
  textAlign: 'left'
}