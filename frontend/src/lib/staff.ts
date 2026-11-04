import axios from 'axios'
import type { CurrentUser, Role } from './auth'

export type StaffMember = CurrentUser

export const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  staff: 'Staff',
}

export function displayName(user: Pick<StaffMember, 'username' | 'first_name' | 'last_name'>) {
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
}

// Admins cannot demote or deactivate themselves (the backend refuses it
// too), so there is always an admin left who can log in.
export function isSelf(member: StaffMember, me: CurrentUser | null) {
  return me !== null && member.id === me.id
}

// Admins first, then by name; deactivated accounts last.
export function sortStaff(members: StaffMember[]) {
  return [...members].sort((a, b) =>
    Number(b.is_active) - Number(a.is_active)
    || (a.role === b.role ? 0 : a.role === 'admin' ? -1 : 1)
    || displayName(a).localeCompare(displayName(b))
  )
}

export function validateNewMember(username: string, password: string): string | null {
  if (username.trim().length < 3) return 'Username needs at least 3 characters'
  if (password.length < 6) return 'Temporary password needs at least 6 characters'
  return null
}

export function errorDetail(err: unknown, fallback: string) {
  const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null
  return typeof detail === 'string' ? detail : fallback
}
