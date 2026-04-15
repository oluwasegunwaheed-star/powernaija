import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import toast from 'react-hot-toast'

function BankDashboard() {
  const [requests, setRequests] = useState([])

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('financing_requests')
      .select('*')

    setRequests(data || [])
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('financing_requests')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error('Failed')
    } else {
      toast.success(`Marked as ${status}`)
      fetchRequests()
    }
  }

  return (
    <div style={styles.container}>
      <h2>🏦 Bank Dashboard</h2>

      {requests.map(r => (
        <div key={r.id} style={styles.card}>
          <p><strong>Quote ID:</strong> {r.quote_id}</p>
          <p><strong>Status:</strong> {r.status}</p>

          <div style={styles.actions}>
            <button
              style={styles.approve}
              onClick={() => updateStatus(r.id, 'approved')}
            >
              Approve
            </button>

            <button
              style={styles.reject}
              onClick={() => updateStatus(r.id, 'rejected')}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: { padding: '20px' },

  card: {
    background: '#fff',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '10px',
  },

  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },

  approve: {
    background: 'green',
    color: '#fff',
    border: 'none',
    padding: '8px',
    borderRadius: '5px',
  },

  reject: {
    background: 'red',
    color: '#fff',
    border: 'none',
    padding: '8px',
    borderRadius: '5px',
  },
}

export default BankDashboard