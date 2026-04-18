export function isEmail(value) {
  return /\S+@\S+\.\S+/.test(String(value || '').trim())
}

export function isPositiveNumber(value) {
  return value !== '' && !Number.isNaN(Number(value)) && Number(value) >= 0
}

export function validateUserOnboarding(form) {
  const errors = []

  if (!String(form.phone || '').trim()) errors.push('Phone is required.')
  if (!String(form.customer_type || '').trim()) errors.push('Customer type is required.')
  if (!String(form.property_type || '').trim()) errors.push('Property type is required.')
  if (!String(form.installation_address || '').trim()) errors.push('Installation address is required.')
  if (!form.consent_data_privacy) errors.push('Data privacy consent is required.')
  if (!form.consent_terms) errors.push('Terms acceptance is required.')

  return errors
}

export function validateInstallerOnboarding(form) {
  const errors = []

  if (!String(form.company_name || '').trim()) errors.push('Company name is required.')
  if (!String(form.business_email || '').trim()) errors.push('Business email is required.')
  if (form.business_email && !isEmail(form.business_email)) errors.push('Business email is invalid.')
  if (!String(form.contact_name || '').trim()) errors.push('Contact name is required.')
  if (!String(form.contact_email || '').trim()) errors.push('Contact email is required.')
  if (form.contact_email && !isEmail(form.contact_email)) errors.push('Contact email is invalid.')

  return errors
}

export function validateBankOnboarding(form) {
  const errors = []

  if (!String(form.bank_name || '').trim()) errors.push('Bank name is required.')
  if (!String(form.corporate_email || '').trim()) errors.push('Corporate email is required.')
  if (form.corporate_email && !isEmail(form.corporate_email)) errors.push('Corporate email is invalid.')
  if (!String(form.officer_name || '').trim()) errors.push('Officer name is required.')
  if (!String(form.product_name || '').trim()) errors.push('Product name is required.')

  return errors
}