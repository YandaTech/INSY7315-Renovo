// Quote confirmations the voice-bridge logged in /notifications/.
export interface NotificationRecord {
  type: string
  status: string
}

export interface DeliveryCounts {
  sent: number
  failed: number
}

export interface NotificationCounts {
  sms: DeliveryCounts
  email: DeliveryCounts
}

// Sent and failed SMS and email, counted the same way as the log.
// Other types or statuses are left out rather than guessed at.
export function countNotifications(notifications: NotificationRecord[]): NotificationCounts {
  const counts: NotificationCounts = {
    sms: { sent: 0, failed: 0 },
    email: { sent: 0, failed: 0 },
  }
  for (const { type, status } of notifications) {
    if ((type === 'sms' || type === 'email') && (status === 'sent' || status === 'failed')) {
      counts[type][status] += 1
    }
  }
  return counts
}

export const NOTIFICATION_PAGE_SIZE = 500
// Stops a misbehaving backend from looping forever (500 x 200 = 100k rows).
const MAX_PAGES = 200

// The list endpoint pages with skip/limit, so read every page to count the
// whole log, not just the latest 100.
export async function fetchAllNotifications(
  getPage: (skip: number, limit: number) => Promise<NotificationRecord[]>,
): Promise<NotificationRecord[]> {
  const all: NotificationRecord[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const rows = await getPage(page * NOTIFICATION_PAGE_SIZE, NOTIFICATION_PAGE_SIZE)
    all.push(...rows)
    if (rows.length < NOTIFICATION_PAGE_SIZE) break
  }
  return all
}
