import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import DashboardRouter from './DashboardRouter'
import AuthPage from './AuthPage'

export default function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stage, setStage] = useState('starting')

  const withTimeout = async (promise, ms, timeoutMessage) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMessage)), ms)
      )
    ])
  }

  const buildFallbackProfile = (currentUser) => {
    const email = String(currentUser?.email || '').toLowerCase()

    let role = 'user'
    let onboarding_status = 'draft'

    if (email === 'oluwasegunwaheed@gmail.com') {
      role = 'admin'
      onboarding_status = 'approved'
    } else if (email === 'oluwasegunwaheed+installer@gmail.com') {
      role = 'installer'
      onboarding_status = 'approved'
    } else if (email === 'oluwasegunwaheed+bank@gmail.com') {
      role = 'bank'
      onboarding_status = 'draft'
    } else if (email === 'oluwasegunwaheed+user@gmail.com') {
      role = 'user'
      onboarding_status = 'draft'
    }

    return {
      id: currentUser.id,
      email: currentUser.email,
      full_name: currentUser.user_metadata?.full_name || '',
      role,
      onboarding_status
    }
  }

  const fetchOrCreateProfile = async (currentUser) => {
    try {
      setStage('querying profile by id')

      const idResult = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle(),
        5000,
        'Profile query by id timed out'
      )

      if (idResult.error) throw idResult.error
      if (idResult.data) {
        setStage('profile found by id')
        return idResult.data
      }
    } catch (err) {
      console.warn('Profile lookup by id failed:', err.message)
    }

    try {
      setStage('querying profile by email')

      const emailResult = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('email', currentUser.email)
          .maybeSingle(),
        5000,
        'Profile query by email timed out'
      )

      if (emailResult.error) throw emailResult.error
      if (emailResult.data) {
        setStage('profile found by email')
        return emailResult.data
      }
    } catch (err) {
      console.warn('Profile lookup by email failed:', err.message)
    }

    try {
      setStage('creating profile')

      const insertResult = await withTimeout(
        supabase
          .from('profiles')
          .insert({
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.user_metadata?.full_name || '',
            role: 'user',
            onboarding_status: 'draft'
          })
          .select('*')
          .single(),
        5000,
        'Profile insert timed out'
      )

      if (insertResult.error) throw insertResult.error

      setStage('profile created')
      return insertResult.data
    } catch (err) {
      console.warn('Profile insert failed:', err.message)
    }

    setStage('using fallback profile')
    return buildFallbackProfile(currentUser)
  }

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        setLoading(true)
        setError('')
        setStage('getting auth user')

        const {
          data: { user: currentUser }
        } = await supabase.auth.getUser()

        if (!mounted) return

        setUser(currentUser)

        if (!currentUser) {
          setProfile(null)
          setLoading(false)
          setStage('no auth user')
          return
        }

        const profileData = await fetchOrCreateProfile(currentUser)

        if (!mounted) return

        setProfile(profileData)
        setStage('ready')
      } catch (err) {
        if (!mounted) return
        setError(err.message || 'Failed to load profile')
        setStage('error')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null

      if (!mounted) return

      setUser(currentUser)

      if (!currentUser) {
        setProfile(null)
        setError('')
        setLoading(false)
        setStage('signed out')
        return
      }

      try {
        setLoading(true)
        setError('')
        setStage('auth state changed')

        const profileData = await fetchOrCreateProfile(currentUser)

        if (!mounted) return

        setProfile(profileData)
        setStage('ready')
      } catch (err) {
        if (!mounted) return
        setError(err.message || 'Failed to load profile')
        setStage('error')
      } finally {
        if (mounted) setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Loading profile...</h3>
        <p>Stage: {stage}</p>
        <p>User loaded: {user ? 'Yes' : 'No'}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: 'red' }}>
        <h3>Error loading app</h3>
        <p>{error}</p>
        <p>Stage: {stage}</p>
      </div>
    )
  }

  if (!user) return <AuthPage />
  if (!profile) return <div style={{ padding: 24 }}>No profile found.</div>

  return <DashboardRouter user={user} profile={profile} />
}