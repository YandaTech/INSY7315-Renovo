import { describe, expect, it } from 'vitest'
import { admin, staff } from '../test/session'
import { displayName, isSelf, sortStaff, validateNewMember } from './staff'

describe('staff helpers', () => {
  it('names people by full name, falling back to username', () => {
    expect(displayName({ username: 'thabo', first_name: 'Thabo', last_name: 'Nkosi' })).toBe('Thabo Nkosi')
    expect(displayName({ username: 'thabo', first_name: null, last_name: null })).toBe('thabo')
  })

  it('knows which row is the logged-in admin', () => {
    expect(isSelf(admin, admin)).toBe(true)
    expect(isSelf(staff, admin)).toBe(false)
    expect(isSelf(staff, null)).toBe(false)
  })

  it('lists active admins first and deactivated people last', () => {
    const gone = { ...staff, id: 3, username: 'aaron', first_name: 'Aaron', is_active: false }
    const zed = { ...staff, id: 4, username: 'zed', first_name: 'Zed' }
    expect(sortStaff([gone, zed, staff, admin]).map(m => m.username)).toEqual(['thabo', 'lindi', 'zed', 'aaron'])
  })

  it('checks a new account before sending it', () => {
    expect(validateNewMember('ab', 'secret1')).toMatch(/Username/)
    expect(validateNewMember('sipho', '123')).toMatch(/password/)
    expect(validateNewMember('sipho', 'secret1')).toBeNull()
  })
})
