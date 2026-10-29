import { useEffect, useState } from 'react'
import api from './api'

// Mirrors mcp-pricing-server/config/pricing_rules.json
export interface PricingRules {
  currency: string
  services: Record<string, { label: string; category: string; base_price: number }>
  material_surcharges: Record<string, { label: string; percent: number }>
  damage_surcharges: Record<string, { label: string; description: string; percent: number }>
  travel_zones: Record<string, { label: string; suburbs: string; fee: number }>
}

export function usePricingRules() {
  const [rules, setRules]     = useState<PricingRules | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get<PricingRules>('/pricing/rules')
      .then(res => setRules(res.data))
      .catch(() => setError('Could not load pricing. Is the pricing server running?'))
      .finally(() => setLoading(false))
  }, [])

  return { rules, setRules, loading, error }
}
