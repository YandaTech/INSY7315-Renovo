import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../lib/api'
import { usePricingRules, type PricingRules } from '../lib/pricingRules'

// ── reusable components ────────────────────────────────────────────────────

function PricingCard({ title, children }: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl p-5">
      <h3 className="font-bold text-gray-900 text-center mb-4">{title}</h3>
      {children}
    </div>
  )
}

function PriceInput({ label, value, onChange }: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="mb-4">
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
      />
    </div>
  )
}

function PercentInput({ label, sub, value, onChange }: {
  label: string
  sub?: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-center outline-none focus:border-blue-400"
        />
        <span className="text-sm text-gray-500">%</span>
      </div>
    </div>
  )
}

type Section = 'services' | 'material_surcharges' | 'damage_surcharges' | 'travel_zones'

// ── main page ──────────────────────────────────────────────────────────────

export default function Pricing() {
  const navigate = useNavigate()
  const { rules, setRules, loading, error } = usePricingRules()
  const [saving, setSaving]   = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  function update(section: Section, key: string, field: string, value: number) {
    setRules(prev => prev && ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: { ...prev[section][key], [field]: value },
      },
    }))
    setMessage(null)
  }

  async function handleSave() {
    if (!rules) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await api.put<PricingRules>('/pricing/rules', rules)
      setRules(res.data)
      setMessage({ ok: true, text: 'Saved. New calls are quoted with these prices.' })
    } catch (err) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setMessage({ ok: false, text: typeof detail === 'string' ? detail : 'Could not save pricing' })
    } finally {
      setSaving(false)
    }
  }

  // Group services into one card per category, in the order they appear
  const categories = rules
    ? Object.entries(rules.services).reduce<Record<string, string[]>>((acc, [key, service]) => {
        (acc[service.category] ??= []).push(key)
        return acc
      }, {})
    : {}

  return (
    <DashboardLayout>
      <div className="p-6">

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading pricing...</p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 text-center py-8">{error}</p>
        )}

        {rules && (
          <>
            <div className="grid grid-cols-2 gap-4 max-w-4xl">

              {/* One card per service category */}
              {Object.entries(categories).map(([category, keys]) => (
                <PricingCard key={category} title={category}>
                  {keys.map(key => (
                    <PriceInput
                      key={key}
                      label={`Base Quote for ${rules.services[key].label} (${rules.currency})`}
                      value={rules.services[key].base_price}
                      onChange={v => update('services', key, 'base_price', v)}
                    />
                  ))}
                </PricingCard>
              ))}

              {/* Material type */}
              <PricingCard title="Material Type">
                <p className="text-xs text-gray-400 text-center mb-3">
                  Percentage added to base rate per material
                </p>
                {Object.entries(rules.material_surcharges).map(([key, m]) => (
                  <PercentInput
                    key={key}
                    label={m.label}
                    value={m.percent}
                    onChange={v => update('material_surcharges', key, 'percent', v)}
                  />
                ))}
              </PricingCard>

              {/* Damage level */}
              <PricingCard title="Damage Level">
                <p className="text-xs text-gray-400 text-center mb-3">
                  Percentage added to base rate per condition
                </p>
                {Object.entries(rules.damage_surcharges).map(([key, d]) => (
                  <PercentInput
                    key={key}
                    label={d.label}
                    sub={d.description}
                    value={d.percent}
                    onChange={v => update('damage_surcharges', key, 'percent', v)}
                  />
                ))}
              </PricingCard>

              {/* Suburb-Based Travel Fees */}
              <PricingCard title="Suburb-Based Travel Fees">
                <p className="text-xs text-gray-400 text-center mb-4">
                  Fixed amount added per suburb zone based on distance from Parow
                </p>
                {Object.entries(rules.travel_zones).map(([key, z]) => (
                  <div key={key} className="mb-4">
                    <PriceInput
                      label={z.label}
                      value={z.fee}
                      onChange={v => update('travel_zones', key, 'fee', v)}
                    />
                    <p className="text-xs text-gray-400 -mt-3">{z.suburbs}</p>
                  </div>
                ))}
              </PricingCard>

            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3 justify-end items-center max-w-4xl mt-4">
              {message && (
                <p className={`text-sm ${message.ok ? 'text-green-600' : 'text-red-500'}`}>
                  {message.text}
                </p>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}

      </div>
    </DashboardLayout>
  )
}
