import UserDashboard from './Pages/UserDashboard'
import InstallerDashboard from './Pages/InstallerDashboard'
import BankDashboard from './Pages/BankDashboard'
import AdminOnboardingReview from './Pages/AdminOnboardingReview'
import UserOnboarding from './Pages/UserOnboarding'
import InstallerOnboarding from './Pages/InstallerOnboarding'
import BankOnboarding from './Pages/BankOnboarding'
import WaitingStatusPage from './Pages/WaitingStatusPage'

export default function DashboardRouter({ user, profile }) {
  const role = String(profile?.role || 'user').toLowerCase()
  const onboardingStatus = String(profile?.onboarding_status || 'draft').toLowerCase()

  if (role === 'admin') {
    return <AdminOnboardingReview user={user} profile={profile} />
  }

  if (role === 'user') {
    if (onboardingStatus === 'draft' || onboardingStatus === 'rejected') {
      return <UserOnboarding user={user} profile={profile} />
    }
    if (onboardingStatus === 'submitted' || onboardingStatus === 'under_review') {
      return <WaitingStatusPage profile={profile} title="User Status" />
    }
    return <UserDashboard user={user} profile={profile} />
  }

  if (role === 'installer') {
    if (onboardingStatus === 'draft' || onboardingStatus === 'rejected') {
      return <InstallerOnboarding user={user} profile={profile} />
    }
    if (onboardingStatus === 'submitted' || onboardingStatus === 'under_review') {
      return <WaitingStatusPage profile={profile} title="Installer Status" />
    }
    return <InstallerDashboard user={user} profile={profile} />
  }

  if (role === 'bank') {
    if (onboardingStatus === 'draft' || onboardingStatus === 'rejected') {
      return <BankOnboarding user={user} profile={profile} />
    }
    if (onboardingStatus === 'submitted' || onboardingStatus === 'under_review') {
      return <WaitingStatusPage profile={profile} title="Bank Status" />
    }
    return <BankDashboard user={user} profile={profile} />
  }

  return <UserDashboard user={user} profile={profile} />
}