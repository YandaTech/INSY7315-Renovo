import { createLead, createStaff, expect, logIn, LOGGED_OUT, test, unique } from './helpers'

test('Statistics loads', async ({ page, adminApi }) => {
  await createLead(adminApi, unique('Stats '))

  await page.goto('/statistics')
  await expect(page.getByRole('heading', { name: 'Statistics', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Calls' })).toBeVisible()
  await expect(page.getByText('Loading call data...')).toBeHidden()
  // The chart is drawn, with one tick per day of the last week
  await expect(page.locator('.recharts-surface').first()).toBeVisible()
  await expect(page.locator('.recharts-xAxis .recharts-cartesian-axis-tick')).toHaveCount(7)
  await expect(page.getByRole('heading', { name: 'Top services' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Recent activity' })).toBeVisible()
  await expect(page.getByText('Bath resurfacing & re-enameling').first()).toBeVisible()
  await expect(page.getByText(/Could not load statistics/)).toHaveCount(0)
})

test('the Audit log shows the events', async ({ page, adminApi, browser }) => {
  const username = unique('audit')
  await createStaff(adminApi, username, 'staff-password-1')
  const lead = await createLead(adminApi, unique('Audited '))
  expect((await adminApi.delete(`/api/leads/${lead.id}`)).status()).toBe(204)

  // One failed and one good login by the new person
  const other = await browser.newContext({ storageState: LOGGED_OUT })
  const staff = await other.newPage()
  await logIn(staff, username, 'wrong-password')
  await expect(staff.getByText('Incorrect username or password')).toBeVisible()
  await logIn(staff, username, 'staff-password-1')
  await expect(staff).toHaveURL(/\/dashboard$/)
  await other.close()

  await page.goto('/audit')
  await expect(page.getByRole('heading', { name: 'Audit log', level: 1 })).toBeVisible()
  const events = page.getByRole('table')
  await expect(events.getByRole('row').filter({ hasText: 'Account added' }).filter({ hasText: `${username} as staff` })).toBeVisible()
  await expect(events.getByRole('row').filter({ hasText: 'Lead deleted' }).filter({ hasText: `Lead #${lead.id}` })).toBeVisible()
  await expect(events.getByRole('row').filter({ hasText: 'Failed login' }).filter({ hasText: username })).toContainText('wrong password')
  await expect(events.getByRole('row').filter({ hasText: 'Logged in' }).filter({ hasText: username })).toBeVisible()

  // Filtering by person shows only their events
  await page.getByLabel('User').selectOption({ label: `${username} (@${username})` })
  await expect(page.getByText(/^2 events match$/)).toBeVisible()
  const rows = events.locator('tbody tr')
  await expect(rows).toHaveCount(2)
  for (const row of await rows.all()) await expect(row).toContainText(username)
})
