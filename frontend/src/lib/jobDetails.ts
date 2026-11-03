import type { PricingRules } from './pricingRules'

// The job factors a lead stores as columns (the keys match the pricing server's)
export interface JobFields {
  job_type?: string | null
  quantity?: number | null
  material?: string | null
  damage_level?: string | null
  travel_zone?: string | null
  suburb?: string | null
}

// A lead as far as its job is concerned: the columns, plus job_details, the
// JSON string of the factors as received (older leads may only have this)
export interface LeadJob extends JobFields {
  job_details: string | null
}

const FIELDS: (keyof JobFields)[] = [
  'job_type', 'quantity', 'material', 'damage_level', 'travel_zone', 'suburb',
]

// The lead's job factors: from its columns when it has them, otherwise
// parsed from job_details. Text that isn't JSON comes back as a string.
export function jobFields(lead: LeadJob | string | null): JobFields | string | null {
  const raw = typeof lead === 'string' || lead === null ? lead : lead.job_details
  if (lead && typeof lead === 'object' && FIELDS.some(f => lead[f] != null)) {
    return lead
  }
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : raw
  } catch {
    return raw
  }
}

// Turn a lead's job into something readable, using the pricing rules'
// labels when they've loaded.
export function formatJobDetails(
  lead: LeadJob | string | null,
  rules?: PricingRules | null
): string {
  const details = jobFields(lead)
  if (details === null) return '---'
  if (typeof details === 'string') return details

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
