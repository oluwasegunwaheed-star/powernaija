import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

function BankDashboard() {
  const [banks, setBanks] = useState([])
  const [requests, setRequests] = useState([])

  const [bankData, setBankData] = useState({
    name: '',
    interest_rate: '',
    loan_duration: '',
    terms: '',
  })

  useEffect(() => {
    fetchBanks()
    fetchFinancingRequests()
  }, [])

  // 📥 Fetch banks
  const fetchBanks = async () => {
    const { data } = await supabase.from('banks').select('*')
    setBanks(data || [])
  }

  // 📥 Fetch financing requests
  const fetchFinancingRequests = async () => {
    const { data } = await supabase
      .from('financing_requests')
      .select('*')
      .order('created_at', { ascending: false })

    setRequests(data || [])
  }

  // 📝 Handle input
  const handleChange = (field, value) => {
    setBankData({
      ...bankData,
      [field]: value,
    })
  }

  // ➕ Add bank
  const addBank = async () => {
    if (!bankData.name || !bankData.interest_rate || !bankData.loan_duration || !bankData.terms) {
      alert('Fill all fields')
      return
    }

    await supabase.from('banks').insert([
      {
        name: bankData.name,
        interest_rate: Number(bankData.interest_rate),
        loan_duration: bankData.loan_duration,
        terms: bankData.terms,
      },
    ])

    alert('Bank added successfully')
    fetchBanks()
  }

  // ✅ Approve
  const approveRequest = async (id) => {
    await supabase
      .from('financing_requests')
      .update({ status: 'approved' })
      .eq('id', id)

    fetchFinancingRequests()
  }

  // ❌ Reject
  const rejectRequest = async (id) => {
    await supabase
      .from('financing_requests')
      .update({ status: 'rejected' })
      .eq('id', id)

    fetchFinancingRequests()
  }

  return (
    <div style={styles.container}>
      <h2>Bank Dashboard 🏦</h2>

      {/* ADD BANK */}
      <div style={styles.card}>
        <h3>Add Bank</h3>

        <input
          style={styles.input}
          placeholder="Bank Name"
          onChange={(e) => handleChange('name', e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Interest Rate"
          onChange={(e) => handleChange('interest_rate', e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Loan Duration"
          onChange={(e) => handleChange('loan_duration', e.target.value)}
        />

        <textarea
          style={styles.textarea}
          placeholder="Bank Terms"
          onChange={(e) => handleChange('terms', e.target.value)}
        />

        <button style={styles.button} onClick={addBank}>
          Add Bank
        </button>
      </div>

      {/* BANK LIST */}
      <h3>Available Banks</h3>
      {banks.map((bank) => (
        <div key={bank.id} style={styles.card}>
          <p><strong>{bank.name}</strong></p>
          <p>Interest: {bank.interest_rate}%</p>
          <p>Duration: {bank.loan_duration}</p>
          <p>{bank.terms}</p>
        </div>
      ))}

      {/* FINANCING REQUESTS */}
      <h3>Financing Requests</h3>

      {requests.map((req) => (
        <div key={req.id} style={styles.card}>
          <p><strong>Quote ID:</strong> {req.quote_id}</p>
          <p><strong>Status:</strong> {req.status}</p>

          <button style={styles.button} onClick={() => approveRequest(req.id)}>
            Approve
          </button>

          <button style={styles.button} onClick={() => rejectRequest(req.id)}>
            Reject
          </button>
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
  card: {
    background: '#1B263B',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    borderRadius: '6px',
    border: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    borderRadius: '6px',
    border: 'none',
  },
  button: {
    background: '#FFC107',
    border: 'none',
    padding: '10px',
    marginTop: '5px',
    width: '100%',
    borderRadius: '6px',
    cursor: 'pointer',
  },
}

export default BankDashboard