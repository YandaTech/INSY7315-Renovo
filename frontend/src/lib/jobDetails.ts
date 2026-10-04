// Leads store job_details as a JSON string of the factors collected on the
// call (or typed in on Log Call). Turn it into something readable.
export function formatJobDetails(raw: string | null): string {
  if (!raw) return '---'

  let details: Record<string, unknown>
  try {
    details = JSON.parse(raw)
  } catch {
    return raw
  }

  const label = (value: unknown) =>
    String(value).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())

  const parts = [
    details.job_type && label(details.job_type),
    details.scope && `${label(details.scope)} scope`,
    details.square_meters && `${details.square_meters} m²`,
    details.suburb && label(details.suburb),
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(' · ') : '---'
}
