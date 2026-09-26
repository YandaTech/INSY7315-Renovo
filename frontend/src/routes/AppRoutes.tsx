import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import SignUpPage from '../pages/SignUpPage'
import Dashboard from '../pages/Dashboard'
import LogCall from '../pages/LogCall'
import Statistics from '../pages/Statistics'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
         <Route path="/signup" element={<SignUpPage />} />
         <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/log-call" element={<LogCall />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </BrowserRouter>
  )
}