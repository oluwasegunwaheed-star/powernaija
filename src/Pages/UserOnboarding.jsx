import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ensureOnboardingRow } from '../lib/onboardingHelpers'
import DashboardShell from '../components/DashboardShell'
import DocumentUploader from '../components/DocumentUploader'
import ErrorState from '../components/ErrorState'
import RejectionNotice from '../components/RejectionNotice'

const emptyForm = {
  date_of_birth: '',
  phone: '',
  residential_address: '',
  city: '',
  state: '',
  country: 'Nigeria',
  id_type: '',
  id_number: '',
  customer_type: '',
  occupation: '',
  business_type: '',
  monthly_income: '',
  monthly_turnover: '',
  employment_type: '',
  bank_name: '',
  bvn: '',
  nin: '',
  property_type: '',
  installation_address: '',
  property_ownership: '',
  current_power_source: '',
  average_daily_outage_hours: '',
  monthly_generator_spend: '',
  appliance_summary: '',
  desired_system_size_kva: '',
  recommended_system_size_kva: '',
  preferred_down_payment: '',
  preferred_monthly_repayment: '',
  preferred_tenor_months: '',
  preferred_bank: '',
  purchase_intent: '',
  consent_credit_check: false,
  consent_data_privacy: false,
  consent_terms: false
}

export default function UserOnboarding({ user, profile }) {
  const [form, setForm] = useState(emptyForm)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [onboardingId, setOnboardingId] = useState('')
  const [serverRejectionReason, setServerRejectionReason] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError('')

        const ensuredId = await ensureOnboardingRow('user_onboarding', user.id)
        setOnboardingId(ensuredId)

        const { data, error } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setForm({
            ...emptyForm,
            ...data,
            date_of_birth: data.date_of_birth || '',
            phone: data.phone || profile?.phone || '',
            residential_address: data.residential_address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || 'Nigeria',
            id_type: data.id_type || '',
            id_number: data.id_number || '',
            customer_type: data.customer_type || '',
            occupation: data.occupation || '',
            business_type: data.business_type || '',
            monthly_income: data.monthly_income ?? '',
            monthly_turnover: data.monthly_turnover ?? '',
            employment_type: data.employment_type || '',
            bank_name: data.bank_name || '',
            bvn: data.bvn || '',
            nin: data.nin || '',
            property_type: data.property_type || '',
            installation_address: data.installation_address || '',
            property_ownership: data.property_ownership || '',
            current_power_source: data.current_power_source || '',
            average_daily_outage_hours: data.average_daily_outage_hours ?? '',
            monthly_generator_spend: data.monthly_generator_spend ?? '',
            appliance_summary: data.appliance_summary || '',
            desired_system_size_kva: data.desired_system_size_kva ?? '',
            recommended_system_size_kva: data.recommended_system_size_kva ?? '',
            preferred_down_payment: data.preferred_down_payment ?? '',
            preferred_monthly_repayment: data.preferred_monthly_repayment ?? '',
            preferred_tenor_months: data.preferred_tenor_months ?? '',
            preferred_bank: data.preferred_bank || '',
            purchase_intent: data.purchase_intent || '',
            consent_credit_check: !!data.consent_credit_check,
            consent_data_privacy: !!data.consent_data_privacy,
            consent_terms: !!data.consent_terms
          })
          setServerRejectionReason(data?.rejection_reason || profile?.rejection_reason || '')
        } else {
          setServerRejectionReason(profile?.rejection_reason || '')
        }
      } catch (err) {
        setError(err.message || 'Failed to load onboarding')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user.id, profile?.phone, profile?.rejection_reason])

  const validationErrors = useMemo(() => {
    const errors = []

    if (!String(form.phone || '').trim()) errors.push('Phone is required.')
    if (!String(form.customer_type || '').trim()) errors.push('Customer type is required.')
    if (!String(form.property_type || '').trim()) errors.push('Property type is required.')
    if (!String(form.installation_address || '').trim()) errors.push('Installation address is required.')
    if (!form.consent_data_privacy) errors.push('Data privacy consent is required.')
    if (!form.consent_terms) errors.push('Terms acceptance is required.')

    return errors
  }, [form])

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toNum = (value) => (value === '' ? null : Number(value))

  const buildPayload = (status) => ({
    user_id: user.id,
    date_of_birth: form.date_of_birth || null,
    phone: form.phone || null,
    residential_address: form.residential_address || null,
    city: form.city || null,
    state: form.state || null,
    country: form.country || 'Nigeria',
    id_type: form.id_type || null,
    id_number: form.id_number || null,
    customer_type: form.customer_type || null,
    occupation: form.occupation || null,
    business_type: form.business_type || null,
    monthly_income: toNum(form.monthly_income),
    monthly_turnover: toNum(form.monthly_turnover),
    employment_type: form.employment_type || null,
    bank_name: form.bank_name || null,
    bvn: form.bvn || null,
    nin: form.nin || null,
    property_type: form.property_type || null,
    installation_address: form.installation_address || null,
    property_ownership: form.property_ownership || null,
    current_power_source: form.current_power_source || null,
    average_daily_outage_hours: toNum(form.average_daily_outage_hours),
    monthly_generator_spend: toNum(form.monthly_generator_spend),
    appliance_summary: form.appliance_summary || null,
    desired_system_size_kva: toNum(form.desired_system_size_kva),
    recommended_system_size_kva: toNum(form.recommended_system_size_kva),
    preferred_down_payment: toNum(form.preferred_down_payment),
    preferred_monthly_repayment: toNum(form.preferred_monthly_repayment),
    preferred_tenor_months:
      form.preferred_tenor_months === '' ? null : Number(form.preferred_tenor_months),
    preferred_bank: form.preferred_bank || null,
    purchase_intent: form.purchase_intent || null,
    consent_credit_check: !!form.consent_credit_check,
    consent_data_privacy: !!form.consent_data_privacy,
    consent_terms: !!form.consent_terms,
    onboarding_status: status,
    submitted_at: status === 'submitted' ? new Date().toISOString() : null,
    rejection_reason: null,
    approval_status: status === 'submitted' ? 'pending' : null,
    verification_status: status === 'submitted' ? 'pending' : null,
    reviewed_at: null
  })

  const saveDraft = async () => {
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const { error } = await supabase
        .from('user_onboarding')
        .upsert(buildPayload('draft'), { onConflict: 'user_id' })

      if (error) throw error

      await supabase
        .from('profiles')
        .update({
          onboarding_status: 'draft',
          rejection_reason: null
        })
        .eq('id', user.id)

      setServerRejectionReason('')
      setMessage('Draft saved')
    } catch (err) {
      setError(err.message || 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const submitForReview = async () => {
    if (validationErrors.length) {
      setError(validationErrors.join(' '))
      return
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const { error } = await supabase
        .from('user_onboarding')
        .upsert(buildPayload('submitted'), { onConflict: 'user_id' })

      if (error) throw error

      await supabase
        .from('profiles')
        .update({
          onboarding_status: 'submitted',
          approval_status: 'pending',
          verification_status: 'pending',
          submitted_at: new Date().toISOString(),
          reviewed_at: null,
          rejection_reason: null
        })
        .eq('id', user.id)

      setServerRejectionReason('')
      setMessage('Submitted for review')
    } catch (err) {
      setError(err.message || 'Failed to submit onboarding')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardShell profile={profile} title="User Onboarding">
      <ErrorState message={error} />
      <RejectionNotice profile={profile} localReason={serverRejectionReason} />
      {message ? <SuccessBox text={message} /> : null}

      <StepBar current={step} steps={['Basic', 'Customer', 'Energy', 'Consent']} />

      {validationErrors.length > 0 && step === 4 ? (
        <div style={validationBox}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Before you submit</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {validationErrors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {loading ? (
        <div style={{ padding: 16 }}>Loading onboarding...</div>
      ) : (
        <div style={card}>
          {step === 1 && (
            <div style={grid}>
              <Field label="Date of birth">
                <input type="date" value={form.date_of_birth} onChange={(e) => onChange('date_of_birth', e.target.value)} style={input} />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => onChange('phone', e.target.value)} style={input} />
              </Field>
              <Field label="Residential address">
                <input value={form.residential_address} onChange={(e) => onChange('residential_address', e.target.value)} style={input} />
              </Field>
              <Field label="City">
                <input value={form.city} onChange={(e) => onChange('city', e.target.value)} style={input} />
              </Field>
              <Field label="State">
                <input value={form.state} onChange={(e) => onChange('state', e.target.value)} style={input} />
              </Field>
              <Field label="Country">
                <input value={form.country} onChange={(e) => onChange('country', e.target.value)} style={input} />
              </Field>
              <Field label="ID type">
                <select value={form.id_type} onChange={(e) => onChange('id_type', e.target.value)} style={input}>
                  <option value="">Select</option>
                  <option value="nin">NIN</option>
                  <option value="bvn">BVN</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver&apos;s Licence</option>
                  <option value="voters_card">Voter&apos;s Card</option>
                </select>
              </Field>
              <Field label="ID number">
                <input value={form.id_number} onChange={(e) => onChange('id_number', e.target.value)} style={input} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div style={grid}>
              <Field label="Customer type">
                <select value={form.customer_type} onChange={(e) => onChange('customer_type', e.target.value)} style={input}>
                  <option value="">Select</option>
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                </select>
              </Field>
              <Field label="Occupation">
                <input value={form.occupation} onChange={(e) => onChange('occupation', e.target.value)} style={input} />
              </Field>
              <Field label="Business type">
                <input value={form.business_type} onChange={(e) => onChange('business_type', e.target.value)} style={input} />
              </Field>
              <Field label="Monthly income">
                <input type="number" value={form.monthly_income} onChange={(e) => onChange('monthly_income', e.target.value)} style={input} />
              </Field>
              <Field label="Monthly turnover">
                <input type="number" value={form.monthly_turnover} onChange={(e) => onChange('monthly_turnover', e.target.value)} style={input} />
              </Field>
              <Field label="Employment type">
                <input value={form.employment_type} onChange={(e) => onChange('employment_type', e.target.value)} style={input} />
              </Field>
              <Field label="Existing bank">
                <input value={form.bank_name} onChange={(e) => onChange('bank_name', e.target.value)} style={input} />
              </Field>
              <Field label="BVN">
                <input value={form.bvn} onChange={(e) => onChange('bvn', e.target.value)} style={input} />
              </Field>
              <Field label="NIN">
                <input value={form.nin} onChange={(e) => onChange('nin', e.target.value)} style={input} />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div style={grid}>
              <Field label="Property type">
                <input value={form.property_type} onChange={(e) => onChange('property_type', e.target.value)} style={input} />
              </Field>
              <Field label="Installation address">
                <input value={form.installation_address} onChange={(e) => onChange('installation_address', e.target.value)} style={input} />
              </Field>
              <Field label="Property ownership">
                <select value={form.property_ownership} onChange={(e) => onChange('property_ownership', e.target.value)} style={input}>
                  <option value="">Select</option>
                  <option value="owner">Owner</option>
                  <option value="tenant">Tenant</option>
                  <option value="family">Family</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Current power source">
                <input value={form.current_power_source} onChange={(e) => onChange('current_power_source', e.target.value)} style={input} />
              </Field>
              <Field label="Average daily outage hours">
                <input type="number" value={form.average_daily_outage_hours} onChange={(e) => onChange('average_daily_outage_hours', e.target.value)} style={input} />
              </Field>
              <Field label="Monthly generator spend">
                <input type="number" value={form.monthly_generator_spend} onChange={(e) => onChange('monthly_generator_spend', e.target.value)} style={input} />
              </Field>
              <Field label="Desired system size (kVA)">
                <input type="number" value={form.desired_system_size_kva} onChange={(e) => onChange('desired_system_size_kva', e.target.value)} style={input} />
              </Field>
              <Field label="Recommended system size (kVA)">
                <input type="number" value={form.recommended_system_size_kva} onChange={(e) => onChange('recommended_system_size_kva', e.target.value)} style={input} />
              </Field>
              <Field label="Preferred down payment">
                <input type="number" value={form.preferred_down_payment} onChange={(e) => onChange('preferred_down_payment', e.target.value)} style={input} />
              </Field>
              <Field label="Preferred monthly repayment">
                <input type="number" value={form.preferred_monthly_repayment} onChange={(e) => onChange('preferred_monthly_repayment', e.target.value)} style={input} />
              </Field>
              <Field label="Preferred tenor (months)">
                <input type="number" value={form.preferred_tenor_months} onChange={(e) => onChange('preferred_tenor_months', e.target.value)} style={input} />
              </Field>
              <Field label="Preferred bank">
                <input value={form.preferred_bank} onChange={(e) => onChange('preferred_bank', e.target.value)} style={input} />
              </Field>
              <Field label="Purchase intent">
                <select value={form.purchase_intent} onChange={(e) => onChange('purchase_intent', e.target.value)} style={input}>
                  <option value="">Select</option>
                  <option value="ready_now">Ready now</option>
                  <option value="comparing_options">Comparing options</option>
                  <option value="exploring">Exploring</option>
                </select>
              </Field>
              <Field label="Appliance summary">
                <textarea value={form.appliance_summary} onChange={(e) => onChange('appliance_summary', e.target.value)} style={textarea} />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'grid', gap: 14 }}>
              <label style={checkRow}>
                <input type="checkbox" checked={form.consent_credit_check} onChange={(e) => onChange('consent_credit_check', e.target.checked)} />
                <span>I consent to affordability / credit review.</span>
              </label>
              <label style={checkRow}>
                <input type="checkbox" checked={form.consent_data_privacy} onChange={(e) => onChange('consent_data_privacy', e.target.checked)} />
                <span>I consent to data privacy processing.</span>
              </label>
              <label style={checkRow}>
                <input type="checkbox" checked={form.consent_terms} onChange={(e) => onChange('consent_terms', e.target.checked)} />
                <span>I accept the terms and conditions.</span>
              </label>
            </div>
          )}

          <div style={actions}>
            <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} style={secondaryBtn}>
              Back
            </button>
            <button type="button" onClick={saveDraft} disabled={saving} style={secondaryBtn}>
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            {step < 4 ? (
              <button type="button" onClick={() => setStep((s) => Math.min(4, s + 1))} style={primaryBtn}>
                Next
              </button>
            ) : (
              <button type="button" onClick={submitForReview} disabled={saving} style={primaryBtn}>
                {saving ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      )}

      {onboardingId ? (
        <DocumentUploader
          bucketId="user-onboarding-docs"
          ownerId={user.id}
          role="user"
          onboardingTable="user_onboarding"
          onboardingId={onboardingId}
          requiredDocuments={[
            { value: 'valid_id', label: 'Valid ID' },
            { value: 'proof_of_address', label: 'Proof of Address' },
            { value: 'passport_photo', label: 'Passport Photo' },
            { value: 'payslip_or_bank_statement', label: 'Payslip / Bank Statement' }
          ]}
        />
      ) : null}
    </DashboardShell>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
      {children}
    </label>
  )
}

function StepBar({ current, steps }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 8, marginBottom: 16 }}>
      {steps.map((label, index) => (
        <div
          key={label}
          style={{
            background: current === index + 1 ? '#2563eb' : '#e5e7eb',
            color: current === index + 1 ? '#fff' : '#334155',
            padding: '10px 12px',
            borderRadius: 12,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 13
          }}
        >
          {index + 1}. {label}
        </div>
      ))}
    </div>
  )
}

function SuccessBox({ text }) {
  return (
    <div style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: 12, borderRadius: 12, marginBottom: 16 }}>
      {text}
    </div>
  )
}

const validationBox = {
  background: '#fff7ed',
  color: '#9a3412',
  border: '1px solid #fdba74',
  borderRadius: 12,
  padding: 14,
  marginBottom: 16
}

const card = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 16
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14
}

const input = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1px solid #d1d5db',
  boxSizing: 'border-box'
}

const textarea = {
  ...input,
  minHeight: 110,
  resize: 'vertical'
}

const actions = {
  display: 'flex',
  gap: 10,
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  marginTop: 18
}

const primaryBtn = {
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 700
}

const secondaryBtn = {
  background: '#fff',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 12,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 700
}

const checkRow = {
  display: 'flex',
  gap: 10,
  alignItems: 'center'
}