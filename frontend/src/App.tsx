import AppRoutes from './routes/AppRoutes'
import SessionProvider from './lib/SessionProvider'
import ToastProvider from './components/ToastProvider'

function App() {
  return (
    <SessionProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </SessionProvider>
  )
}

export default App
