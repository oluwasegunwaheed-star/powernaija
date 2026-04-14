import { useState } from 'react'
import EnergyCalculator from './EnergyCalculator'
import InstallerDashboard from './InstallerDashboard'
import BankDashboard from './BankDashboard'
import AdminDashboard from './AdminDashboard'
import Auth from './Auth'

function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('user')

  if (!user) {
    return <Auth setUser={setUser} />
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>PowerNaija ⚡</h2>

      {/* NAV */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setPage('user')}>User</button>
        <button onClick={() => setPage('installer')}>Installer</button>
        <button onClick={() => setPage('bank')}>Bank</button>
        <button onClick={() => setPage('admin')}>Admin</button>
        <button onClick={() => setUser(null)}>Logout</button>
      </div>

      {/* PAGES */}
      {page === 'user' && <EnergyCalculator />}
      {page === 'installer' && <InstallerDashboard />}
      {page === 'bank' && <BankDashboard />}
      {page === 'admin' && <AdminDashboard />}
    </div>
  )
}

export default App