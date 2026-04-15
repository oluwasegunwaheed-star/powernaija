import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import {
  DashboardCard,
  SkeletonCard,
  EmptyState,
} from './components/UI'

function AdminDashboard() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const { data } = await supabase
        .from('payments')
        .select('*')

      setPayments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  )

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <SkeletonCard />
      </div>
    )
  }

  // 📭 EMPTY STATE
  if (payments.length === 0) {
    return <EmptyState text="No payments yet" />
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>📊 Admin Dashboard</h2>

      <div style={styles.grid}>
        <DashboardCard
          title="Total Revenue"
          value={`₦${totalRevenue}`}
        />

        <DashboardCard
          title="Total Payments"
          value={payments.length}
        />
      </div>
    </div>
  )
}

const styles = {
  grid: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
}

export default AdminDashboard