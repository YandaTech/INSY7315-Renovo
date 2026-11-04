// Each page except login is its own chunk (see AppRoutes). Once someone is
// logged in, the dashboard fetches the rest in the background, so moving
// between pages never waits on the network.
export const pageLoaders = {
  signUp: () => import('../pages/SignUpPage'),
  dashboard: () => import('../pages/Dashboard'),
  statistics: () => import('../pages/Statistics'),
  pricing: () => import('../pages/Pricing'),
  profile: () => import('../pages/Profile'),
  staff: () => import('../pages/Staff'),
  auditLog: () => import('../pages/AuditLog'),
  // Not preloaded: it pulls in the Twilio Voice SDK
  demoCall: () => import('../pages/DemoCall'),
}

let preloaded = false

export function preloadPages() {
  if (preloaded) return
  preloaded = true
  const { dashboard, statistics, pricing, profile, staff, auditLog } = pageLoaders
  for (const load of [dashboard, statistics, pricing, profile, staff, auditLog]) {
    load().catch(() => {
      // Offline or a new deploy: the page loads on demand instead
    })
  }
}
