import { useState } from 'react'
import EnergyCalculator from './EnergyCalculator'
import InstallerDashboard from './InstallerDashboard'
import BankDashboard from './BankDashboard' // ✅ IMPORTANT
import Auth from './Auth'

function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('user')

  // 🔐 If not logged in → show login page
  if (!user) {
    return <Auth setUser={setUser} />
  }

  return (
    <div style={styles.container}>
      <h2>PowerNaija ⚡</h2>

      {/* NAVIGATION */}
      <div style={styles.nav}>
        <button onClick={() => setPage('user')}>
          User App
        </button>

        <button onClick={() => setPage('installer')}>
          Installer Dashboard
        </button>

        <button onClick={() => setPage('bank')}>
          Bank Dashboard
        </button>

        <button onClick={() => setUser(null)}>
          Logout
        </button>
      </div>

      {/* PAGE DISPLAY */}
      <div style={{ marginTop: '20px' }}>
        {page === 'user' && <EnergyCalculator />}
        {page === 'installer' && <InstallerDashboard />}
        {page === 'bank' && <BankDashboard />}
      </div>
    </div>
  )
}

// 🎨 Styling
const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
  },
  nav: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
}

export default App