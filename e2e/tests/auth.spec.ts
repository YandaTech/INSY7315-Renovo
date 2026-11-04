import { createStaff, expect, expectOnDashboard, logIn, LOGGED_OUT, nav, test, unique } from './helpers'

test.describe('logged out', () => {
  test.use({ storageState: LOGGED_OUT })

  test('log in, then log out', async ({ page, adminApi }) => {
    const username = unique('sipho')
    await createStaff(adminApi, username, 'staff-password-1')

    await logIn(page, username, 'staff-password-1')
    await expectOnDashboard(page)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(username)

    await page.getByRole('button', { name: 'Log Out' }).click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()

    // The cookie is gone: the dashboard sends us back to log in
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login$/)
    expect((await page.request.get('/api/auth/me')).status()).toBe(401)
  })

  test('a wrong password shows an error and stays on login', async ({ page, adminApi }) => {
    const username = unique('thandi')
    await createStaff(adminApi, username, 'staff-password-1')

    await logIn(page, username, 'not-the-password')
    await expect(page.getByText('Incorrect username or password')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
    expect((await page.request.get('/api/auth/me')).status()).toBe(401)
  })

  test('protected pages redirect to login', async ({ page }) => {
    await page.goto('/statistics')
    await expect(page).toHaveURL(/\/login$/)
  })
})

test('the session survives a reload', async ({ page }) => {
  await page.goto('/dashboard')
  await expectOnDashboard(page)
  await page.reload()
  await expectOnDashboard(page)
  await page.goto('/statistics')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Statistics' })).toBeVisible()
  await expect(nav(page).getByRole('button', { name: 'Staff' })).toBeVisible()
})
