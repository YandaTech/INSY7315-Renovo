import { test, expect } from '@playwright/test'
import { ADMIN, ADMIN_STATE, expectOnDashboard, logIn, nav } from './helpers'

// Runs once, first, on an empty database. Every other test uses the
// session it saves.
test('first sign-up becomes admin and closes sign-up', async ({ page, playwright, baseURL }) => {
  await page.goto('/signup')
  await expect(page.getByRole('heading', { name: 'Create the first account' })).toBeVisible()

  await page.getByPlaceholder('Username').fill(ADMIN.username)
  await page.getByPlaceholder('Password').fill(ADMIN.password)
  await page.getByRole('button', { name: 'Sign up' }).click()
  await expect(page).toHaveURL(/\/login$/)

  await logIn(page, ADMIN.username, ADMIN.password)
  await expectOnDashboard(page)

  // The admin-only pages are in the menu, and the API agrees on the role
  await expect(nav(page).getByRole('button', { name: 'Staff' })).toBeVisible()
  await expect(nav(page).getByRole('button', { name: 'Audit log' })).toBeVisible()
  const me = await (await page.request.get('/api/auth/me')).json()
  expect(me).toMatchObject({ username: ADMIN.username, role: 'admin', is_active: true })

  await page.context().storageState({ path: ADMIN_STATE })

  // Sign-up is closed now that an account exists
  await page.goto('/signup')
  await expect(page.getByRole('heading', { name: 'Sign up is closed' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign up' })).toHaveCount(0)
  // A visitor without a session cannot sign up through the API either
  const visitor = await playwright.request.newContext({ baseURL })
  const register = await visitor.post('/api/auth/register', {
    data: { username: 'second-owner', password: 'another-password' },
  })
  expect(register.status()).toBe(403)
  await visitor.dispose()
})
