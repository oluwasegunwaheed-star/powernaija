import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

function InstallerDashboard() {
  const [requests, setRequests] = useState([])
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchRequests()
  }, [])

  // 📥 Fetch all requests
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
    } else {
      setRequests(data)
    }
  }

  // 📝 Handle input per request
  const handleInputChange = (requestId, field, value) => {
    setFormData({
      ...formData,
      [requestId]: {
        ...formData[requestId],
        [field]: value,
      },
    })
  }

  // 📤 Submit quote WITH USER ID
  const submitQuote = async (requestId) => {
    const data = formData[requestId]

    if (!data || !data.price || !data.monthly || !data.timeline) {
      alert('Please fill all fields')
      return
    }

    // 🔥 GET CURRENT LOGGED-IN USER
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("CURRENT USER:", user)

    if (userError || !user) {
      alert('User not logged in')
      return
    }

    // 🔥 INSERT QUOTE WITH USER ID
    const { error } = await supabase.from('quotes').insert([
      {
        request_id: requestId,
        installer_name: 'SolarTech Ltd',
        price: data.price,
        monthly_plan: data.monthly,
        timeline: data.timeline,
        user_id: user.id, // ✅ FIXED HERE
      },
    ])

    if (error) {
      console.log(error)
      alert('Error submitting quote')
    } else {
      alert('Quote submitted successfully!')
    }
  }

  return (
    <div style={styles.container}>
      <h2>Installer Dashboard 👷</h2>

      {requests.length === 0 && <p>No requests available</p>}

      {requests.map((req) => (
        <div key={req.id} style={styles.card}>
          <p><strong>System Size:</strong> {req.system_size} kVA</p>

          <input
            style={styles.input}
            placeholder="Price"
            onChange={(e) =>
              handleInputChange(req.id, 'price', e.target.value)
            }
          />

          <input
            style={styles.input}
            placeholder="Monthly Plan"
            onChange={(e) =>
              handleInputChange(req.id, 'monthly', e.target.value)
            }
          />

          <input
            style={styles.input}
            placeholder="Timeline"
            onChange={(e) =>
              handleInputChange(req.id, 'timeline', e.target.value)
            }
          />

          <button
            style={styles.button}
            onClick={() => submitQuote(req.id)}
          >
            Submit Quote
          </button>
        </div>
      ))}
    </div>
  )
}

// 🎨 Styling
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
    display: 'block',
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
    width: '100%',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
}

export default InstallerDashboard