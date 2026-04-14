import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

function EnergyCalculator() {
  const [quotes, setQuotes] = useState([])
  const [banks, setBanks] = useState([])
  const [financing, setFinancing] = useState([])

  useEffect(() => {
    fetchQuotes()
    fetchBanks()
    fetchFinancing()

    const interval = setInterval(() => {
      fetchFinancing()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // 📥 Fetch quotes
  const fetchQuotes = async () => {
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })

    setQuotes(data || [])
  }

  // 📥 Fetch banks
  const fetchBanks = async () => {
    const { data } = await supabase.from('banks').select('*')
    setBanks(data || [])
  }

  // 📥 Fetch financing
  const fetchFinancing = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from('financing_requests')
      .select('*')
      .eq('user_id', user.id)

    setFinancing(data || [])
  }

  // 💳 Apply for financing
  const applyForFinancing = async (quoteId, bankId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.from('financing_requests').insert([
      {
        user_id: user.id,
        quote_id: quoteId,
        bank_id: bankId,
        status: 'pending',
      },
    ])

    alert('Financing request submitted!')
    fetchFinancing()
  }

  // 💰 PAYSTACK PAYMENT
  const handlePayment = async (quote) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const handler = window.PaystackPop.setup({
      key: 'pk_test_13c5e42a2c8c52768fd879c7a8e8200764d6945c',
      email: user.email,
      amount: quote.price * 100,
      currency: 'NGN',

      callback: async function (response) {
        alert('Payment successful! Ref: ' + response.reference)

        // 🔥 SAVE TO DATABASE
        await supabase.from('payments').insert([
          {
            user_id: user.id,
            quote_id: quote.id,
            amount: quote.price,
            reference: response.reference,
            status: 'paid',
          },
        ])
      },

      onClose: function () {
        alert('Payment cancelled')
      },
    })

    handler.openIframe()
  }

  // 🔔 Notification
  const getNotification = (status) => {
    if (status === 'approved')
      return '✅ Financing Approved - You can proceed to payment'
    if (status === 'rejected')
      return '❌ Financing Rejected - Choose another bank'
    return '⏳ Awaiting Bank Approval'
  }

  return (
    <div style={styles.container}>
      <h2>User Dashboard ⚡</h2>

      {quotes.map((quote) => {
        const userRequest = financing.find(
          (f) => f.quote_id === quote.id
        )

        return (
          <div key={quote.id} style={styles.card}>
            <p><strong>Installer:</strong> {quote.installer_name}</p>
            <p><strong>Price:</strong> ₦{quote.price}</p>
            <p><strong>Monthly:</strong> ₦{quote.monthly_plan}</p>
            <p><strong>Timeline:</strong> {quote.timeline}</p>
            <p><strong>Terms:</strong> {quote.terms}</p>

            {/* 💳 PAY BUTTON */}
            <button
              style={{
                ...styles.button,
                background:
                  userRequest?.status === 'approved'
                    ? '#28a745'
                    : '#555',
              }}
              disabled={userRequest?.status !== 'approved'}
              onClick={() => handlePayment(quote)}
            >
              {userRequest?.status === 'approved'
                ? 'Pay Now'
                : 'Awaiting Approval'}
            </button>

            {/* 🏦 BANK OPTIONS */}
            <h4>Finance with Bank</h4>

            {banks.map((bank) => (
              <div key={bank.id} style={styles.bankCard}>
                <p><strong>{bank.name}</strong></p>
                <p>{bank.interest_rate}% - {bank.loan_duration}</p>

                <button
                  style={styles.button}
                  onClick={() =>
                    applyForFinancing(quote.id, bank.id)
                  }
                >
                  Apply
                </button>
              </div>
            ))}

            {/* STATUS */}
            {userRequest && (
              <>
                <p><strong>Status:</strong> {userRequest.status}</p>
                <p style={{ color: '#FFC107' }}>
                  {getNotification(userRequest.status)}
                </p>
              </>
            )}
          </div>
        )
      })}
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
    marginBottom: '20px',
  },
  bankCard: {
    background: '#243447',
    padding: '10px',
    marginTop: '10px',
    borderRadius: '8px',
  },
  button: {
    background: '#FFC107',
    border: 'none',
    padding: '10px',
    marginTop: '10px',
    width: '100%',
    borderRadius: '6px',
    cursor: 'pointer',
  },
}

export default EnergyCalculator