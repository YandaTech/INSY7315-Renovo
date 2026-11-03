import { describe, expect, it } from 'vitest'
import { formatJobDetails } from './jobDetails'
import type { PricingRules } from './pricingRules'

const rules: PricingRules = {
  currency: 'ZAR',
  services: { tile_regrout: { label: 'Tile regrout', category: 'tiling', base_price: 800 } },
  material_surcharges: { marble: { label: 'Marble', percent: 20 } },
  damage_surcharges: { severe: { label: 'Severe damage', description: '', percent: 30 } },
  travel_zones: { zone_b: { label: 'Zone B', suburbs: '', fee: 150 } },
}

describe('formatJobDetails', () => {
  it('shows --- when there are no details', () => {
    expect(formatJobDetails(null)).toBe('---')
    expect(formatJobDetails('')).toBe('---')
    expect(formatJobDetails('{}')).toBe('---')
  })

  it('returns text that is not JSON as it is', () => {
    expect(formatJobDetails('Leaking shower')).toBe('Leaking shower')
  })

  it('uses the pricing rule labels when they have loaded', () => {
    const raw = JSON.stringify({
      job_type: 'tile_regrout', quantity: 3, material: 'marble',
      damage_level: 'severe', travel_zone: 'zone_b',
    })
    expect(formatJobDetails(raw, rules)).toBe('Tile regrout · x3 · Marble · Severe damage · Zone B')
  })

  it('humanises the keys without rules, hides a quantity of 1 and prefers the suburb', () => {
    const raw = JSON.stringify({
      job_type: 'tile_regrout', quantity: 1, travel_zone: 'zone_b', suburb: 'Claremont',
    })
    expect(formatJobDetails(raw)).toBe('Tile regrout · Claremont')
  })
})
