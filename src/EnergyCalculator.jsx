import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import toast from 'react-hot-toast'

function EnergyCalculator() {
  const [quotes, setQuotes] = useState([])
  const [banks, setBanks] = useState([])
  const [financing, setFinancing] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: q } = await supabase.from('quotes').select('*')
    const { data: b } = await supabase.from('banks').select('*')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: f } = await supabase
      .from('financing_requests')
      .select('*')
      .eq('user_id', user.id)

    setQuotes(q || [])
    setBanks(b || [])
    setFinancing(f || [])
  }

  const apply = async (quoteId, bankId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from('financing_requests').insert([
      { user_id: user.id, quote_id: quoteId, bank_id: bankId, status: 'pending' }
    ])

    toast.success('Applied!')
    fetchData()
  }

  const makePayment = async (quote) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from('payments').insert([
      {
        user_id: user.id,
        quote_id: quote.id,
        amount: quote.price,
        status: 'paid'
      }
    ])

    toast.success('Payment successful!')
  }

  const getStatus = (quoteId) => {
    return financing.find(f => f.quote_id === quoteId)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>⚡ Dashboard</h2>

      {quotes.map(q => {
        const f = getStatus(q.id)

        return (
          <div key={q.id} style={styles.card}>
            <h3>{q.installer_name}</h3>
            <p>₦{q.price}</p>

            <p>Status: {f?.status || 'Not applied'}</p>

            {/* APPLY */}
            {!f && banks.map(b => (
              <button
                key={b.id}
                style={styles.button}
                onClick={() => apply(q.id, b.id)}
              >
                Apply via {b.name}
              </button>
            ))}

            {/* PAYMENT UNLOCK */}
            {f?.status === 'approved' && (
              <button
                style={styles.pay}
                onClick={() => makePayment(q)}
              >
                Pay Now 💳
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '10px',
  },

  button: {
    display: 'block',
    marginTop: '5px',
    padding: '8px',
    background: '#2563EB',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  },

  pay: {
    marginTop: '10px',
    padding: '10px',
    background: 'green',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
  },
}

export default EnergyCalculator