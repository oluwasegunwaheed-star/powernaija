import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'

function EnergyCalculator() {
  const [tvs, setTvs] = useState(0)
  const [fridges, setFridges] = useState(0)
  const [acs, setAcs] = useState(0)
  const [lights, setLights] = useState(0)

  const [result, setResult] = useState(null)
  const [quotes, setQuotes] = useState([])

  // 🔌 Load Paystack script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  // 🔋 Calculate Energy
  const calculateEnergy = () => {
    const totalLoad =
      Number(tvs) * 100 +
      Number(fridges) * 300 +
      Number(acs) * 1500 +
      Number(lights) * 20

    const systemSize = (totalLoad / 1000).toFixed(2)
    const monthlyCost = (systemSize * 25000).toFixed(0)

    setResult({ systemSize, monthlyCost })
  }

  // 📥 Save Request
  const submitRequest = async () => {
    if (!result) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('User not logged in')
      return
    }

    const { error } = await supabase.from('requests').insert([
      {
        system_size: result.systemSize,
        status: 'pending',
        user_id: user.id,
      },
    ])

    if (error) {
      alert('Error saving request')
      console.log(error)
    } else {
      alert('Request submitted successfully!')
    }
  }

  // 📤 Fetch Quotes
  const fetchQuotes = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
    } else {
      setQuotes(data)
    }
  }

  // 💳 Paystack Payment
  const payWithPaystack = (quote) => {
    if (!window.PaystackPop) {
      alert('Paystack not loaded')
      return
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_test_13c5e42a2c8c52768fd879c7a8e8200764d6945c',
      email: 'test@email.com',
      amount: quote.price * 100,
      currency: 'NGN',

      callback: function (response) {
        const reference = response.reference

        supabase.auth.getUser().then(({ data }) => {
          const user = data.user

          fetch(
            'https://xwamazrfpegephjebhwb.functions.supabase.co/verify-payment',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                reference,
                quote_id: quote.id,
                user_id: user.id,
              }),
            }
          )

          alert('Payment successful and verified!')
        })
      },

      onClose: function () {
        console.log('Payment closed')
      },
    })

    handler.openIframe()
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚡ PowerNaija</h1>
      <p style={styles.subtitle}>Solar made simple</p>

      <div style={styles.card}>
        <h3>Energy Calculator</h3>

        <input style={styles.input} type="number" placeholder="Number of TVs" onChange={(e) => setTvs(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Fridges" onChange={(e) => setFridges(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Air Conditioners" onChange={(e) => setAcs(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Lights" onChange={(e) => setLights(e.target.value)} />

        <button style={styles.button} onClick={calculateEnergy}>
          Calculate
        </button>

        {result && (
          <div style={styles.result}>
            <p>⚡ System Size: <strong>{result.systemSize} kVA</strong></p>
            <p>💰 Monthly: <strong>₦{result.monthlyCost}</strong></p>

            <button style={styles.button} onClick={submitRequest}>
              Request Solar
            </button>

            <button style={styles.button} onClick={fetchQuotes}>
              View My Quotes
            </button>
          </div>
        )}

        {quotes.length > 0 && (
          <div style={styles.quotes}>
            <h3>My Quotes</h3>

            {quotes.map((quote) => (
              <div key={quote.id} style={styles.quoteCard}>
                <p><strong>Installer:</strong> {quote.installer_name}</p>
                <p><strong>Price:</strong> ₦{quote.price}</p>
                <p><strong>Monthly:</strong> ₦{quote.monthly_plan}</p>
                <p><strong>Timeline:</strong> {quote.timeline}</p>

                {quote.status === 'paid' ? (
                  <>
                    <p style={{ color: 'lightgreen', fontWeight: 'bold' }}>
                      ✅ PAID
                    </p>
                    <p style={{ color: '#ccc' }}>
                      Installer assigned and will contact you
                    </p>
                  </>
                ) : (
                  <button
                    style={styles.button}
                    onClick={() => payWithPaystack(quote)}
                  >
                    Pay Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 🎨 Styling
const styles = {
  container: {
    background: '#0D1B2A',
    minHeight: '100vh',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
  },
  title: {
    color: '#FFC107',
  },
  subtitle: {
    marginBottom: '20px',
  },
  card: {
    background: '#1B263B',
    padding: '20px',
    borderRadius: '12px',
    maxWidth: '400px',
    margin: 'auto',
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    borderRadius: '8px',
    border: 'none',
  },
  button: {
    background: '#FFC107',
    color: '#000',
    padding: '12px',
    width: '100%',
    border: 'none',
    borderRadius: '8px',
    marginTop: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  result: {
    marginTop: '15px',
  },
  quotes: {
    marginTop: '20px',
  },
  quoteCard: {
    background: '#0D1B2A',
    padding: '10px',
    borderRadius: '8px',
    marginTop: '10px',
  },
}

export default EnergyCalculator