import { describe, expect, it } from 'vitest'
import { type AuditEvent, PAGE_SIZE, auditQuery, describeEvent, eventLabel, rangeError } from './audit'

const base: AuditEvent = {
  id: 1,
  created_at: '2026-11-04T08:00:00+00:00',
  event: 'login_succeeded',
  actor_id: 1,
  actor_username: 'thabo',
  ip_address: '203.0.113.9',
  target_type: null,
  target_id: null,
  details: null,
}

describe('auditQuery', () => {
  it('asks for the first page of everything by default', () => {
    expect(auditQuery({ userId: '', from: '', to: '' })).toEqual({ limit: PAGE_SIZE, offset: 0 })
  })

  it('filters by user', () => {
    expect(auditQuery({ userId: '7', from: '', to: '' }, 50)).toEqual({ limit: PAGE_SIZE, offset: 50, actor_id: 7 })
  })

  it('turns local days into a time range that includes the whole last day', () => {
    const params = auditQuery({ userId: '', from: '2026-11-02', to: '2026-11-03' })
    expect(params.start).toBe(new Date(2026, 10, 2).toISOString())
    expect(params.end).toBe(new Date(2026, 10, 4).toISOString())
  })

  it('allows a one-day range and open-ended ranges', () => {
    const day = auditQuery({ userId: '', from: '2026-11-03', to: '2026-11-03' })
    expect(new Date(day.end as string).getTime() - new Date(day.start as string).getTime()).toBe(24 * 3600 * 1000)
    expect(auditQuery({ userId: '', from: '2026-11-03', to: '' })).not.toHaveProperty('end')
    expect(auditQuery({ userId: '', from: '', to: '2026-11-03' })).not.toHaveProperty('start')
  })

  it('rejects a range that ends before it starts', () => {
    expect(rangeError({ userId: '', from: '2026-11-05', to: '2026-11-01' })).toMatch(/after/)
    expect(rangeError({ userId: '', from: '2026-11-01', to: '2026-11-01' })).toBeNull()
  })
})

describe('describing events', () => {
  it('labels known events and tidies unknown ones', () => {
    expect(eventLabel('login_failed')).toBe('Failed login')
    expect(eventLabel('something_new')).toBe('something new')
  })

  it('summarises each event without personal data', () => {
    expect(describeEvent({ ...base, event: 'login_failed', details: { reason: 'bad_password' } })).toBe('wrong password')
    expect(describeEvent({
      ...base, event: 'user_role_changed', target_id: '2', details: { username: 'lindi', from: 'staff', to: 'admin' },
    })).toBe('lindi: staff to admin')
    expect(describeEvent({ ...base, event: 'user_created', details: { username: 'sipho', role: 'staff' } })).toBe('sipho as staff')
    expect(describeEvent({ ...base, event: 'lead_deleted', target_type: 'lead', target_id: '12' })).toBe('Lead #12')
    expect(describeEvent({ ...base, event: 'profile_updated', details: { fields: ['email', 'first_name'] } })).toBe('email, first name')
    expect(describeEvent({ ...base, event: 'pricing_updated', details: { sections: ['services', 'travel_zones'] } })).toBe('services, travel zones')
    expect(describeEvent(base)).toBe('')
  })
})
