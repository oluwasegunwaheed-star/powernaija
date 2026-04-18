const downloadReceipt = (payment) => {
  const doc = new jsPDF()

  // 🧾 HEADER
  doc.setFontSize(20)
  doc.text('PowerNaija', 20, 20)

  doc.setFontSize(10)
  doc.text('Energy Financing Platform', 20, 28)
  doc.text('Email: support@powernaija.com', 20, 34)

  // 📄 INVOICE TITLE
  doc.setFontSize(16)
  doc.text('INVOICE', 150, 20)

  // 🧾 DETAILS
  const invoiceNumber = `INV-${payment.id.slice(0, 6)}`
  const date = new Date().toLocaleDateString()

  doc.setFontSize(10)
  doc.text(`Invoice No: ${invoiceNumber}`, 140, 30)
  doc.text(`Date: ${date}`, 140, 36)

  // 👤 CUSTOMER
  doc.setFontSize(12)
  doc.text('Bill To:', 20, 50)
  doc.text(user.email, 20, 58)

  // 📊 TABLE HEADER
  doc.setFontSize(12)
  doc.text('Description', 20, 80)
  doc.text('Amount', 160, 80)

  doc.line(20, 82, 190, 82)

  // 📦 ITEM
  doc.setFontSize(10)
  doc.text('Solar Installation Payment', 20, 95)
  doc.text(`₦${payment.amount}`, 160, 95)

  // 🧮 VAT CALCULATION (7.5% Nigeria example)
  const vat = payment.amount * 0.075
  const total = payment.amount + vat

  doc.line(20, 105, 190, 105)

  doc.text('Subtotal:', 120, 120)
  doc.text(`₦${payment.amount}`, 160, 120)

  doc.text('VAT (7.5%):', 120, 130)
  doc.text(`₦${vat.toFixed(2)}`, 160, 130)

  doc.setFontSize(12)
  doc.text('Total:', 120, 145)
  doc.text(`₦${total.toFixed(2)}`, 160, 145)

  // 📌 FOOTER
  doc.setFontSize(10)
  doc.text('Thank you for your business!', 20, 170)
  doc.text('Powered by PowerNaija ⚡', 20, 178)

  doc.save(`invoice-${invoiceNumber}.pdf`)
}