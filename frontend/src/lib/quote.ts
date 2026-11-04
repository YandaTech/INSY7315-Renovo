// A lead with no quote (the call ended early, or pricing failed) has
// quote null. Show it as pending, never as R0.
export function hasQuote(quote: number | null): quote is number {
  return quote != null && quote > 0
}

export function formatQuote(quote: number | null) {
  return hasQuote(quote)
    ? `R${quote.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'Pending'
}

// Pending quotes read as quieter text than real amounts.
export function quoteClass(quote: number | null) {
  return hasQuote(quote) ? 'font-semibold text-ink' : 'text-muted'
}
