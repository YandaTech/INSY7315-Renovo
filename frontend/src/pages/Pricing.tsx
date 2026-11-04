import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../lib/api'
import { isAdmin, useSession } from '../lib/auth'
import { Alert, Button, Card, Field, Input, PageHeader, Spinner } from '../components/ui'
import { usePricingRules, type PricingRules } from '../lib/pricingRules'

// ── reusable components ────────────────────────────────────────────────────

function PriceInput({ label, value, onChange }: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <Field label={label}>
      {id => (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">R</span>
          <Input
            id={id}
            type="number"
            min={0}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="pl-7 tabular-nums"
          />
        </div>
      )}
    </Field>
  )
}

function PercentInput({ label, sub, value, onChange }: {
  label: string
  sub?: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-sea-50 last:border-0">
      <div>
        <p className="text-sm text-ink">{label}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={0}
          value={value}
          aria-label={`${label} percentage`}
          onChange={e => onChange(Number(e.target.value))}
          className="w-16 rounded-lg border border-sea-200 px-2 py-1.5 text-sm text-center tabular-nums outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <span className="text-sm text-muted">%</span>
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
  const canEdit = isAdmin(useSession().user)

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
      <PageHeader
        title="Pricing"
        subtitle={canEdit
          ? 'The AI agent quotes every call with these prices.'
          : 'The AI agent quotes every call with these prices. Only an admin can change them.'}
      />

        {loading && <Spinner label="Loading pricing..." />}
        {error && <Alert>{error}</Alert>}

        {rules && (
          <>
            {/* Staff can look but only admins can change prices */}
            <fieldset disabled={!canEdit} className="contents">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

              {/* One card per service category */}
              {Object.entries(categories).map(([category, keys]) => (
                <Card key={category} title={category}>
                  <div className="flex flex-col gap-4">
                  {keys.map(key => (
                    <PriceInput
                      key={key}
                      label={`Base Quote for ${rules.services[key].label} (${rules.currency})`}
                      value={rules.services[key].base_price}
                      onChange={v => update('services', key, 'base_price', v)}
                    />
                  ))}
                  </div>
                </Card>
              ))}

              {/* Material type */}
              <Card title="Material type" subtitle="Percentage added to base rate per material">
                {Object.entries(rules.material_surcharges).map(([key, m]) => (
                  <PercentInput
                    key={key}
                    label={m.label}
                    value={m.percent}
                    onChange={v => update('material_surcharges', key, 'percent', v)}
                  />
                ))}
              </Card>

              {/* Damage level */}
              <Card title="Damage level" subtitle="Percentage added to base rate per condition">
                {Object.entries(rules.damage_surcharges).map(([key, d]) => (
                  <PercentInput
                    key={key}
                    label={d.label}
                    sub={d.description}
                    value={d.percent}
                    onChange={v => update('damage_surcharges', key, 'percent', v)}
                  />
                ))}
              </Card>

              {/* Suburb-Based Travel Fees */}
              <Card title="Suburb-based travel fees" subtitle="Fixed amount per zone, based on distance from Parow">
                <div className="flex flex-col gap-4">
                  {Object.entries(rules.travel_zones).map(([key, z]) => (
                    <div key={key}>
                      <PriceInput
                        label={z.label}
                        value={z.fee}
                        onChange={v => update('travel_zones', key, 'fee', v)}
                      />
                      <p className="text-xs text-muted mt-1">{z.suburbs}</p>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
            </fieldset>

            {/* Save / Cancel - stays in view while scrolling the cards */}
            {canEdit && <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 mt-6 px-4 sm:px-6 lg:px-8 py-4 bg-sand/90 backdrop-blur border-t border-sea-100 flex flex-wrap gap-3 justify-end items-center">
              {message && (
                <p role="status" className={`text-sm mr-auto ${message.ok ? 'text-emerald-700' : 'text-coral-700'}`}>
                  {message.text}
                </p>
              )}
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>}
          </>
        )}

    </DashboardLayout>
  )
}
