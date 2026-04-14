import { useState } from 'react'
import EnergyCalculator from './EnergyCalculator'
import InstallerDashboard from './InstallerDashboard'
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

      <button onClick={() => setPage('user')}>User App</button>
      <button onClick={() => setPage('installer')}>
        Installer Dashboard
      </button>

      <button onClick={() => setUser(null)} style={{ marginLeft: '10px' }}>
        Logout
      </button>

      <div style={{ marginTop: '20px' }}>
        {page === 'user' ? <EnergyCalculator /> : <InstallerDashboard />}
      </div>
    </div>
  )
}

export default App