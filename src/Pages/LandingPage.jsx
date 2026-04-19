import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const previewImages = [
  { src: '/screenshots/user-dashboard.png', title: 'User Dashboard' },
  { src: '/screenshots/installer-dashboard.png', title: 'Installer Dashboard' },
  { src: '/screenshots/bank-dashboard.png', title: 'Bank Dashboard' },
  { src: '/screenshots/admin-review.png', title: 'Admin Review' }
]

export default function LandingPage({ onGetStarted, onSignIn, onOpenDashboard, isLoggedIn }) {
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
      <div style={bgGlowOne} />
      <div style={bgGlowTwo} />

      <nav style={navBar}>
        <div style={brandWrap}>
          <div style={brandMark}>⚡</div>
          <div>
            <div style={brandTitle}>PowerNaija</div>
            <div style={brandSub}>Solar finance platform</div>
          </div>
        </div>

        <div style={navLinks}>
          <a href="#features" style={navLink}>Features</a>
          <a href="#how-it-works" style={navLink}>How It Works</a>
          <a href="#roles" style={navLink}>Roles</a>
          <a href="#screenshots" style={navLink}>Screenshots</a>
          <a href="#contact" style={navLink}>Contact</a>
        </div>

        <div style={headerActions}>
          <button type="button" onClick={onSignIn} style={ghostBtn}>
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
        <section style={heroSection}>
          <div style={heroContent}>
            <div style={eyebrow}>Finance solar smarter</div>
            <h1 style={heroTitle}>
              One platform for users, installers, and banks to move solar projects from request to approval.
            </h1>
            <p style={heroText}>
              PowerNaija streamlines the full solar financing journey. Users submit applications,
              installers send quotes, banks make decisions, and admins control approvals in one
              connected digital workflow.
            </p>

            <div style={heroActions}>
              <button
                type="button"
                onClick={isLoggedIn ? onOpenDashboard : onGetStarted}
                style={primaryBtnLarge}
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Start Your Application'}
              </button>
              <button type="button" onClick={onSignIn} style={ghostBtnLarge}>
                Sign In
              </button>
            </div>

            <div style={heroMetrics}>
              <MetricCard value="3 Roles" label="Users, Installers, Banks" />
              <MetricCard value="1 Flow" label="Request → Quote → Decision" />
              <MetricCard value="Live" label="Approval tracking" />
            </div>
          </div>

          <div style={heroPanel}>
            <div style={mockWindow}>
              <div style={mockTopBar}>
                <span style={dot('#ef4444')} />
                <span style={dot('#f59e0b')} />
                <span style={dot('#10b981')} />
              </div>

              <div style={mockBody}>
                <div style={mockSidebar}>
                  <div style={mockSidebarBlock} />
                  <div style={mockSidebarLine} />
                  <div style={mockSidebarLine} />
                  <div style={mockSidebarLine} />
                </div>

                <div style={mockMain}>
                  <div style={mockHeroCard}>
                    <div style={mockLabel}>PowerNaija Dashboard</div>
                    <div style={mockHeading}>Track onboarding, quotes and finance decisions</div>
                  </div>

                  <div style={mockGrid}>
                    <div style={mockStatCard}>
                      <div style={mockStatLabel}>Applications</div>
                      <div style={mockStatValue}>128</div>
                    </div>
                    <div style={mockStatCard}>
                      <div style={mockStatLabel}>Quotes</div>
                      <div style={mockStatValue}>84</div>
                    </div>
                    <div style={mockStatCard}>
                      <div style={mockStatLabel}>Approved</div>
                      <div style={mockStatValue}>31</div>
                    </div>
                  </div>

                  <div style={mockTableCard}>
                    <div style={mockRow}>
                      <span style={mockPill('#dbeafe', '#1d4ed8')}>Submitted</span>
                      <span style={mockBarLong} />
                    </div>
                    <div style={mockRow}>
                      <span style={mockPill('#dcfce7', '#166534')}>Approved</span>
                      <span style={mockBarMed} />
                    </div>
                    <div style={mockRow}>
                      <span style={mockPill('#fee2e2', '#991b1b')}>Rejected</span>
                      <span style={mockBarShort} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" style={section}>
          <div style={sectionIntro}>
            <div style={sectionEyebrow}>How it works</div>
            <h2 style={sectionTitle}>A clear financing journey for every stakeholder</h2>
            <p style={sectionText}>
              PowerNaija is built to remove delays, confusion, and disconnected handoffs between
              customers, installers, and banks.
            </p>
          </div>

          <div style={stepsGrid}>
            <StepCard
              number="01"
              title="User submits application"
              text="Customers create a solar request, add project details, and choose a preferred bank."
            />
            <StepCard
              number="02"
              title="Installer sends quote"
              text="Approved installers review requests and submit structured pricing and delivery timelines."
            />
            <StepCard
              number="03"
              title="Bank makes decision"
              text="Banks review financing applications, record notes, and approve, reject, or mark under review."
            />
            <StepCard
              number="04"
              title="User sees live status"
              text="The customer tracks every stage in one place, including quotes, bank updates, and approval status."
            />
          </div>
        </section>

        <section id="roles" style={section}>
          <div style={sectionIntro}>
            <div style={sectionEyebrow}>Built for every role</div>
            <h2 style={sectionTitle}>One platform, tailored workspaces</h2>
          </div>

          <div style={roleGrid}>
            <RoleCard
              icon="👤"
              title="For Users"
              text="Create solar applications, receive installer quotes, send quotes to banks, and track financing outcomes live."
            />
            <RoleCard
              icon="🛠️"
              title="For Installers"
              text="Access open requests, submit quote offers, and manage your active sales pipeline in a cleaner workflow."
            />
            <RoleCard
              icon="🏦"
              title="For Banks"
              text="Review finance applications, add decision notes, and update approval status with a structured control panel."
            />
            <RoleCard
              icon="🛡️"
              title="For Admins"
              text="Control onboarding, verify documents, review history, and approve access across all platform participants."
            />
          </div>
        </section>

        <section id="features" style={section}>
          <div style={featureBanner}>
            <div>
              <div style={sectionEyebrow}>Why PowerNaija</div>
              <h2 style={{ ...sectionTitle, marginBottom: 10 }}>
                Modern solar financing operations in one product
              </h2>
              <p style={sectionText}>
                Replace fragmented emails, spreadsheets, and delayed approvals with a more modern,
                transparent platform experience.
              </p>
            </div>

            <div style={featureList}>
              <FeaturePill text="Onboarding and document verification" />
              <FeaturePill text="Installer quote workflow" />
              <FeaturePill text="Bank decision pipeline" />
              <FeaturePill text="Live user status tracking" />
              <FeaturePill text="Role-based dashboards" />
              <FeaturePill text="Audit-ready admin review" />
            </div>
          </div>
        </section>

        <section id="screenshots" style={section}>
          <div style={sectionIntro}>
            <div style={sectionEyebrow}>Platform Preview</div>
            <h2 style={sectionTitle}>See the product in action</h2>
            <p style={sectionText}>
              Explore the role-based experience across user applications, installer quoting,
              bank decisioning, and admin onboarding review.
            </p>
          </div>

          <div style={previewGrid}>
            {previewImages.map((item) => (
              <PreviewCard key={item.title} title={item.title} src={item.src} />
            ))}
          </div>
        </section>

        <section style={section}>
          <div style={sectionIntro}>
            <div style={sectionEyebrow}>Trust & Use Cases</div>
            <h2 style={sectionTitle}>Designed for real solar financing operations</h2>
          </div>

          <div style={roleGrid}>
            <RoleCard
              icon="🏠"
              title="Homeowners"
              text="Create financing-ready solar requests without chasing installers and banks separately."
            />
            <RoleCard
              icon="🔧"
              title="Solar Installers"
              text="Respond faster to live opportunities and structure quotes in a cleaner workflow."
            />
            <RoleCard
              icon="💳"
              title="Financial Institutions"
              text="Review, decide and track applications with better visibility and control."
            />
            <RoleCard
              icon="📋"
              title="Operations Teams"
              text="Keep approvals, documentation and status history in one audit-friendly system."
            />
          </div>
        </section>

        <section id="contact" style={ctaSection}>
          <div style={ctaCard}>
            <div style={sectionEyebrow}>Contact / Demo</div>
            <h2 style={ctaTitle}>Start building a better solar finance experience today.</h2>
            <p style={ctaText}>
              Bring customers, installers, banks, and approvals into one workflow-first platform.
            </p>

            <div style={heroActions}>
              <button
                type="button"
                onClick={isLoggedIn ? onOpenDashboard : onGetStarted}
                style={primaryBtnLarge}
              >
                {isLoggedIn ? 'Open Dashboard' : 'Create Account'}
              </button>
              <button type="button" onClick={onSignIn} style={ghostBtnLarge}>
                Sign In
              </button>
            </div>

            <form onSubmit={handleContactSubmit} style={contactFormWrap}>
              <div style={contactGrid}>
                <Field label="Name">
                  <input
                    value={contactForm.name}
                    onChange={(e) => handleContactChange('name', e.target.value)}
                    style={contactInput}
                    placeholder="Your name"
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    style={contactInput}
                    placeholder="you@example.com"
                  />
                </Field>

                <Field label="Role">
                  <select
                    value={contactForm.role}
                    onChange={(e) => handleContactChange('role', e.target.value)}
                    style={{
                      ...contactSelect,
                      color: contactForm.role ? '#ffffff' : 'rgba(255,255,255,0.72)'
                    }}
                  >
                    <option value="" style={contactOption}>Select role</option>
                    <option value="user" style={contactOption}>User</option>
                    <option value="installer" style={contactOption}>Installer</option>
                    <option value="bank" style={contactOption}>Bank</option>
                    <option value="partner" style={contactOption}>Partner</option>
                  </select>
                </Field>

                <Field label="Message">
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => handleContactChange('message', e.target.value)}
                    style={contactTextarea}
                    placeholder="Tell us what you want to do with PowerNaija"
                  />
                </Field>
              </div>

              <div style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <button type="submit" style={submitContactBtn} disabled={contactLoading}>
                  {contactLoading ? 'Sending...' : 'Send Message'}
                </button>

                {contactMessage ? <div style={contactSuccess}>{contactMessage}</div> : null}
                {contactError ? <div style={contactErrorBox}>{contactError}</div> : null}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer style={footer}>
        <div>
          <div style={{ fontWeight: 800, color: '#0f172a' }}>PowerNaija</div>
          <div style={{ marginTop: 6 }}>
            Solar finance platform for users, installers and banks.
          </div>
        </div>

        <div style={footerColumn}>
          <div style={footerHeading}>Company</div>
          <a href="#features" style={footerLink}>Features</a>
          <a href="#how-it-works" style={footerLink}>How It Works</a>
          <a href="#roles" style={footerLink}>Roles</a>
        </div>

        <div style={footerColumn}>
          <div style={footerHeading}>Legal</div>
          <span style={footerLink}>Privacy Policy</span>
          <span style={footerLink}>Terms of Use</span>
        </div>

        <div style={footerColumn}>
          <div style={footerHeading}>Contact</div>
          <span style={footerLink}>hello@powernaija.com</span>
          <span style={footerLink}>Lagos, Nigeria</span>
        </div>
      </footer>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
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

function StepCard({ number, title, text }) {
  return (
    <article style={stepCard}>
      <div style={stepNumber}>{number}</div>
      <div style={stepTitle}>{title}</div>
      <div style={stepText}>{text}</div>
    </article>
  )
}

function RoleCard({ icon, title, text }) {
  return (
    <article style={roleCard}>
      <div style={roleIcon}>{icon}</div>
      <div style={roleTitle}>{title}</div>
      <div style={roleText}>{text}</div>
    </article>
  )
}

function FeaturePill({ text }) {
  return <div style={featurePill}>{text}</div>
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

const dot = (background) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  background,
  display: 'inline-block'
})

const mockPill = (background, color) => ({
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

const bgGlowOne = {
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

const bgGlowTwo = {
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

const navBar = {
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

const brandWrap = {
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

const headerActions = {
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
  fontWeight: 800,
  boxShadow: '0 14px 28px rgba(37, 99, 235, 0.18)'
}

const ghostBtn = {
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

const ghostBtnLarge = {
  ...ghostBtn,
  padding: '14px 20px',
  borderRadius: 16
}

const main = {
  maxWidth: 1240,
  margin: '0 auto',
  padding: '10px 20px 48px',
  display: 'grid',
  gap: 26,
  position: 'relative',
  zIndex: 2
}

const heroSection = {
  display: 'grid',
  gridTemplateColumns: '1.05fr 0.95fr',
  gap: 26,
  alignItems: 'center'
}

const heroContent = {
  minWidth: 0
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
  letterSpacing: -1.4
}

const heroText = {
  marginTop: 18,
  fontSize: 17,
  lineHeight: 1.7,
  color: '#475569',
  maxWidth: 760
}

const heroActions = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  marginTop: 24
}

const heroMetrics = {
  marginTop: 28,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 14
}

const metricCard = {
  borderRadius: 22,
  padding: 18,
  background: 'rgba(255,255,255,0.78)',
  backdropFilter: 'blur(12px)',
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
  color: '#64748b',
  lineHeight: 1.5
}

const heroPanel = {
  minWidth: 0
}

const mockWindow = {
  borderRadius: 30,
  background: 'rgba(255,255,255,0.84)',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  boxShadow: '0 30px 80px rgba(15, 23, 42, 0.12)',
  overflow: 'hidden',
  backdropFilter: 'blur(18px)'
}

const mockTopBar = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  padding: 14,
  borderBottom: '1px solid #e2e8f0',
  background: 'rgba(248, 250, 252, 0.96)'
}

const mockBody = {
  display: 'grid',
  gridTemplateColumns: '140px 1fr',
  minHeight: 440
}

const mockSidebar = {
  borderRight: '1px solid #e2e8f0',
  padding: 14,
  background: '#f8fafc',
  display: 'grid',
  alignContent: 'start',
  gap: 10
}

const mockSidebarBlock = {
  height: 74,
  borderRadius: 18,
  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
}

const mockSidebarLine = {
  height: 36,
  borderRadius: 12,
  background: '#e2e8f0'
}

const mockMain = {
  padding: 18,
  display: 'grid',
  gap: 16,
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
}

const mockHeroCard = {
  borderRadius: 22,
  padding: 18,
  background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
  color: '#fff'
}

const mockLabel = {
  fontSize: 12,
  opacity: 0.8,
  marginBottom: 8
}

const mockHeading = {
  fontSize: 20,
  fontWeight: 900,
  lineHeight: 1.2
}

const mockGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 12
}

const mockStatCard = {
  borderRadius: 18,
  padding: 14,
  border: '1px solid #e2e8f0',
  background: '#fff'
}

const mockStatLabel = {
  fontSize: 11,
  color: '#64748b',
  marginBottom: 8
}

const mockStatValue = {
  fontSize: 24,
  fontWeight: 900,
  color: '#0f172a'
}

const mockTableCard = {
  borderRadius: 20,
  padding: 16,
  border: '1px solid #e2e8f0',
  background: '#fff',
  display: 'grid',
  gap: 12
}

const mockRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 12
}

const mockBarLong = {
  height: 12,
  flex: 1,
  borderRadius: 999,
  background: '#dbeafe'
}

const mockBarMed = {
  height: 12,
  width: '65%',
  borderRadius: 999,
  background: '#dcfce7'
}

const mockBarShort = {
  height: 12,
  width: '42%',
  borderRadius: 999,
  background: '#fee2e2'
}

const section = {
  display: 'grid',
  gap: 18
}

const sectionIntro = {
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
  color: '#0f172a',
  letterSpacing: -0.8
}

const sectionText = {
  marginTop: 12,
  fontSize: 16,
  color: '#64748b',
  lineHeight: 1.7
}

const stepsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 16
}

const stepCard = {
  borderRadius: 24,
  padding: 20,
  background: 'rgba(255,255,255,0.78)',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.05)'
}

const stepNumber = {
  width: 44,
  height: 44,
  borderRadius: 14,
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  color: '#fff',
  fontWeight: 900,
  fontSize: 13,
  marginBottom: 14
}

const stepTitle = {
  fontSize: 18,
  fontWeight: 850,
  color: '#0f172a',
  marginBottom: 8
}

const stepText = {
  color: '#64748b',
  lineHeight: 1.6
}

const roleGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 16
}

const roleCard = {
  borderRadius: 24,
  padding: 20,
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.05)'
}

const roleIcon = {
  width: 52,
  height: 52,
  borderRadius: 16,
  display: 'grid',
  placeItems: 'center',
  background: '#eff6ff',
  fontSize: 24,
  marginBottom: 14
}

const roleTitle = {
  fontSize: 20,
  fontWeight: 850,
  color: '#0f172a',
  marginBottom: 8
}

const roleText = {
  color: '#64748b',
  lineHeight: 1.65
}

const featureBanner = {
  borderRadius: 30,
  padding: 24,
  background: 'linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  display: 'grid',
  gap: 18
}

const featureList = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap'
}

const featurePill = {
  padding: '10px 14px',
  borderRadius: 999,
  background: '#fff',
  border: '1px solid #dbeafe',
  color: '#1d4ed8',
  fontWeight: 700,
  fontSize: 13
}

const previewGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 16
}

const previewCard = {
  borderRadius: 24,
  overflow: 'hidden',
  background: '#ffffff',
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
  background: '#ffffff'
}

const ctaSection = {
  marginTop: 6
}

const ctaCard = {
  borderRadius: 30,
  padding: 26,
  background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
  color: '#fff',
  boxShadow: '0 30px 70px rgba(37, 99, 235, 0.18)'
}

const ctaTitle = {
  margin: '8px 0 0 0',
  fontSize: 36,
  lineHeight: 1.08,
  fontWeight: 950,
  maxWidth: 860
}

const ctaText = {
  marginTop: 12,
  color: 'rgba(255,255,255,0.82)',
  lineHeight: 1.65,
  maxWidth: 780
}

const contactFormWrap = {
  marginTop: 24,
  padding: 20,
  borderRadius: 22,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)'
}

const contactGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14
}

const fieldLabel = {
  fontSize: 13,
  color: 'rgba(255,255,255,0.84)',
  fontWeight: 700
}

const contactInput = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  boxSizing: 'border-box'
}

const contactSelect = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(255,255,255,0.12)',
  boxSizing: 'border-box',
  appearance: 'auto'
}

const contactOption = {
  background: '#ffffff',
  color: '#0f172a'
}

const contactTextarea = {
  ...contactInput,
  minHeight: 110,
  resize: 'vertical'
}

const submitContactBtn = {
  background: '#fff',
  color: '#0f172a',
  border: 'none',
  borderRadius: 14,
  padding: '12px 16px',
  cursor: 'pointer',
  fontWeight: 800
}

const contactSuccess = {
  alignSelf: 'center',
  color: '#bbf7d0',
  fontWeight: 700
}

const contactErrorBox = {
  alignSelf: 'center',
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

const footerColumn = {
  display: 'grid',
  gap: 8,
  minWidth: 140
}

const footerHeading = {
  fontWeight: 800,
  color: '#0f172a'
}

const footerLink = {
  color: '#64748b'
}