export default function PrivacyPolicy({ onBackHome, onSignIn }) {
  return (
    <div style={page}>
      <div style={card}>
        <div style={eyebrow}>Legal</div>
        <h1 style={title}>Privacy Policy</h1>
        <p style={intro}>
          PowerNaija values your privacy. This page explains how we collect, use,
          store, and protect personal information shared through our platform.
        </p>

        <section style={section}>
          <h2 style={heading}>1. Information we collect</h2>
          <p style={text}>
            We may collect information you provide directly, including your name,
            email address, role, onboarding details, project information,
            uploaded documents, and messages submitted through contact forms.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>2. How we use your information</h2>
          <p style={text}>
            We use your information to operate the PowerNaija platform, manage
            onboarding, process solar finance workflows, support users, improve
            the service, and communicate updates relevant to your use of the
            platform.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>3. Data storage and protection</h2>
          <p style={text}>
            We use third-party infrastructure and service providers, including
            secure database and storage systems, to help run the platform. We
            take reasonable technical and organisational measures to protect your
            information against unauthorised access, loss, or misuse.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>4. Sharing of information</h2>
          <p style={text}>
            We do not sell your personal information. Information may be shared
            only where necessary to operate the platform, comply with legal
            obligations, or support workflows involving users, installers,
            banks, and administrators within the PowerNaija ecosystem.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>5. Cookies and analytics</h2>
          <p style={text}>
            We may use cookies, analytics tools, and similar technologies to
            understand website usage, improve performance, and support business
            insights.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>6. Your rights</h2>
          <p style={text}>
            You may request access to, correction of, or deletion of your
            personal information, subject to legal, contractual, and operational
            requirements.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>7. Contact</h2>
          <p style={text}>
            For privacy questions, contact PowerNaija at{' '}
            <strong>oluwasegunwaheed@gmail.com</strong>.
          </p>
        </section>

        <div style={buttonRow}>
          <button type="button" onClick={onBackHome} style={secondaryBtn}>
            Back Home
          </button>
          <button type="button" onClick={onSignIn} style={primaryBtn}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

const page = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
  padding: 24,
  display: 'grid',
  placeItems: 'center'
}

const card = {
  width: '100%',
  maxWidth: 920,
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 28,
  padding: 28,
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)'
}

const eyebrow = {
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(37,99,235,0.10)',
  color: '#1d4ed8',
  fontWeight: 800,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.7,
  marginBottom: 14
}

const title = {
  margin: 0,
  fontSize: 42,
  lineHeight: 1.05,
  color: '#0f172a'
}

const intro = {
  marginTop: 14,
  color: '#64748b',
  lineHeight: 1.7
}

const section = {
  marginTop: 22
}

const heading = {
  margin: '0 0 8px 0',
  fontSize: 22,
  color: '#0f172a'
}

const text = {
  margin: 0,
  color: '#475569',
  lineHeight: 1.75
}

const buttonRow = {
  marginTop: 28,
  display: 'flex',
  gap: 12,
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