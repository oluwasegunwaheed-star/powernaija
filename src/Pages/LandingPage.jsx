import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const previewImages = [
  { src: '/screenshots/user-dashboard.png', title: 'User Dashboard' },
  { src: '/screenshots/installer-dashboard.png', title: 'Installer Dashboard' },
  { src: '/screenshots/bank-dashboard.png', title: 'Bank Dashboard' },
  { src: '/screenshots/admin-review.png', title: 'Admin Review' }
]

export default function LandingPage({
  onGetStarted,
  onSignIn,
  onOpenDashboard,
  onOpenPrivacy,
  onOpenTerms,
  isLoggedIn
}) {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    role: '',
    message: ''
  })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactMessage, setContactMessage] = useState('')
  const [contactError, setContactError] = useState('')

  const handleContactChange = (field, value) => {
    setContactForm((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setContactMessage('')
    setContactError('')

    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactError('Please complete name, email and message.')
      return
    }

    try {
      setContactLoading(true)

      const { error } = await supabase.from('contact_messages').insert({
        name: contactForm.name.trim(),
        email: contactForm.email.trim(),
        role: contactForm.role.trim() || null,
        message: contactForm.message.trim()
      })

      if (error) throw error

      setContactMessage('Message sent successfully.')
      setContactForm({
        name: '',
        email: '',
        role: '',
        message: ''
      })
    } catch (err) {
      setContactError(err.message || 'Failed to send message.')
    } finally {
      setContactLoading(false)
    }
  }

  return (
    <div style={page}>
      <div style={glowOne} />
      <div style={glowTwo} />

      <nav style={nav}>
        <div style={brand}>
          <div style={brandMark}>⚡</div>
          <div>
            <div style={brandTitle}>PowerNaija</div>
            <div style={brandSub}>Solar finance platform</div>
          </div>
        </div>

        <div style={navLinks}>
          <a href="#features" style={navLink}>Features</a>
          <a href="#screenshots" style={navLink}>Screenshots</a>
          <a href="#contact" style={navLink}>Contact</a>
        </div>

        <div style={navActions}>
          <button type="button" onClick={onSignIn} style={secondaryBtn}>
            Sign In
          </button>
          <button
            type="button"
            onClick={isLoggedIn ? onOpenDashboard : onGetStarted}
            style={primaryBtn}
          >
            {isLoggedIn ? 'Open Dashboard' : 'Get Started'}
          </button>
        </div>
      </nav>

      <main style={main}>
        <section style={hero}>
          <div>
            <div style={eyebrow}>Finance solar smarter</div>
            <h1 style={heroTitle}>
              One platform for users, installers and banks to move solar projects from request to approval.
            </h1>
            <p style={heroText}>
              PowerNaija simplifies applications, installer quotes, bank decisions,
              and admin review in one connected workflow.
            </p>

            <div style={heroActions}>
              <button
                type="button"
                onClick={isLoggedIn ? onOpenDashboard : onGetStarted}
                style={primaryBtnLarge}
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Start Your Application'}
              </button>
              <button type="button" onClick={onSignIn} style={secondaryBtnLarge}>
                Sign In
              </button>
            </div>

            <div style={metrics}>
              <MetricCard value="3 Roles" label="Users, Installers, Banks" />
              <MetricCard value="1 Flow" label="Request → Quote → Decision" />
              <MetricCard value="Live" label="Status tracking" />
            </div>
          </div>

          <div style={heroCard}>
            <div style={heroCardHeader}>Platform Overview</div>
            <div style={heroStats}>
              <div style={statCard}>
                <div style={statLabel}>Applications</div>
                <div style={statValue}>128</div>
              </div>
              <div style={statCard}>
                <div style={statLabel}>Quotes</div>
                <div style={statValue}>84</div>
              </div>
              <div style={statCard}>
                <div style={statLabel}>Approved</div>
                <div style={statValue}>31</div>
              </div>
            </div>

            <div style={flowCard}>
              <div style={flowRow}>
                <span style={pill('#dbeafe', '#1d4ed8')}>Submitted</span>
                <span style={barLong} />
              </div>
              <div style={flowRow}>
                <span style={pill('#dcfce7', '#166534')}>Approved</span>
                <span style={barMid} />
              </div>
              <div style={flowRow}>
                <span style={pill('#fee2e2', '#991b1b')}>Rejected</span>
                <span style={barShort} />
              </div>
            </div>
          </div>
        </section>

        <section id="features" style={section}>
          <div style={sectionHeader}>
            <div style={sectionEyebrow}>Features</div>
            <h2 style={sectionTitle}>Built for solar finance operations</h2>
            <p style={sectionText}>
              PowerNaija helps teams manage onboarding, quoting, approval and visibility in one place.
            </p>
          </div>

          <div style={featureGrid}>
            <FeatureCard
              title="User applications"
              text="Capture solar requests with cleaner structured workflows."
            />
            <FeatureCard
              title="Installer quoting"
              text="Let approved installers review and submit quotes quickly."
            />
            <FeatureCard
              title="Bank decisions"
              text="Support review, approval, rejection and decision visibility."
            />
            <FeatureCard
              title="Admin control"
              text="Track onboarding, verification and operational oversight."
            />
          </div>
        </section>

        <section id="screenshots" style={section}>
          <div style={sectionHeader}>
            <div style={sectionEyebrow}>Platform Preview</div>
            <h2 style={sectionTitle}>See the product in action</h2>
            <p style={sectionText}>
              Explore the role-based experience across user applications, installer quoting,
              bank decisioning and admin review.
            </p>
          </div>

          <div style={previewGrid}>
            {previewImages.map((item) => (
              <PreviewCard key={item.title} title={item.title} src={item.src} />
            ))}
          </div>
        </section>

        <section id="contact" style={contactSection}>
          <div style={contactCard}>
            <div style={sectionEyebrow}>Get in Touch</div>
            <h2 style={contactTitle}>Start building a better solar finance experience today.</h2>
            <p style={contactText}>
              Bring customers, installers, banks and approvals into one workflow-first platform.
            </p>

            <form onSubmit={handleContactSubmit} style={form}>
              <div style={formGrid}>
                <Field label="Name">
                  <input
                    value={contactForm.name}
                    onChange={(e) => handleContactChange('name', e.target.value)}
                    style={input}
                    placeholder="Your name"
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    style={input}
                    placeholder="you@example.com"
                  />
                </Field>

                <Field label="Role">
                  <select
                    value={contactForm.role}
                    onChange={(e) => handleContactChange('role', e.target.value)}
                    style={{
                      ...selectInput,
                      color: contactForm.role ? '#ffffff' : 'rgba(255,255,255,0.75)'
                    }}
                  >
                    <option value="" style={optionStyle}>Select role</option>
                    <option value="user" style={optionStyle}>User</option>
                    <option value="installer" style={optionStyle}>Installer</option>
                    <option value="bank" style={optionStyle}>Bank</option>
                    <option value="partner" style={optionStyle}>Partner</option>
                  </select>
                </Field>

                <Field label="Message">
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => handleContactChange('message', e.target.value)}
                    style={textarea}
                    placeholder="Tell us what you want to do with PowerNaija"
                  />
                </Field>
              </div>

              <div style={formActions}>
                <button type="submit" disabled={contactLoading} style={submitBtn}>
                  {contactLoading ? 'Sending...' : 'Send Message'}
                </button>

                {contactMessage ? <div style={successMsg}>{contactMessage}</div> : null}
                {contactError ? <div style={errorMsg}>{contactError}</div> : null}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer style={footer}>
        <div>
          <div style={footerBrand}>PowerNaija</div>
          <div style={footerText}>Solar finance platform for users, installers and banks.</div>
        </div>

        <div style={footerCol}>
          <div style={footerHead}>Company</div>
          <a href="#features" style={footerLink}>Features</a>
          <a href="#screenshots" style={footerLink}>Screenshots</a>
          <a href="#contact" style={footerLink}>Contact</a>
        </div>

        <div style={footerCol}>
          <div style={footerHead}>Legal</div>
          <button type="button" onClick={onOpenPrivacy} style={footerBtn}>
            Privacy Policy
          </button>
          <button type="button" onClick={onOpenTerms} style={footerBtn}>
            Terms of Use
          </button>
        </div>

        <div style={footerCol}>
          <div style={footerHead}>Contact</div>
          <span style={footerLink}>oluwasegunwaheed@gmail.com</span>
          <span style={footerLink}>Lagos, Nigeria</span>
        </div>
      </footer>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </label>
  )
}

function MetricCard({ value, label }) {
  return (
    <div style={metricCard}>
      <div style={metricValue}>{value}</div>
      <div style={metricLabel}>{label}</div>
    </div>
  )
}

function FeatureCard({ title, text }) {
  return (
    <div style={featureCard}>
      <div style={featureTitle}>{title}</div>
      <div style={featureText}>{text}</div>
    </div>
  )
}

function PreviewCard({ title, src }) {
  const [imageError, setImageError] = useState(false)

  return (
    <article style={previewCard}>
      {!imageError ? (
        <img
          src={src}
          alt={title}
          style={previewImage}
          onError={() => setImageError(true)}
        />
      ) : (
        <div style={previewPlaceholder}>
          <div style={previewPlaceholderTitle}>{title}</div>
          <div style={previewPlaceholderText}>Preview image unavailable</div>
        </div>
      )}
      <div style={previewCaption}>{title}</div>
    </article>
  )
}

const pill = (background, color) => ({
  display: 'inline-flex',
  padding: '6px 10px',
  borderRadius: 999,
  background,
  color,
  fontSize: 12,
  fontWeight: 700
})

const page = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 40%, #f8fafc 100%)',
  position: 'relative',
  overflow: 'hidden'
}

const glowOne = {
  position: 'fixed',
  top: -100,
  right: -80,
  width: 360,
  height: 360,
  borderRadius: '50%',
  background: 'rgba(37, 99, 235, 0.14)',
  filter: 'blur(80px)',
  pointerEvents: 'none'
}

const glowTwo = {
  position: 'fixed',
  bottom: -120,
  left: -90,
  width: 380,
  height: 380,
  borderRadius: '50%',
  background: 'rgba(139, 92, 246, 0.10)',
  filter: 'blur(90px)',
  pointerEvents: 'none'
}

const nav = {
  maxWidth: 1240,
  margin: '0 auto',
  padding: '24px 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
  position: 'sticky',
  top: 0,
  zIndex: 20,
  background: 'rgba(248,250,252,0.82)',
  backdropFilter: 'blur(12px)'
}

const brand = {
  display: 'flex',
  alignItems: 'center',
  gap: 14
}

const brandMark = {
  width: 46,
  height: 46,
  borderRadius: 14,
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  color: '#fff',
  fontSize: 22,
  boxShadow: '0 12px 28px rgba(37, 99, 235, 0.22)'
}

const brandTitle = {
  fontSize: 18,
  fontWeight: 900,
  color: '#0f172a'
}

const brandSub = {
  marginTop: 2,
  fontSize: 12,
  color: '#64748b'
}

const navLinks = {
  display: 'flex',
  gap: 18,
  alignItems: 'center',
  flexWrap: 'wrap'
}

const navLink = {
  fontWeight: 700,
  color: '#475569'
}

const navActions = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap'
}

const primaryBtn = {
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 14,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 800
}

const secondaryBtn = {
  background: '#fff',
  color: '#0f172a',
  border: '1px solid #cbd5e1',
  borderRadius: 14,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 700
}

const primaryBtnLarge = {
  ...primaryBtn,
  padding: '14px 20px',
  borderRadius: 16
}

const secondaryBtnLarge = {
  ...secondaryBtn,
  padding: '14px 20px',
  borderRadius: 16
}

const main = {
  maxWidth: 1240,
  margin: '0 auto',
  padding: '10px 20px 48px',
  display: 'grid',
  gap: 28,
  position: 'relative',
  zIndex: 2
}

const hero = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: 24,
  alignItems: 'center'
}

const eyebrow = {
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(37, 99, 235, 0.10)',
  color: '#1d4ed8',
  fontWeight: 800,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.7,
  marginBottom: 16
}

const heroTitle = {
  margin: 0,
  fontSize: 54,
  lineHeight: 1.02,
  fontWeight: 950,
  color: '#0f172a',
  letterSpacing: -1.3
}

const heroText = {
  marginTop: 16,
  fontSize: 17,
  lineHeight: 1.7,
  color: '#475569',
  maxWidth: 720
}

const heroActions = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  marginTop: 24
}

const metrics = {
  marginTop: 28,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 14
}

const metricCard = {
  borderRadius: 22,
  padding: 18,
  background: 'rgba(255,255,255,0.78)',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.05)'
}

const metricValue = {
  fontSize: 24,
  fontWeight: 900,
  color: '#0f172a'
}

const metricLabel = {
  marginTop: 8,
  fontSize: 13,
  color: '#64748b'
}

const heroCard = {
  borderRadius: 28,
  padding: 20,
  background: 'rgba(255,255,255,0.86)',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  boxShadow: '0 28px 70px rgba(15, 23, 42, 0.10)'
}

const heroCardHeader = {
  fontSize: 14,
  fontWeight: 800,
  color: '#475569',
  marginBottom: 14
}

const heroStats = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 12
}

const statCard = {
  borderRadius: 18,
  padding: 14,
  border: '1px solid #e2e8f0',
  background: '#fff'
}

const statLabel = {
  fontSize: 11,
  color: '#64748b',
  marginBottom: 8
}

const statValue = {
  fontSize: 24,
  fontWeight: 900,
  color: '#0f172a'
}

const flowCard = {
  marginTop: 16,
  borderRadius: 20,
  padding: 16,
  border: '1px solid #e2e8f0',
  background: '#fff',
  display: 'grid',
  gap: 12
}

const flowRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 12
}

const barLong = {
  height: 12,
  flex: 1,
  borderRadius: 999,
  background: '#dbeafe'
}

const barMid = {
  height: 12,
  width: '65%',
  borderRadius: 999,
  background: '#dcfce7'
}

const barShort = {
  height: 12,
  width: '42%',
  borderRadius: 999,
  background: '#fee2e2'
}

const section = {
  display: 'grid',
  gap: 18
}

const sectionHeader = {
  maxWidth: 760
}

const sectionEyebrow = {
  fontSize: 12,
  fontWeight: 800,
  color: '#2563eb',
  textTransform: 'uppercase',
  letterSpacing: 0.7,
  marginBottom: 8
}

const sectionTitle = {
  margin: 0,
  fontSize: 38,
  lineHeight: 1.1,
  fontWeight: 950,
  color: '#0f172a'
}

const sectionText = {
  marginTop: 12,
  fontSize: 16,
  color: '#64748b',
  lineHeight: 1.7
}

const featureGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 16
}

const featureCard = {
  borderRadius: 24,
  padding: 20,
  background: '#fff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.05)'
}

const featureTitle = {
  fontSize: 18,
  fontWeight: 850,
  color: '#0f172a',
  marginBottom: 8
}

const featureText = {
  color: '#64748b',
  lineHeight: 1.6
}

const previewGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 16
}

const previewCard = {
  borderRadius: 24,
  overflow: 'hidden',
  background: '#fff',
  border: '1px solid #dbe3f0',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)'
}

const previewImage = {
  width: '100%',
  height: 260,
  objectFit: 'cover',
  objectPosition: 'top',
  display: 'block',
  background: '#f8fafc'
}

const previewPlaceholder = {
  height: 260,
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)',
  padding: 20,
  textAlign: 'center'
}

const previewPlaceholderTitle = {
  fontSize: 20,
  fontWeight: 900,
  color: '#0f172a'
}

const previewPlaceholderText = {
  marginTop: 10,
  fontSize: 13,
  color: '#475569'
}

const previewCaption = {
  padding: '16px 18px',
  fontWeight: 800,
  fontSize: 18,
  color: '#0f172a',
  background: '#fff'
}

const contactSection = {
  marginTop: 6
}

const contactCard = {
  borderRadius: 30,
  padding: 26,
  background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
  color: '#fff',
  boxShadow: '0 30px 70px rgba(37, 99, 235, 0.18)'
}

const contactTitle = {
  margin: '8px 0 0 0',
  fontSize: 36,
  lineHeight: 1.08,
  fontWeight: 950,
  maxWidth: 860
}

const contactText = {
  marginTop: 12,
  color: 'rgba(255,255,255,0.82)',
  lineHeight: 1.65,
  maxWidth: 780
}

const form = {
  marginTop: 24,
  padding: 20,
  borderRadius: 22,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)'
}

const formGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14
}

const fieldWrap = {
  display: 'grid',
  gap: 6
}

const fieldLabel = {
  fontSize: 13,
  color: 'rgba(255,255,255,0.84)',
  fontWeight: 700
}

const input = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  boxSizing: 'border-box'
}

const selectInput = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.12)',
  boxSizing: 'border-box',
  appearance: 'auto'
}

const optionStyle = {
  background: '#ffffff',
  color: '#0f172a'
}

const textarea = {
  ...input,
  minHeight: 110,
  resize: 'vertical'
}

const formActions = {
  marginTop: 14,
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  alignItems: 'center'
}

const submitBtn = {
  background: '#fff',
  color: '#0f172a',
  border: 'none',
  borderRadius: 14,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 800
}

const successMsg = {
  color: '#bbf7d0',
  fontWeight: 700
}

const errorMsg = {
  color: '#fecaca',
  fontWeight: 700
}

const footer = {
  maxWidth: 1240,
  margin: '0 auto',
  padding: '0 20px 28px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 18,
  flexWrap: 'wrap',
  color: '#64748b',
  position: 'relative',
  zIndex: 2
}

const footerCol = {
  display: 'grid',
  gap: 8,
  minWidth: 140
}

const footerBrand = {
  fontWeight: 800,
  color: '#0f172a'
}

const footerText = {
  marginTop: 6
}

const footerHead = {
  fontWeight: 800,
  color: '#0f172a'
}

const footerLink = {
  color: '#64748b'
}

const footerBtn = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  textAlign: 'left',
  color: '#64748b',
  cursor: 'pointer',
  font: 'inherit'
}