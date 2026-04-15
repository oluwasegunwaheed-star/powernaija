import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Layout from './Layout'

import EnergyCalculator from './EnergyCalculator'
import InstallerDashboard from './InstallerDashboard'
import BankDashboard from './BankDashboard'
import AdminDashboard from './AdminDashboard'
import Auth from './Auth'

function App() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [page, setPage] = useState('user') // default view

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setUser(user)

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        console.log(error)
        setRole('user')
      } else {
        setRole(data?.role || 'user')
        // ❌ DO NOT force page here anymore
      }
    }
  }

  // 🔐 LOGIN SCREEN
  if (!user) {
    return <Auth setUser={setUser} />
  }

  // 🔄 PAGE SWITCHING
  const renderPage = () => {
    switch (page) {
      case 'installer':
        return <InstallerDashboard />

      case 'bank':
        return <BankDashboard />

      case 'admin':
        return <AdminDashboard />

      case 'user':
      default:
        return <EnergyCalculator />
    }
  }

  return (
    <Layout role={role} page={page} setPage={setPage}>
      {renderPage()}
    </Layout>
  )
}

export default App