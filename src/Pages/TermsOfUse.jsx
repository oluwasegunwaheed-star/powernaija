export default function TermsOfUse({ onBackHome, onSignIn }) {
  return (
    <div style={page}>
      <div style={card}>
        <div style={eyebrow}>Legal</div>
        <h1 style={title}>Terms of Use</h1>
        <p style={intro}>
          These terms govern access to and use of the PowerNaija platform,
          website, and related services.
        </p>

        <section style={section}>
          <h2 style={heading}>1. Acceptance of terms</h2>
          <p style={text}>
            By accessing or using PowerNaija, you agree to comply with these
            terms and all applicable laws and regulations.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>2. Platform purpose</h2>
          <p style={text}>
            PowerNaija is designed to support workflows involving solar finance
            applications, installer quotes, bank decisioning, and administrative
            review. Use of the platform must be lawful, accurate, and in good
            faith.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>3. User responsibilities</h2>
          <p style={text}>
            You are responsible for ensuring that information submitted through
            the platform is accurate, complete, and not misleading. You must not
            misuse the platform, interfere with its operation, or attempt
            unauthorised access.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>4. Accounts and access</h2>
          <p style={text}>
            Access to certain features may require registration, approval, or
            role-based permissions. PowerNaija may suspend or restrict access
            where necessary for compliance, security, or operational reasons.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>5. Intellectual property</h2>
          <p style={text}>
            The platform design, branding, content structure, and software
            components remain the property of PowerNaija or its licensors unless
            otherwise stated.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>6. Limitation of liability</h2>
          <p style={text}>
            PowerNaija provides the platform on an as-available basis. While we
            aim for reliability and accuracy, we do not guarantee uninterrupted
            service or outcomes related to finance approvals, business decisions,
            or third-party actions.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>7. Changes to terms</h2>
          <p style={text}>
            We may update these terms from time to time. Continued use of the
            platform after updates means you accept the revised terms.
          </p>
        </section>

        <section style={section}>
          <h2 style={heading}>8. Contact</h2>
          <p style={text}>
            Questions about these terms can be sent to{' '}
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