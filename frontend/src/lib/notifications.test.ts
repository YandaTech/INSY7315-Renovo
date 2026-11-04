import { describe, expect, it, vi } from 'vitest'
import {
  NOTIFICATION_PAGE_SIZE,
  countNotifications,
  fetchAllNotifications,
  type NotificationRecord,
} from './notifications'

describe('countNotifications', () => {
  it('counts sent and failed SMS and email separately', () => {
    const log: NotificationRecord[] = [
      { type: 'sms', status: 'sent' },
      { type: 'sms', status: 'sent' },
      { type: 'sms', status: 'failed' },
      { type: 'email', status: 'sent' },
      { type: 'email', status: 'failed' },
      { type: 'email', status: 'failed' },
    ]
    expect(countNotifications(log)).toEqual({
      sms: { sent: 2, failed: 1 },
      email: { sent: 1, failed: 2 },
    })
  })

  it('is all zeros for an empty log', () => {
    expect(countNotifications([])).toEqual({
      sms: { sent: 0, failed: 0 },
      email: { sent: 0, failed: 0 },
    })
  })

  it('ignores unknown types and statuses', () => {
    const log: NotificationRecord[] = [
      { type: 'push', status: 'sent' },
      { type: 'sms', status: 'queued' },
      { type: 'email', status: 'sent' },
    ]
    expect(countNotifications(log)).toEqual({
      sms: { sent: 0, failed: 0 },
      email: { sent: 1, failed: 0 },
    })
  })
})

describe('fetchAllNotifications', () => {
  it('reads every page until a short page', async () => {
    const full = Array.from({ length: NOTIFICATION_PAGE_SIZE }, () => ({ type: 'sms', status: 'sent' }))
    const getPage = vi
      .fn<(skip: number, limit: number) => Promise<NotificationRecord[]>>()
      .mockResolvedValueOnce(full)
      .mockResolvedValueOnce([{ type: 'email', status: 'failed' }])

    const all = await fetchAllNotifications(getPage)

    expect(all).toHaveLength(NOTIFICATION_PAGE_SIZE + 1)
    expect(getPage).toHaveBeenNthCalledWith(1, 0, NOTIFICATION_PAGE_SIZE)
    expect(getPage).toHaveBeenNthCalledWith(2, NOTIFICATION_PAGE_SIZE, NOTIFICATION_PAGE_SIZE)
    expect(countNotifications(all)).toEqual({
      sms: { sent: NOTIFICATION_PAGE_SIZE, failed: 0 },
      email: { sent: 0, failed: 1 },
    })
  })
})
