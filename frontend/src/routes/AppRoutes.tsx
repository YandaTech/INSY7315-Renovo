import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import SignUpPage from '../pages/SignUpPage'
import Dashboard from '../pages/Dashboard'
import Statistics from '../pages/Statistics'
import Pricing from '../pages/Pricing'
import Profile from '../pages/Profile'
import ProtectedRoute from './ProtectedRoute'

// Loaded on demand: it pulls in the Twilio Voice SDK
const DemoCall = lazy(() => import('../pages/DemoCall'))

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/log-call" element={<Navigate to="/dashboard" replace />} />
        <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/demo-call" element={<ProtectedRoute><Suspense fallback={null}><DemoCall /></Suspense></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
