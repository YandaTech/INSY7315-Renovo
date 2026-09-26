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

function PercentInput({ label, sub, defaultValue }: {
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
          className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-center outline-none focus:border-blue-400"
        />
        <span className="text-sm text-gray-500">%</span>
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

          {/* Bath & Sink */}
          <PricingCard title="Bath & Sink Resurfacing & Re-enameling">
            <PriceInput label="Base Quote for Bath (ZAR)"  defaultValue={2600} />
            <PriceInput label="Base Quote for Sink (ZAR)"  defaultValue={1800} />
          </PricingCard>

          {/* Kitchen cupboards */}
          <PricingCard title="Kitchen and Bedroom Cupboard Respraying">
            <PriceInput label="Base Quote for Kitchen Cupboard Respraying (ZAR)" defaultValue={1600} />
            <PriceInput label="Base Quote for Bedroom Cupboard Respraying (ZAR)" defaultValue={1600} />
          </PricingCard>

          {/* Material type */}
          <PricingCard title="Material Type">
            <p className="text-xs text-gray-400 text-center mb-3">
              Percentage added to base rate per material
            </p>
            <PercentInput label="Acrylic Baths & Sinks"  defaultValue={5}  />
            <PercentInput label="Enamel Baths & Sinks"   defaultValue={10} />
            <PercentInput label="Steel Baths & Sinks"    defaultValue={12} />
            <PercentInput label="Cast Iron Baths"        defaultValue={5}  />
            <PercentInput label="Fibreglass Showers"     defaultValue={15} />
            <PercentInput label="Porcelain Sinks"        defaultValue={15} />
            <PercentInput label="Ceramic Tiles"          defaultValue={10} />
            <PercentInput label="Composite Counter-tops" defaultValue={5}  />
          </PricingCard>

          {/* Tile & Shower Tray */}
          <PricingCard title="Tile & Shower Tray Resurfacing">
            <PriceInput label="Base Quote for Tile Resurfacing (ZAR)"        defaultValue={1100} />
            <PriceInput label="Base Quote for Shower Tray Resurfacing (ZAR)" defaultValue={1200} />
          </PricingCard>

          {/* Damage level */}
          <PricingCard title="Damage Level">
            <p className="text-xs text-gray-400 text-center mb-3">
              Percentage added to base rate per condition
            </p>
            <PercentInput label="Minor Chips"  sub="Small chips. Surface scratches" defaultValue={0}  />
            <PercentInput label="General Wear" sub="Dull finish. Staining"          defaultValue={10} />
            <PercentInput label="Heavy Damage" sub="Cracks, peeling, deep chips"    defaultValue={20} />
          </PricingCard>

          {/* Sanitary Polishing */}
          <PricingCard title="Sanitary Polishing & Restoration">
            <PriceInput label="Base Quote for Polishing (ZAR)"   defaultValue={1000} />
            <PriceInput label="Base Quote for Restoration (ZAR)" defaultValue={1200} />
          </PricingCard>

          {/* Counter-Top & Vanity */}
          <PricingCard title="Counter-Top & Vanity Restoration">
            <PriceInput label="Base Quote for Counter-Top Restoration (ZAR)" defaultValue={800}  />
            <PriceInput label="Base Quote for Vanity Restoration (ZAR)"      defaultValue={1000} />
          </PricingCard>

          {/* Suburb-Based Travel Fees */}
          <PricingCard title="Suburb-Based Travel Fees">
            <p className="text-xs text-gray-400 text-center mb-4">
              Fixed amount added per suburb zone based on distance from Parow
            </p>
            {[
              { zone: 'Cape Town CBD & surrounds', subs: 'Claremont, Gardens, Observatory, Woodstock', val: 200 },
              { zone: 'Southern Suburbs',          subs: 'Constantia, Tokai, Muizenberg, Wynberg',    val: 250 },
              { zone: 'Northern Suburbs',          subs: 'Bellville, Durbanville, Parow',              val: 150 },
              { zone: 'Atlantic Seaboard',         subs: 'Sea Point, Green Point, Camps Bay',          val: 280 },
              { zone: 'Hout Bay & surrounds',      subs: 'Hout Bay, Llandudno, Noordhoek',             val: 300 },
              { zone: 'Far outlying areas',        subs: 'Strand, Somerset West, Paarl',               val: 400 },
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
                <p className="text-xs text-gray-400 mt-1">{z.subs}</p>
              </div>
            ))}
          </PricingCard>

        </div>

        {/* Save / Cancel */}
        <div className="flex gap-3 justify-end max-w-4xl mt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>

      </div>
    </DashboardLayout>
  )
}