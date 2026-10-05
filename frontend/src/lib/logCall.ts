import { createContext, useContext, useEffect, useRef } from 'react'

// The Log Call modal lives in DashboardLayout; any page can open it, and
// pages showing leads refresh when one is saved.
export const LogCallContext = createContext<{ openLogCall: () => void }>({
  openLogCall: () => {},
})

export function useLogCall() {
  return useContext(LogCallContext)
}

const LEAD_CREATED = 'renovo:lead-created'

export function announceLeadCreated() {
  window.dispatchEvent(new Event(LEAD_CREATED))
}

export function useOnLeadCreated(callback: () => void) {
  const latest = useRef(callback)
  useEffect(() => {
    latest.current = callback
  })

  useEffect(() => {
    const handler = () => latest.current()
    window.addEventListener(LEAD_CREATED, handler)
    return () => window.removeEventListener(LEAD_CREATED, handler)
  }, [])
}
