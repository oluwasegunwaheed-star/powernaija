import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ensureOnboardingRow } from '../lib/onboardingHelpers'
import DashboardShell from '../components/DashboardShell'
import DocumentUploader from '../components/DocumentUploader'
import ErrorState from '../components/ErrorState'
import RejectionNotice from '../components/RejectionNotice'

const emptyForm = {
  bank_name: '',
  branch_or_unit_name: '',
  corporate_email: '',
  contact_phone: '',
  office_address: '',
  state: '',
  officer_name: '',
  officer_role: '',
  officer_email: '',
  officer_phone: '',
  product_name: '',
  minimum_loan_amount: '',
  maximum_loan_amount: '',
  interest_rate_percent: '',
  tenor_options_months: '',
  minimum_down_payment_percent: '',
  eligibility_criteria: '',
  processing_time_days: '',
  required_documents: '',
  workflow_notes: '',
  accepted_customer_types: '',
  minimum_income: '',
  minimum_turnover: '',
  geographic_restrictions: '',
  accepted_project_categories: '',
  approved_installer_only: false,
  disbursement_type: '',
  milestone_payout_logic: '',
  payout_evidence_required: '',
  settlement_account_name: '',
  settlement_bank_name: '',
  settlement_account_number: '',
  sla_days: '',
  legal_disclaimer: ''
}

export default function BankOnboarding({ user, profile }) {
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

        const ensuredId = await ensureOnboardingRow('bank_onboarding', user.id)
        setOnboardingId(ensuredId)

        const { data, error } = await supabase
          .from('bank_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error

        if (data) {
          setForm({
            ...emptyForm,
            ...data,
            tenor_options_months: (data.tenor_options_months || []).join(', '),
            required_documents: (data.required_documents || []).join(', '),
            accepted_customer_types: (data.accepted_customer_types || []).join(', '),
            geographic_restrictions: (data.geographic_restrictions || []).join(', '),
            accepted_project_categories: (data.accepted_project_categories || []).join(', '),
            minimum_loan_amount: data.minimum_loan_amount ?? '',
            maximum_loan_amount: data.maximum_loan_amount ?? '',
            interest_rate_percent: data.interest_rate_percent ?? '',
            minimum_down_payment_percent: data.minimum_down_payment_percent ?? '',
            processing_time_days: data.processing_time_days ?? '',
            minimum_income: data.minimum_income ?? '',
            minimum_turnover: data.minimum_turnover ?? '',
            sla_days: data.sla_days ?? '',
            approved_installer_only: !!data.approved_installer_only
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

  const onChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const toNum = (value) => (value === '' ? null : Number(value))
  const toTextArray = (value) =>
    value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  const toIntArray = (value) =>
    value
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => !Number.isNaN(v))

  const buildPayload = (status) => ({
    user_id: user.id,
    bank_name: form.bank_name || null,
    branch_or_unit_name: form.branch_or_unit_name || null,
    corporate_email: form.corporate_email || null,
    contact_phone: form.contact_phone || null,
    office_address: form.office_address || null,
    state: form.state || null,
    officer_name: form.officer_name || null,
    officer_role: form.officer_role || null,
    officer_email: form.officer_email || null,
    officer_phone: form.officer_phone || null,
    product_name: form.product_name || null,
    minimum_loan_amount: toNum(form.minimum_loan_amount),
    maximum_loan_amount: toNum(form.maximum_loan_amount),
    interest_rate_percent: toNum(form.interest_rate_percent),
    tenor_options_months: toIntArray(form.tenor_options_months),
    minimum_down_payment_percent: toNum(form.minimum_down_payment_percent),
    eligibility_criteria: form.eligibility_criteria || null,
    processing_time_days: form.processing_time_days === '' ? null : Number(form.processing_time_days),
    required_documents: toTextArray(form.required_documents),
    workflow_notes: form.workflow_notes || null,
    accepted_customer_types: toTextArray(form.accepted_customer_types),
    minimum_income: toNum(form.minimum_income),
    minimum_turnover: toNum(form.minimum_turnover),
    geographic_restrictions: toTextArray(form.geographic_restrictions),
    accepted_project_categories: toTextArray(form.accepted_project_categories),
    approved_installer_only: !!form.approved_installer_only,
    disbursement_type: form.disbursement_type || null,
    milestone_payout_logic: form.milestone_payout_logic || null,
    payout_evidence_required: form.payout_evidence_required || null,
    settlement_account_name: form.settlement_account_name || null,
    settlement_bank_name: form.settlement_bank_name || null,
    settlement_account_number: form.settlement_account_number || null,
    sla_days: form.sla_days === '' ? null : Number(form.sla_days),
    legal_disclaimer: form.legal_disclaimer || null,
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
        .from('bank_onboarding')
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
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const { error } = await supabase
        .from('bank_onboarding')
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
    <DashboardShell profile={profile} title="Bank Onboarding">
      <ErrorState message={error} />
      <RejectionNotice profile={profile} localReason={serverRejectionReason} />
      {message ? <SuccessBox text={message} /> : null}

      <StepBar current={step} steps={['Profile', 'Officer', 'Product', 'Risk & Legal']} />

      {loading ? (
        <div style={{ padding: 16 }}>Loading onboarding...</div>
      ) : (
        <div style={card}>
          {step === 1 && (
            <div style={grid}>
              <Field label="Bank name"><input value={form.bank_name} onChange={(e) => onChange('bank_name', e.target.value)} style={input} /></Field>
              <Field label="Branch or unit"><input value={form.branch_or_unit_name} onChange={(e) => onChange('branch_or_unit_name', e.target.value)} style={input} /></Field>
              <Field label="Corporate email"><input value={form.corporate_email} onChange={(e) => onChange('corporate_email', e.target.value)} style={input} /></Field>
              <Field label="Contact phone"><input value={form.contact_phone} onChange={(e) => onChange('contact_phone', e.target.value)} style={input} /></Field>
              <Field label="Office address"><input value={form.office_address} onChange={(e) => onChange('office_address', e.target.value)} style={input} /></Field>
              <Field label="State"><input value={form.state} onChange={(e) => onChange('state', e.target.value)} style={input} /></Field>
            </div>
          )}

          {step === 2 && (
            <div style={grid}>
              <Field label="Officer name"><input value={form.officer_name} onChange={(e) => onChange('officer_name', e.target.value)} style={input} /></Field>
              <Field label="Officer role"><input value={form.officer_role} onChange={(e) => onChange('officer_role', e.target.value)} style={input} /></Field>
              <Field label="Officer email"><input value={form.officer_email} onChange={(e) => onChange('officer_email', e.target.value)} style={input} /></Field>
              <Field label="Officer phone"><input value={form.officer_phone} onChange={(e) => onChange('officer_phone', e.target.value)} style={input} /></Field>
            </div>
          )}

          {step === 3 && (
            <div style={grid}>
              <Field label="Product name"><input value={form.product_name} onChange={(e) => onChange('product_name', e.target.value)} style={input} /></Field>
              <Field label="Minimum loan amount"><input type="number" value={form.minimum_loan_amount} onChange={(e) => onChange('minimum_loan_amount', e.target.value)} style={input} /></Field>
              <Field label="Maximum loan amount"><input type="number" value={form.maximum_loan_amount} onChange={(e) => onChange('maximum_loan_amount', e.target.value)} style={input} /></Field>
              <Field label="Interest rate %"><input type="number" value={form.interest_rate_percent} onChange={(e) => onChange('interest_rate_percent', e.target.value)} style={input} /></Field>
              <Field label="Tenor options in months (comma separated)"><textarea value={form.tenor_options_months} onChange={(e) => onChange('tenor_options_months', e.target.value)} style={textarea} /></Field>
              <Field label="Minimum down payment %"><input type="number" value={form.minimum_down_payment_percent} onChange={(e) => onChange('minimum_down_payment_percent', e.target.value)} style={input} /></Field>
              <Field label="Processing time days"><input type="number" value={form.processing_time_days} onChange={(e) => onChange('processing_time_days', e.target.value)} style={input} /></Field>
              <Field label="Eligibility criteria"><textarea value={form.eligibility_criteria} onChange={(e) => onChange('eligibility_criteria', e.target.value)} style={textarea} /></Field>
              <Field label="Required documents (comma separated)"><textarea value={form.required_documents} onChange={(e) => onChange('required_documents', e.target.value)} style={textarea} /></Field>
              <Field label="Workflow notes"><textarea value={form.workflow_notes} onChange={(e) => onChange('workflow_notes', e.target.value)} style={textarea} /></Field>
            </div>
          )}

          {step === 4 && (
            <div style={grid}>
              <Field label="Accepted customer types (comma separated)"><textarea value={form.accepted_customer_types} onChange={(e) => onChange('accepted_customer_types', e.target.value)} style={textarea} /></Field>
              <Field label="Minimum income"><input type="number" value={form.minimum_income} onChange={(e) => onChange('minimum_income', e.target.value)} style={input} /></Field>
              <Field label="Minimum turnover"><input type="number" value={form.minimum_turnover} onChange={(e) => onChange('minimum_turnover', e.target.value)} style={input} /></Field>
              <Field label="Geographic restrictions (comma separated)"><textarea value={form.geographic_restrictions} onChange={(e) => onChange('geographic_restrictions', e.target.value)} style={textarea} /></Field>
              <Field label="Accepted project categories (comma separated)"><textarea value={form.accepted_project_categories} onChange={(e) => onChange('accepted_project_categories', e.target.value)} style={textarea} /></Field>
              <label style={checkRow}><input type="checkbox" checked={form.approved_installer_only} onChange={(e) => onChange('approved_installer_only', e.target.checked)} /><span>Approved installer only</span></label>
              <Field label="Disbursement type"><input value={form.disbursement_type} onChange={(e) => onChange('disbursement_type', e.target.value)} style={input} /></Field>
              <Field label="Milestone payout logic"><textarea value={form.milestone_payout_logic} onChange={(e) => onChange('milestone_payout_logic', e.target.value)} style={textarea} /></Field>
              <Field label="Payout evidence required"><textarea value={form.payout_evidence_required} onChange={(e) => onChange('payout_evidence_required', e.target.value)} style={textarea} /></Field>
              <Field label="Settlement account name"><input value={form.settlement_account_name} onChange={(e) => onChange('settlement_account_name', e.target.value)} style={input} /></Field>
              <Field label="Settlement bank name"><input value={form.settlement_bank_name} onChange={(e) => onChange('settlement_bank_name', e.target.value)} style={input} /></Field>
              <Field label="Settlement account number"><input value={form.settlement_account_number} onChange={(e) => onChange('settlement_account_number', e.target.value)} style={input} /></Field>
              <Field label="SLA days"><input type="number" value={form.sla_days} onChange={(e) => onChange('sla_days', e.target.value)} style={input} /></Field>
              <Field label="Legal disclaimer"><textarea value={form.legal_disclaimer} onChange={(e) => onChange('legal_disclaimer', e.target.value)} style={textarea} /></Field>
            </div>
          )}

          <div style={actions}>
            <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} style={secondaryBtn}>Back</button>
            <button type="button" onClick={saveDraft} disabled={saving} style={secondaryBtn}>{saving ? 'Saving...' : 'Save Draft'}</button>
            {step < 4 ? (
              <button type="button" onClick={() => setStep((s) => Math.min(4, s + 1))} style={primaryBtn}>Next</button>
            ) : (
              <button type="button" onClick={submitForReview} disabled={saving} style={primaryBtn}>{saving ? 'Submitting...' : 'Submit for Review'}</button>
            )}
          </div>
        </div>
      )}

      {onboardingId ? (
        <DocumentUploader
          bucketId="bank-onboarding-docs"
          ownerId={user.id}
          role="bank"
          onboardingTable="bank_onboarding"
          onboardingId={onboardingId}
          requiredDocuments={[
            { value: 'product_policy', label: 'Product Policy' },
            { value: 'regulatory_document', label: 'Regulatory Document' },
            { value: 'sla_document', label: 'SLA Document' },
            { value: 'legal_terms', label: 'Legal Terms' }
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

const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 16 }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }
const input = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #d1d5db', boxSizing: 'border-box' }
const textarea = { ...input, minHeight: 110, resize: 'vertical' }
const actions = { display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 18 }
const primaryBtn = { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', fontWeight: 700 }
const secondaryBtn = { background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', fontWeight: 700 }
const checkRow = { display: 'flex', gap: 10, alignItems: 'center' }