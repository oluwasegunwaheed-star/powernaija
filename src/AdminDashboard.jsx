import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function AdminDashboard() {
  const [payments, setPayments] = useState([])
  const [quotes, setQuotes] = useState([])
  const [financing, setFinancing] = useState([])

  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    const { data: paymentsData } = await supabase.from('payments').select('*')
    const { data: quotesData } = await supabase.from('quotes').select('*')
    const { data: financingData } = await supabase.from('financing_requests').select('*')

    setPayments(paymentsData || [])
    setQuotes(quotesData || [])
    setFinancing(financingData || [])

    const revenue =
      paymentsData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    setTotalRevenue(revenue)
  }

  // 📊 Revenue by date
  const revenueData = payments.map((p) => ({
    date: new Date(p.created_at).toLocaleDateString(),
    amount: Number(p.amount),
  }))

  // 📊 Financing status
  const statusData = [
    {
      name: 'Approved',
      value: financing.filter((f) => f.status === 'approved').length,
    },
    {
      name: 'Pending',
      value: financing.filter((f) => f.status === 'pending').length,
    },
    {
      name: 'Rejected',
      value: financing.filter((f) => f.status === 'rejected').length,
    },
  ]

  return (
    <div style={styles.container}>
      <h2>Admin Dashboard 📊</h2>

      {/* SUMMARY */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Total Revenue</h3>
          <p>₦{totalRevenue}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Payments</h3>
          <p>{payments.length}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Quotes</h3>
          <p>{quotes.length}</p>
        </div>

        <div style={styles.card}>
          <h3>Financing Requests</h3>
          <p>{financing.length}</p>
        </div>
      </div>

      {/* 📈 REVENUE CHART */}
      <h3>Revenue Over Time</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#FFC107" />
        </LineChart>
      </ResponsiveContainer>

      {/* 📊 BAR CHART */}
      <h3>Payments Chart</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#00C49F" />
        </BarChart>
      </ResponsiveContainer>

      {/* 🥧 PIE CHART */}
      <h3>Financing Status</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={statusData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
          >
            {statusData.map((entry, index) => (
              <Cell key={index} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* PAYMENT LIST */}
      <h3>Payment History</h3>

      {payments.map((p) => (
        <div key={p.id} style={styles.card}>
          <p><strong>Amount:</strong> ₦{p.amount}</p>
          <p><strong>Status:</strong> {p.status}</p>
          <p><strong>Reference:</strong> {p.reference}</p>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {
    background: '#0D1B2A',
    minHeight: '100vh',
    padding: '20px',
    color: 'white',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  card: {
    background: '#1B263B',
    padding: '15px',
    borderRadius: '10px',
  },
}

export default AdminDashboard