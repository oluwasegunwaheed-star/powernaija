import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

function InstallerDashboard() {
  const [requests, setRequests] = useState([])
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })

    setRequests(data || [])
  }

  const handleChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }

  const submitQuote = async (requestId) => {
    const data = formData[requestId]

    if (!data?.price || !data?.monthly || !data?.timeline || !data?.terms) {
      alert('Fill all fields')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from('quotes').insert([
      {
        request_id: requestId,
        installer_name: 'SolarTech Ltd',
        price: Number(data.price),
        monthly_plan: Number(data.monthly),
        timeline: data.timeline,
        terms: data.terms,
        user_id: user.id,
      },
    ])

    alert('Quote submitted!')
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>👷 Installer Dashboard</h1>

      {requests.map((req) => (
        <div key={req.id} style={styles.card}>
          <h3>⚡ {req.system_size} kVA System</h3>

          <div style={styles.grid}>
            <input
              placeholder="Total Price (₦)"
              style={styles.input}
              onChange={(e) =>
                handleChange(req.id, 'price', e.target.value)
              }
            />

            <input
              placeholder="Monthly Plan"
              style={styles.input}
              onChange={(e) =>
                handleChange(req.id, 'monthly', e.target.value)
              }
            />

            <input
              placeholder="Timeline"
              style={styles.input}
              onChange={(e) =>
                handleChange(req.id, 'timeline', e.target.value)
              }
            />
          </div>

          <textarea
            placeholder="Terms & Conditions"
            style={styles.textarea}
            onChange={(e) =>
              handleChange(req.id, 'terms', e.target.value)
            }
          />

          <button style={styles.button} onClick={() => submitQuote(req.id)}>
            🚀 Submit Quote
          </button>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {
    background: 'linear-gradient(135deg,#0D1B2A,#1B263B)',
    minHeight: '100vh',
    padding: '30px',
    color: 'white',
  },
  title: {
    fontSize: '28px',
    marginBottom: '20px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    backdropFilter: 'blur(10px)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
  },
  textarea: {
    width: '100%',
    marginTop: '10px',
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
  },
  button: {
    marginTop: '10px',
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(90deg,#FFC107,#ffdd57)',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
}

export default InstallerDashboard