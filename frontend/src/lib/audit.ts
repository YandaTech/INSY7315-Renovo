// The append-only audit log (GET /audit-events, admin only).

export interface AuditEvent {
  id: number
  created_at: string
  event: string
  actor_id: number | null
  actor_username: string | null
  ip_address: string | null
  target_type: string | null
  target_id: string | null
  details: Record<string, unknown> | null
}

export interface AuditPage {
  total: number
  items: AuditEvent[]
}

export interface AuditFilters {
  userId: string // '' for everyone
  from: string   // 'YYYY-MM-DD' from a date input, '' for no limit
  to: string     // inclusive
}

export const PAGE_SIZE = 50

export const eventLabels: Record<string, string> = {
  login_succeeded: 'Logged in',
  login_failed: 'Failed login',
  logout: 'Logged out',
  user_created: 'Account added',
  user_role_changed: 'Role changed',
  user_deactivated: 'Account deactivated',
  user_reactivated: 'Account reactivated',
  profile_updated: 'Profile edited',
  password_changed: 'Password changed',
  password_change_failed: 'Password change failed',
  lead_deleted: 'Lead deleted',
  pricing_updated: 'Prices changed',
}

export function eventLabel(event: string) {
  return eventLabels[event] ?? event.replace(/_/g, ' ')
}

// Local midnight at the start of a 'YYYY-MM-DD' day, as a Date
function startOfDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function rangeError({ from, to }: AuditFilters): string | null {
  if (from && to && startOfDay(from) > startOfDay(to)) return 'The start date is after the end date'
  return null
}

// Query parameters for /audit-events. Dates are the admin's local days:
// "to" includes the whole of that day, so the range ends at the next
// local midnight. The API takes ISO times with an offset.
export function auditQuery(filters: AuditFilters, offset = 0): Record<string, string | number> {
  const params: Record<string, string | number> = { limit: PAGE_SIZE, offset }
  if (filters.userId) params.actor_id = Number(filters.userId)
  if (filters.from) params.start = startOfDay(filters.from).toISOString()
  if (filters.to) {
    const end = startOfDay(filters.to)
    end.setDate(end.getDate() + 1)
    params.end = end.toISOString()
  }
  return params
}

const failedLoginReasons: Record<string, string> = {
  bad_password: 'wrong password',
  unknown_user: 'unknown username',
  inactive: 'account deactivated',
}

// One line saying what the event was about. Events never contain
// passwords, phone numbers or transcripts, so this only shows ids,
// usernames and roles.
export function describeEvent(e: AuditEvent): string {
  const d = e.details ?? {}
  const who = typeof d.username === 'string' ? d.username : null
  switch (e.event) {
    case 'login_failed':
      return failedLoginReasons[String(d.reason)] ?? ''
    case 'user_created':
      return `${who ?? `user #${e.target_id}`} as ${d.role}`
    case 'user_role_changed':
      return `${who ?? `user #${e.target_id}`}: ${d.from} to ${d.to}`
    case 'user_deactivated':
    case 'user_reactivated':
      return who ?? `user #${e.target_id}`
    case 'profile_updated':
      return Array.isArray(d.fields) ? d.fields.join(', ').replace(/_/g, ' ') : ''
    case 'lead_deleted':
      return `Lead #${e.target_id}`
    case 'pricing_updated':
      return Array.isArray(d.sections) ? d.sections.join(', ').replace(/_/g, ' ') : ''
    default:
      return e.target_type ? `${e.target_type} #${e.target_id}` : ''
  }
}

export function formatEventTime(iso: string) {
  return new Date(iso).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
