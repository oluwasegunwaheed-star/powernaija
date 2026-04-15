export default async function handler(req, res) {
  const { reference } = req.body

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
    return res.status(200).json({ success: true, data })
  }

  return res.status(400).json({ success: false })
}