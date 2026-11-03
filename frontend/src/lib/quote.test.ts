import { describe, expect, it } from 'vitest'
import { formatQuote, hasQuote, quoteClass } from './quote'

describe('quote helpers', () => {
  it('treats null and 0 as no quote', () => {
    expect(hasQuote(null)).toBe(false)
    expect(hasQuote(0)).toBe(false)
    expect(hasQuote(1)).toBe(true)
  })

  it('shows Pending for null and 0, never R0', () => {
    expect(formatQuote(null)).toBe('Pending')
    expect(formatQuote(0)).toBe('Pending')
  })

  it('formats a real quote in rand with two decimals', () => {
    const formatted = formatQuote(1500)
    expect(formatted).toMatch(/^R/)
    expect(formatted).toMatch(/1.?500,00$/)
  })

  it('styles pending quotes quieter than real amounts', () => {
    expect(quoteClass(null)).toBe('text-muted')
    expect(quoteClass(0)).toBe('text-muted')
    expect(quoteClass(250)).toBe('font-semibold text-ink')
  })
})
