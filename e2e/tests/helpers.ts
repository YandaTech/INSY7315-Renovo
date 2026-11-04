import path from 'node:path'
import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test'

// The first account, created by first-signup.setup.ts
export const ADMIN = { username: 'owner', password: 'owner-e2e-password' }

// Also in playwright.config.ts
export const ADMIN_STATE = path.join(import.meta.dirname, '..', '.auth', 'admin.json')

// No cookies: a visitor who is not logged in
export const LOGGED_OUT = { cookies: [], origins: [] }

// Names unique to one test run, so parallel tests never see each other's data
export function unique(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export interface Lead {
  id: number
  name: string
  status: string
  quote: number | null
}

// adminApi: the API as the admin, for setting up data quickly, whatever
// session the page itself has
export const test = base.extend<{ adminApi: APIRequestContext }>({
  adminApi: async ({ playwright, baseURL }, use) => {
    const ctx = await playwright.request.newContext({ baseURL, storageState: ADMIN_STATE })
    await use(ctx)
    await ctx.dispose()
  },
})

export { expect }

export async function createStaff(api: APIRequestContext, username: string, password: string) {
  const res = await api.post('/api/users/', { data: { username, password, role: 'staff' } })
  expect(res.status(), await res.text()).toBe(201)
  return (await res.json()) as { id: number; username: string }
}

export async function createLead(
  api: APIRequestContext,
  name: string,
  { status = 'new', quote = 2900 }: { status?: string; quote?: number | null } = {},
) {
  const res = await api.post('/api/leads/', {
    data: {
      name,
      contact: '+27 82 555 0100',
      call_sid: `e2e-${name}`,
      status,
      quote,
      job_details: { job_type: 'bath_reenamel', quantity: 1, damage_level: 'minor', travel_zone: 'cbd' },
    },
  })
  expect(res.ok(), await res.text()).toBeTruthy()
  const leads = (await (await api.get('/api/leads/')).json()) as Lead[]
  const lead = leads.find(l => l.name === name)
  expect(lead, `lead ${name} was saved`).toBeDefined()
  return lead!
}

export async function logIn(page: Page, username: string, password: string) {
  await page.goto('/login')
  await page.getByPlaceholder('Username').fill(username)
  await page.getByPlaceholder('Password').fill(password)
  await page.getByRole('button', { name: 'Log in' }).click()
}

export async function expectOnDashboard(page: Page) {
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { level: 1, name: /^Good (morning|afternoon|evening)/ })).toBeVisible()
}

// The main navigation in the desktop sidebar
export function nav(page: Page) {
  return page.getByRole('navigation', { name: 'Main' })
}
