import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

function InstallerDashboard() {
  const [requests, setRequests] = useState([])
  const [quotes, setQuotes] = useState([])
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchRequests()
    fetchQuotes()
  }, [])

  // 📥 Fetch requests
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setRequests(data)
  }

  // 📥 Fetch quotes
  const fetchQuotes = async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setQuotes(data)
  }

  // 📝 Handle input
  const handleInputChange = (requestId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [field]: value,
      },
    }))
  }

  // 📤 Submit quote (FINAL FIXED)
  const submitQuote = async (requestId) => {
    const data = formData[requestId]

    console.log("FULL FORM DATA:", data)
    console.log("TERMS VALUE:", data?.terms)

    if (!data || !data.price || !data.monthly || !data.timeline) {
      alert('Please fill all fields')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('User not logged in')
      return
    }

    // 🔥 FORCE TERMS VALUE (guaranteed not NULL)
    const termsValue = data?.terms?.trim() || "DEFAULT TERMS"

    console.log("FINAL TERMS SENT:", termsValue)

    const { error } = await supabase.from('quotes').insert([
      {
        request_id: requestId,
        installer_name: 'SolarTech Ltd',
        price: Number(data.price),
        monthly_plan: Number(data.monthly),
        timeline: data.timeline,
        terms: termsValue,
        user_id: user.id,
        status: 'pending',
      },
    ])

    if (error) {
      console.log(error)
      alert('Error submitting quote')
    } else {
      alert('Quote submitted successfully!')
      fetchQuotes()

      // Reset form
      setFormData((prev) => ({
        ...prev,
        [requestId]: {},
      }))
    }
  }

  return (
    <div style={styles.container}>
      <h2>Installer Dashboard 👷</h2>

      {/* REQUESTS */}
      {requests.map((req) => (
        <div key={req.id} style={styles.card}>
          <p><strong>System Size:</strong> {req.system_size} kVA</p>

          <input
            style={styles.input}
            placeholder="Total Price (₦)"
            value={formData[req.id]?.price || ""}
            onChange={(e) =>
              handleInputChange(req.id, 'price', e.target.value)
            }
          />

          <input
            style={styles.input}
            placeholder="Monthly Plan (₦)"
            value={formData[req.id]?.monthly || ""}
            onChange={(e) =>
              handleInputChange(req.id, 'monthly', e.target.value)
            }
          />

          <input
            style={styles.input}
            placeholder="Installation Timeline"
            value={formData[req.id]?.timeline || ""}
            onChange={(e) =>
              handleInputChange(req.id, 'timeline', e.target.value)
            }
          />

          {/* ✅ CONTROLLED TEXTAREA (FIXED) */}
          <textarea
            style={styles.textarea}
            placeholder="Installer Terms & Conditions"
            value={formData[req.id]?.terms || ""}
            onChange={(e) =>
              handleInputChange(req.id, 'terms', e.target.value)
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

      {/* QUOTES DISPLAY */}
      <h3>Submitted Quotes</h3>

      {quotes.length === 0 && <p>No quotes yet</p>}

      {quotes.map((quote) => (
        <div key={quote.id} style={styles.card}>
          <p><strong>Installer:</strong> {quote.installer_name}</p>
          <p><strong>Price:</strong> ₦{quote.price}</p>
          <p><strong>Monthly:</strong> ₦{quote.monthly_plan}</p>
          <p><strong>Timeline:</strong> {quote.timeline}</p>

          <p>
            <strong>Terms:</strong> {quote.terms || "No terms provided"}
          </p>
        </div>
      ))}
    </div>
  )
}

// 🎨 Styles
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
  textarea: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    borderRadius: '6px',
    border: 'none',
    minHeight: '80px',
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