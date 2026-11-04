import { createLead, expect, test, unique } from './helpers'

// The leads table on a desktop-width screen
function leadRow(page: import('@playwright/test').Page, name: string) {
  return page.getByRole('row').filter({ has: page.getByRole('button', { name, exact: true }) })
}

test('Log a call creates a lead quoted by the pricing server', async ({ page }) => {
  const name = unique('Naledi ')
  // The quote the real pricing server gives for these job details
  const expected = await page.request.post('/api/pricing/calculate', {
    data: { job_type: 'bath_reenamel', quantity: 2, damage_level: 'general_wear', travel_zone: 'southern_suburbs', suburb: 'Claremont' },
  })
  expect(expected.ok()).toBeTruthy()
  const { estimated_quote: quote } = (await expected.json()) as { estimated_quote: number }
  expect(quote).toBeGreaterThan(0)

  await page.goto('/dashboard')
  await page.getByRole('button', { name: 'Log a call' }).click()
  const dialog = page.getByRole('dialog', { name: 'Log a call' })
  await expect(dialog).toBeVisible()

  await dialog.getByLabel('Client name').fill(name)
  await dialog.getByLabel('Phone number').fill('+27 82 555 0199')
  await dialog.getByLabel('Job type').selectOption({ label: 'Bath resurfacing & re-enameling' })
  await dialog.getByLabel('Quantity').fill('2')
  await dialog.getByLabel('Condition').selectOption({ label: 'General wear' })
  await dialog.getByLabel('Suburb').fill('Claremont')
  await dialog.getByLabel('Travel zone').selectOption({ label: 'Southern Suburbs' })

  await dialog.getByRole('button', { name: 'Calculate' }).click()
  await expect(dialog.getByLabel('Quote')).toHaveValue(String(quote))

  await dialog.getByRole('button', { name: 'Log call' }).click()
  await expect(dialog).toBeHidden()

  // The new lead shows up without a reload
  const row = leadRow(page, name)
  await expect(row).toBeVisible()
  await expect(row).toContainText('+27 82 555 0199')
  await expect(row).toContainText(`R${quote.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`)
  await expect(row.getByLabel(`Status for ${name}`)).toHaveValue('new')
})

test('Log a call without a quote asks the pricing server on save', async ({ page }) => {
  const name = unique('Kagiso ')
  await page.goto('/dashboard')
  await page.getByRole('button', { name: 'Log a call' }).click()
  const dialog = page.getByRole('dialog', { name: 'Log a call' })
  await dialog.getByLabel('Client name').fill(name)
  await dialog.getByLabel('Phone number').fill('0825550123')
  await dialog.getByLabel('Job type').selectOption({ label: 'Tile resurfacing' })
  await dialog.getByLabel('Travel zone').selectOption({ label: 'Cape Town CBD & surrounds' })
  await dialog.getByRole('button', { name: 'Log call' }).click()
  await expect(dialog).toBeHidden()

  const row = leadRow(page, name)
  await expect(row).toBeVisible()
  await expect(row).toContainText(/R\d/)
  await expect(row).not.toContainText('Pending')
})

test('lead status change, search and the status filter', async ({ page, adminApi }) => {
  const tag = unique('zz')
  const first = `Busisiwe ${tag}`
  const second = `Mandla ${tag}`
  await createLead(adminApi, first)
  await createLead(adminApi, second)

  await page.goto('/dashboard')
  await expect(leadRow(page, first)).toBeVisible()

  // Change the status from the table; it is saved on the server
  await leadRow(page, first).getByLabel(`Status for ${first}`).selectOption('confirmed')
  await expect.poll(async () => {
    const leads = (await (await page.request.get('/api/leads/?status=confirmed')).json()) as { name: string }[]
    return leads.some(l => l.name === first)
  }).toBe(true)

  // Search narrows the list to matching names
  const search = page.getByRole('searchbox', { name: 'Search leads' })
  await search.fill(tag)
  await expect(leadRow(page, first)).toBeVisible()
  await expect(leadRow(page, second)).toBeVisible()
  await search.fill(`Mandla ${tag}`)
  await expect(leadRow(page, second)).toBeVisible()
  await expect(leadRow(page, first)).toBeHidden()
  await search.fill(`${tag}-no-such-lead`)
  await expect(page.getByText('No leads found')).toBeVisible()
  await search.fill(tag)

  // The status filter asks the server for that status only
  const filters = page.getByRole('group', { name: 'Filter by status' })
  await filters.getByRole('button', { name: 'confirmed', exact: true }).click()
  await expect(filters.getByRole('button', { name: 'confirmed', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(leadRow(page, first)).toBeVisible()
  await expect(leadRow(page, second)).toBeHidden()

  await filters.getByRole('button', { name: 'new', exact: true }).click()
  await expect(leadRow(page, second)).toBeVisible()
  await expect(leadRow(page, first)).toBeHidden()

  await filters.getByRole('button', { name: 'all', exact: true }).click()
  await expect(leadRow(page, first)).toBeVisible()
  await expect(leadRow(page, second)).toBeVisible()

  // Still confirmed after a reload
  await page.reload()
  await expect(leadRow(page, first).getByLabel(`Status for ${first}`)).toHaveValue('confirmed')
})

test('the lead panel shows the details, and Delete removes the lead', async ({ page, adminApi }) => {
  const name = unique('Zanele ')
  await createLead(adminApi, name, { status: 'contacted', quote: 3150 })

  await page.goto('/dashboard')
  await page.getByRole('button', { name, exact: true }).click()
  const panel = page.getByRole('dialog', { name })
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('link', { name: '+27 82 555 0100' })).toHaveAttribute('href', 'tel:+27825550100')
  await expect(panel).toContainText('Bath resurfacing & re-enameling')
  // Amounts are formatted for South Africa: R3 150,00
  await expect(panel).toContainText(`R${(3150).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`)
  await expect(panel.getByLabel('Status')).toHaveValue('contacted')
  await expect(panel.getByText('Call transcript')).toBeVisible()

  // Escape closes it; reopen and delete
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await page.getByRole('button', { name, exact: true }).click()
  await panel.getByRole('button', { name: 'Delete lead' }).click()
  await expect(panel.getByText('Delete this lead?')).toBeVisible()
  await panel.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect(panel).toBeHidden()
  await expect(page.getByRole('button', { name, exact: true })).toHaveCount(0)
  const leads = (await (await page.request.get('/api/leads/')).json()) as { name: string }[]
  expect(leads.some(l => l.name === name)).toBe(false)

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible()
  await expect(page.getByRole('button', { name, exact: true })).toHaveCount(0)
})
