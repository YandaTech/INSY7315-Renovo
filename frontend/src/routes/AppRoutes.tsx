import { lazy, type ReactNode, Suspense } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import ProtectedRoute from './ProtectedRoute'
import { pageLoaders } from './pages'
import { Spinner } from '../components/ui'

// The login page is in the main bundle because most visits start there.
// Every other page is its own chunk, loaded when first opened, so the
// login page does not download the charts (recharts) or the Twilio Voice
// SDK (DemoCall).
const SignUpPage = lazy(pageLoaders.signUp)
const Dashboard = lazy(pageLoaders.dashboard)
const Statistics = lazy(pageLoaders.statistics)
const Pricing = lazy(pageLoaders.pricing)
const Profile = lazy(pageLoaders.profile)
const Staff = lazy(pageLoaders.staff)
const AuditLog = lazy(pageLoaders.auditLog)
const DemoCall = lazy(pageLoaders.demoCall)

function Page({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner /></div>}>
      {children}
    </Suspense>
  )
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Page><SignUpPage /></Page>} />
        <Route path="/dashboard" element={<ProtectedRoute><Page><Dashboard /></Page></ProtectedRoute>} />
        <Route path="/log-call" element={<Navigate to="/dashboard" replace />} />
        <Route path="/statistics" element={<ProtectedRoute><Page><Statistics /></Page></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><Page><Pricing /></Page></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Page><Profile /></Page></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute adminOnly><Page><Staff /></Page></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute adminOnly><Page><AuditLog /></Page></ProtectedRoute>} />
        <Route path="/demo-call" element={<ProtectedRoute><Page><DemoCall /></Page></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
