import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import nodemailer from 'nodemailer'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// 📧 EMAIL SETUP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// 🔐 VERIFY PAYMENT
app.post('/verify-payment', async (req, res) => {
  try {
    const { reference, email, amount } = req.body

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (data.data.status === 'success') {
      // 📧 SEND EMAIL RECEIPT
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Payment Receipt - PowerNaija',
        html: `
          <h2>Payment Successful</h2>
          <p>Reference: ${reference}</p>
          <p>Amount: ₦${amount}</p>
          <p>Thank you for using PowerNaija ⚡</p>
        `,
      })

      return res.json({ success: true })
    }

    res.status(400).json({ success: false })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.listen(5000, () =>
  console.log('🚀 Backend running on http://localhost:5000')
)