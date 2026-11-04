import AppRoutes from './routes/AppRoutes'
import SessionProvider from './lib/SessionProvider'

function App() {
  return (
    <SessionProvider>
      <AppRoutes />
    </SessionProvider>
  )
}

export default App
