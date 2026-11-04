import { expect, expectOnDashboard, logIn, LOGGED_OUT, nav, test, unique } from './helpers'

test('an admin adds a staff user, who cannot see Staff or Audit or edit Pricing', async ({ page, browser }) => {
  const username = unique('lerato')
  const password = 'temporary-pass-1'

  // Admin adds the person on the Staff page
  await page.goto('/staff')
  await expect(page.getByRole('heading', { name: 'Staff', level: 1 })).toBeVisible()
  const form = page.locator('form').filter({ hasText: 'Temporary password' })
  await form.getByLabel('Username').fill(username)
  await form.getByLabel('Temporary password').fill(password)
  await expect(form.getByLabel('Role')).toHaveValue('staff')
  await form.getByRole('button', { name: 'Add team member' }).click()
  await expect(page.getByText(`Added ${username}.`)).toBeVisible()
  const row = page.getByRole('row').filter({ hasText: `@${username}` })
  await expect(row).toContainText('Active')
  await expect(row.getByLabel(`Role for ${username}`)).toHaveValue('staff')

  // The staff member logs in in their own browser
  const staffContext = await browser.newContext({ storageState: LOGGED_OUT })
  const staff = await staffContext.newPage()
  try {
    await logIn(staff, username, password)
    await expectOnDashboard(staff)

    await expect(nav(staff).getByRole('button', { name: 'Dashboard' })).toBeVisible()
    await expect(nav(staff).getByRole('button', { name: 'Pricing' })).toBeVisible()
    await expect(nav(staff).getByRole('button', { name: 'Staff' })).toHaveCount(0)
    await expect(nav(staff).getByRole('button', { name: 'Audit log' })).toHaveCount(0)

    // Typing the address does not help either
    await staff.goto('/staff')
    await expect(staff).toHaveURL(/\/dashboard$/)
    await staff.goto('/audit')
    await expect(staff).toHaveURL(/\/dashboard$/)
    expect((await staff.request.get('/api/users/')).status()).toBe(403)
    expect((await staff.request.get('/api/audit-events/')).status()).toBe(403)

    // Pricing is read-only
    await staff.goto('/pricing')
    await expect(staff.getByText('Only an admin can change them.')).toBeVisible()
    const firstPrice = staff.getByLabel(/^Base Quote for /).first()
    await expect(firstPrice).toBeVisible()
    await expect(firstPrice).toBeDisabled()
    await expect(staff.getByRole('button', { name: 'Save changes' })).toHaveCount(0)
    const rules = await (await staff.request.get('/api/pricing/rules')).json()
    expect((await staff.request.put('/api/pricing/rules', { data: rules })).status()).toBe(403)
  } finally {
    await staffContext.close()
  }
})

test('admin password reset logs the user out', async ({ page, browser }) => {
  const username = unique('ayanda')

  await page.goto('/staff')
  const form = page.locator('form').filter({ hasText: 'Temporary password' })
  await form.getByLabel('Username').fill(username)
  await form.getByLabel('Temporary password').fill('first-password-1')
  await form.getByRole('button', { name: 'Add team member' }).click()
  const row = page.getByRole('row').filter({ hasText: `@${username}` })
  await expect(row).toBeVisible()

  const staffContext = await browser.newContext({ storageState: LOGGED_OUT })
  const staff = await staffContext.newPage()
  try {
    await logIn(staff, username, 'first-password-1')
    await expectOnDashboard(staff)

    // Admin resets the password
    await row.getByRole('button', { name: 'Reset password' }).click()
    const dialog = page.getByRole('dialog', { name: `Reset password for ${username}` })
    await dialog.getByLabel('New temporary password').fill('second-password-2')
    await dialog.getByLabel('Confirm new password').fill('second-password-2')
    await dialog.getByRole('button', { name: 'Reset password' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByText(`Password reset for ${username}.`)).toBeVisible()

    // The staff member's open session has ended
    await staff.reload()
    await expect(staff).toHaveURL(/\/login$/)

    // The old password no longer works; the new one does
    await logIn(staff, username, 'first-password-1')
    await expect(staff.getByText('Incorrect username or password')).toBeVisible()
    await logIn(staff, username, 'second-password-2')
    await expectOnDashboard(staff)
  } finally {
    await staffContext.close()
  }
})
