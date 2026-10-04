import type { PricingRules } from './pricingRules'

// Leads store job_details as a JSON string of the factors collected on the
// call (or entered on Log Call). Turn it into something readable, using the
// pricing rules' labels when they've loaded.
export function formatJobDetails(raw: string | null, rules?: PricingRules | null): string {
  if (!raw) return '---'

  let details: Record<string, unknown>
  try {
    details = JSON.parse(raw)
  } catch {
    return raw
  }

  const humanise = (value: unknown) =>
    String(value).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())

  const label = (
    section: Record<string, { label: string }> | undefined,
    key: unknown
  ) => (key ? section?.[String(key)]?.label ?? humanise(key) : null)

  const quantity = Number(details.quantity)
  const parts = [
    label(rules?.services, details.job_type),
    quantity > 1 ? `x${quantity}` : null,
    label(rules?.material_surcharges, details.material),
    label(rules?.damage_surcharges, details.damage_level),
    details.suburb ? String(details.suburb) : label(rules?.travel_zones, details.travel_zone),
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' · ') : '---'
}
