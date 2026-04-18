 import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ensureOnboardingRow } from '../lib/onboardingHelpers'
import DashboardShell from '../components/DashboardShell'
import DocumentUploader from '../components/DocumentUploader'
import ErrorState from '../components/ErrorState'
import RejectionNotice from '../components/RejectionNotice'

const emptyForm = {
  company_name: '',
  cac_number: '',
  business_email: '',
  business_phone: '',
  office_address: '',
  service_states: '',
  years_in_operation: '',
  contact_name: '',
  contact_role: '',
  contact_email: '',
  contact_phone: '',
  system_types: '',
  market_segments: '',
  average_project_size_kva: '',
  technician_count: '',
  installation_model: '',
  brands_worked_with: '',
  maintenance_support: false,
  warranty_months: '',
  response_time_hours: '',
  installation_turnaround_days: '',
  aftersales_support: false,
  emergency_callout_support: false,
  payout_account_name: '',
  payout_bank_name: '',
  payout_account_number: '',
  pricing_model: '',
  deposit_requirement_percent: '',
  minimum_project_size_kva: '',
  installer_terms_template: ''
}

export default function InstallerOnboarding({ user, profile }) {
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

        const ensuredId = await ensureOnboardingRow('installer_onboarding', user.id)
        setOnboardingId(ensuredId)

        const { data, error } = await supabase
          .from('installer_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setForm({
            ...emptyForm,
            ...data,
            service_states: (data.service_states || []).join(', '),
            system_types: (data.system_types || []).join(', '),
            market_segments: (data.market_segments || []).join(', '),
            brands_worked_with: (data.brands_worked_with || []).join(', '),
            years_in_operation: data.years_in_operation ?? '',
            average_project_size_kva: data.average_project_size_kva ?? '',
            technician_count: data.technician_count ?? '',
            warranty_months: data.warranty_months ?? '',
            response_time_hours: data.response_time_hours ?? '',
            installation_turnaround_days: data.installation_turnaround_days ?? '',
            deposit_requirement_percent: data.deposit_requirement_percent ?? '',
            minimum_project_size_kva: data.minimum_project_size_kva ?? '',
            maintenance_support: !!data.maintenance_support,
            aftersales_support: !!data.aftersales_support,
            emergency_callout_support: !!data.emergency_callout_support
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
  }, [user.id, profile?.rejection_reason])

  const validationErrors = useMemo(() => {
    const errors = []

    if (!String(form.company_name || '').trim()) errors.push('Company name is required.')
    if (!String(form.business_email || '').trim()) errors.push('Business email is required.')
    if (!String(form.contact_name || '').trim()) errors.push('Contact name is required.')
    if (!String(form.contact_email || '').trim()) errors.push('Contact email is required.')
    if (!String(form.office_address || '').trim()) errors.push('Office address is required.')

    if (form.business_email && !/\S+@\S+\.\S+/.test(form.business_email)) {
      errors.push('Business email is invalid.')
    }

    if (form.contact_email && !/\S+@\S+\.\S+/.test(form.contact_email)) {
      errors.push('Contact email is invalid.')
    }

    return errors
  }, [form])

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toNum = (value) => (value === '' ? null : Number(value))

  const toTextArray = (value) =>
    String(value || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)

  const buildPayload = (status) => ({
    user_id: user.id,
    company_name: form.company_name || null,
    cac_number: form.cac_number || null,
    business_email: form.business_email || null,
    business_phone: form.business_phone || null,
    office_address: form.office_address || null,
    service_states: toTextArray(form.service_states),
    years_in_operation:
      form.years_in_operation === '' ? null : Number(form.years_in_operation),
    contact_name: form.contact_name || null,
    contact_role: form.contact_role || null,
    contact_email: form.contact_email || null,
    contact_phone: form.contact_phone || null,
    system_types: toTextArray(form.system_types),
    market_segments: toTextArray(form.market_segments),
    average_project_size_kva: toNum(form.average_project_size_kva),
    technician_count:
      form.technician_count === '' ? null : Number(form.technician_count),
    installation_model: form.installation_model || null,
    brands_worked_with: toTextArray(form.brands_worked_with),
    maintenance_support: !!form.maintenance_support,
    warranty_months:
      form.warranty_months === '' ? null : Number(form.warranty_months),
    response_time_hours: toNum(form.response_time_hours),
    installation_turnaround_days:
      form.installation_turnaround_days === ''
        ? null
        : Number(form.installation_turnaround_days),
    aftersales_support: !!form.aftersales_support,
    emergency_callout_support: !!form.emergency_callout_support,
    payout_account_name: form.payout_account_name || null,
    payout_bank_name: form.payout_bank_name || null,
    payout_account_number: form.payout_account_number || null,
    pricing_model: form.pricing_model || null,
    deposit_requirement_percent: toNum(form.deposit_requirement_percent),
    minimum_project_size_kva: toNum(form.minimum_project_size_kva),
    installer_terms_template: form.installer_terms_template || null,
    onboarding_status: status,
    submitted_at: status === 'submitted' ? new Date().toISOString() : null,
    approval_status: status === 'submitted' ? 'pending' : null,
    verification_status: status === 'submitted' ? 'pending' : null,
    rejection_reason: null,
    reviewed_at: null
  })

  const saveDraft = async () => {
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const { error } = await supabase
        .from('installer_onboarding')
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
        .from('installer_onboarding')
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
    <DashboardShell profile={profile} title="Installer Onboarding">
      <ErrorState message={error} />
      <RejectionNotice profile={profile} localReason={serverRejectionReason} />
      {message ? <SuccessBox text={message} /> : null}

      <StepBar
        current={step}
        steps={['Business', 'Contact', 'Capability', 'Commercial']}
      />

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
              <Field label="Company name">
                <input
                  value={form.company_name}
                  onChange={(e) => onChange('company_name', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="CAC number">
                <input
                  value={form.cac_number}
                  onChange={(e) => onChange('cac_number', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Business email">
                <input
                  type="email"
                  value={form.business_email}
                  onChange={(e) => onChange('business_email', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Business phone">
                <input
                  value={form.business_phone}
                  onChange={(e) => onChange('business_phone', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Office address">
                <input
                  value={form.office_address}
                  onChange={(e) => onChange('office_address', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Service states (comma separated)">
                <textarea
                  value={form.service_states}
                  onChange={(e) => onChange('service_states', e.target.value)}
                  style={textarea}
                />
              </Field>

              <Field label="Years in operation">
                <input
                  type="number"
                  value={form.years_in_operation}
                  onChange={(e) => onChange('years_in_operation', e.target.value)}
                  style={input}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div style={grid}>
              <Field label="Contact name">
                <input
                  value={form.contact_name}
                  onChange={(e) => onChange('contact_name', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Contact role">
                <input
                  value={form.contact_role}
                  onChange={(e) => onChange('contact_role', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Contact email">
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => onChange('contact_email', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Contact phone">
                <input
                  value={form.contact_phone}
                  onChange={(e) => onChange('contact_phone', e.target.value)}
                  style={input}
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div style={grid}>
              <Field label="System types (comma separated)">
                <textarea
                  value={form.system_types}
                  onChange={(e) => onChange('system_types', e.target.value)}
                  style={textarea}
                />
              </Field>

              <Field label="Market segments (comma separated)">
                <textarea
                  value={form.market_segments}
                  onChange={(e) => onChange('market_segments', e.target.value)}
                  style={textarea}
                />
              </Field>

              <Field label="Average project size (kVA)">
                <input
                  type="number"
                  value={form.average_project_size_kva}
                  onChange={(e) => onChange('average_project_size_kva', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Technician count">
                <input
                  type="number"
                  value={form.technician_count}
                  onChange={(e) => onChange('technician_count', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Installation model">
                <input
                  value={form.installation_model}
                  onChange={(e) => onChange('installation_model', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Brands worked with (comma separated)">
                <textarea
                  value={form.brands_worked_with}
                  onChange={(e) => onChange('brands_worked_with', e.target.value)}
                  style={textarea}
                />
              </Field>

              <Field label="Warranty months">
                <input
                  type="number"
                  value={form.warranty_months}
                  onChange={(e) => onChange('warranty_months', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Response time (hours)">
                <input
                  type="number"
                  value={form.response_time_hours}
                  onChange={(e) => onChange('response_time_hours', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Installation turnaround (days)">
                <input
                  type="number"
                  value={form.installation_turnaround_days}
                  onChange={(e) =>
                    onChange('installation_turnaround_days', e.target.value)
                  }
                  style={input}
                />
              </Field>

              <label style={checkRow}>
                <input
                  type="checkbox"
                  checked={form.maintenance_support}
                  onChange={(e) => onChange('maintenance_support', e.target.checked)}
                />
                <span>Maintenance support offered</span>
              </label>

              <label style={checkRow}>
                <input
                  type="checkbox"
                  checked={form.aftersales_support}
                  onChange={(e) => onChange('aftersales_support', e.target.checked)}
                />
                <span>After-sales support offered</span>
              </label>

              <label style={checkRow}>
                <input
                  type="checkbox"
                  checked={form.emergency_callout_support}
                  onChange={(e) =>
                    onChange('emergency_callout_support', e.target.checked)
                  }
                />
                <span>Emergency call-out support</span>
              </label>
            </div>
          )}

          {step === 4 && (
            <div style={grid}>
              <Field label="Payout account name">
                <input
                  value={form.payout_account_name}
                  onChange={(e) => onChange('payout_account_name', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Payout bank name">
                <input
                  value={form.payout_bank_name}
                  onChange={(e) => onChange('payout_bank_name', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Payout account number">
                <input
                  value={form.payout_account_number}
                  onChange={(e) => onChange('payout_account_number', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Pricing model">
                <input
                  value={form.pricing_model}
                  onChange={(e) => onChange('pricing_model', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Deposit requirement %">
                <input
                  type="number"
                  value={form.deposit_requirement_percent}
                  onChange={(e) =>
                    onChange('deposit_requirement_percent', e.target.value)
                  }
                  style={input}
                />
              </Field>

              <Field label="Minimum project size (kVA)">
                <input
                  type="number"
                  value={form.minimum_project_size_kva}
                  onChange={(e) => onChange('minimum_project_size_kva', e.target.value)}
                  style={input}
                />
              </Field>

              <Field label="Terms template">
                <textarea
                  value={form.installer_terms_template}
                  onChange={(e) =>
                    onChange('installer_terms_template', e.target.value)
                  }
                  style={textarea}
                />
              </Field>
            </div>
          )}

          <div style={actions}>
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              style={secondaryBtn}
            >
              Back
            </button>

            <button
              type="button"
              onClick={saveDraft}
              disabled={saving}
              style={secondaryBtn}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                style={primaryBtn}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={submitForReview}
                disabled={saving}
                style={primaryBtn}
              >
                {saving ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}
          </div>
        </div>
      )}

      {onboardingId ? (
        <DocumentUploader
          bucketId="installer-onboarding-docs"
          ownerId={user.id}
          role="installer"
          onboardingTable="installer_onboarding"
          onboardingId={onboardingId}
          requiredDocuments={[
            { value: 'cac_certificate', label: 'CAC Certificate' },
            { value: 'tax_identification', label: 'Tax Identification' },
            { value: 'insurance_certificate', label: 'Insurance Certificate' },
            { value: 'company_profile', label: 'Company Profile' },
            { value: 'project_reference', label: 'Project Reference' },
            { value: 'technical_certification', label: 'Technical Certification' }
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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
        gap: 8,
        marginBottom: 16
      }}
    >
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
    <div
      style={{
        background: '#ecfdf5',
        color: '#047857',
        border: '1px solid #a7f3d0',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16
      }}
    >
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