import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'

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

function PriceInput({ label, defaultValue }: {
  label: string
  defaultValue: number
}) {
  return (
    <div className="mb-4">
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      <input
        type="number"
        defaultValue={defaultValue}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
      />
    </div>
  )
}

function MultiplierInput({ label, sub, defaultValue }: {
  label: string
  sub?: string
  defaultValue: number
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
          defaultValue={defaultValue}
          step="0.01"
          className="w-20 border border-gray-200 rounded px-2 py-1 text-sm text-center outline-none focus:border-blue-400"
        />
        <span className="text-xs text-gray-400">×</span>
      </div>
    </div>
  )
}

// ── main page ──────────────────────────────────────────────────────────────

export default function Pricing() {
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 max-w-4xl">

          {/* Base Rates */}
          <PricingCard title="Base Rates (ZAR)">
            <p className="text-xs text-gray-400 text-center mb-3">
              Starting price per service type
            </p>
            <PriceInput label="Kitchen Renovation"  defaultValue={850} />
            <PriceInput label="Bathroom Renovation" defaultValue={650} />
            <PriceInput label="Painting"            defaultValue={120} />
            <PriceInput label="Flooring"            defaultValue={280} />
            <PriceInput label="Roofing"             defaultValue={400} />
            <PriceInput label="General Repair"      defaultValue={350} />
          </PricingCard>

          {/* Scope Multipliers */}
          <PricingCard title="Scope Multipliers">
            <p className="text-xs text-gray-400 text-center mb-3">
              Applied to base rate based on job size
            </p>
            <MultiplierInput
              label="Small"
              sub="Minor work, single room"
              defaultValue={1.0}
            />
            <MultiplierInput
              label="Medium"
              sub="Moderate work, multiple areas"
              defaultValue={1.6}
            />
            <MultiplierInput
              label="Large"
              sub="Extensive work, whole property"
              defaultValue={2.4}
            />
          </PricingCard>

          {/* Urgency Multipliers */}
          <PricingCard title="Urgency Multipliers">
            <p className="text-xs text-gray-400 text-center mb-3">
              Applied based on how quickly work is needed
            </p>
            <MultiplierInput
              label="Standard"
              sub="Normal scheduling, 1–2 weeks"
              defaultValue={1.0}
            />
            <MultiplierInput
              label="Urgent"
              sub="Within 3–5 days"
              defaultValue={1.25}
            />
            <MultiplierInput
              label="Emergency"
              sub="Within 24–48 hours"
              defaultValue={1.6}
            />
          </PricingCard>

          {/* Materials Multipliers */}
          <PricingCard title="Materials Multipliers">
            <p className="text-xs text-gray-400 text-center mb-3">
              Applied based on quality of materials used
            </p>
            <MultiplierInput
              label="Budget"
              sub="Basic materials, cost effective"
              defaultValue={0.85}
            />
            <MultiplierInput
              label="Standard"
              sub="Mid-range materials"
              defaultValue={1.0}
            />
            <MultiplierInput
              label="Premium"
              sub="High quality, long lasting"
              defaultValue={1.5}
            />
          </PricingCard>

          {/* Travel Zones */}
          <PricingCard title="Travel Zones (ZAR)">
            <p className="text-xs text-gray-400 text-center mb-4">
              Fixed surcharge added based on distance from Parow
            </p>
            {[
              { zone: 'Zone 1', sub: 'Parow and immediate surrounds', val: 0     },
              { zone: 'Zone 2', sub: 'Cape Town CBD and nearby areas', val: 250  },
              { zone: 'Zone 3', sub: 'Southern Suburbs and Seaboard',  val: 550  },
              { zone: 'Out of Area', sub: 'Strand, Paarl, Somerset West', val: 950 },
            ].map(z => (
              <div key={z.zone} className="mb-4">
                <label className="text-sm text-gray-700 block mb-1">
                  {z.zone}
                </label>
                <input
                  type="number"
                  defaultValue={z.val}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
                <p className="text-xs text-gray-400 mt-1">{z.sub}</p>
              </div>
            ))}
          </PricingCard>

          {/* Minimum Quote */}
          <PricingCard title="Minimum Quote">
            <p className="text-xs text-gray-400 text-center mb-4">
              No quote will be generated below this amount
            </p>
            <PriceInput label="Minimum quote amount (ZAR)" defaultValue={500} />
            <p className="text-xs text-gray-400 mt-2">
              If the calculated quote is below this amount the system
              will automatically use this minimum instead.
            </p>
          </PricingCard>

        </div>

        {/* Example quote calculator */}
        <div className="max-w-4xl mt-4 bg-white rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-2">
            How quotes are calculated
          </h3>
          <p className="text-sm text-gray-500">
            Quote = (Base Rate × Scope Multiplier × Urgency Multiplier
            × Materials Multiplier) + Travel Zone Surcharge
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Example: Bathroom Renovation (R650) × Medium (1.6) × Standard
            (1.0) × Premium (1.5) + Zone 2 (R250) = <strong>R1,810</strong>
          </p>
        </div>

        {/* Save / Cancel */}
        <div className="flex gap-3 justify-end max-w-4xl mt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>

      </div>
    </DashboardLayout>
  )
}