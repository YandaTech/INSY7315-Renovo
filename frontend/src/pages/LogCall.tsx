import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { usePricingRules } from '../lib/pricingRules'

const statusOptions = [
  { value: 'new',        label: 'New'        },
  { value: 'contacted',  label: 'Contacted'  },
  { value: 'confirmed',  label: 'Confirmed'  },
  { value: 'closed',     label: 'Closed'     },
  { value: 'incomplete', label: 'Incomplete' },
]

const inputClass =
  'w-full border-b border-gray-300 py-2 outline-none text-sm text-gray-700 bg-transparent focus:border-blue-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

export default function LogCall() {
  const navigate = useNavigate()
  const { rules } = usePricingRules()

  const [clientName, setClientName] = useState('')
  const [phone, setPhone]           = useState('')
  const [jobType, setJobType]       = useState('')
  const [quantity, setQuantity]     = useState('1')
  const [material, setMaterial]     = useState('')
  const [damage, setDamage]         = useState('minor')
  const [travelZone, setTravelZone] = useState('')
  const [suburb, setSuburb]         = useState('')
  const [quote, setQuote]           = useState('')
  const [status, setStatus]         = useState('new')
  const [formError, setFormError]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [calculating, setCalculating] = useState(false)

  // Cupboard respraying isn't priced by material
  const usesMaterial = !jobType.includes('cupboard')

  function jobDetails() {
    return {
      job_type: jobType,
      quantity: Number(quantity) || 1,
      ...(usesMaterial && material ? { material } : {}),
      damage_level: damage,
      travel_zone: travelZone,
      ...(suburb ? { suburb } : {}),
    }
  }

  async function handleCalculate() {
    if (!jobType || !travelZone) {
      setFormError('Choose a job type and travel zone to calculate an estimate')
      return
    }
    setFormError('')
    setCalculating(true)
    try {
      const res = await api.post('/pricing/calculate', jobDetails())
      if (res.data.status === 'ok') {
        setQuote(String(res.data.estimated_quote))
      } else {
        setFormError(res.data.detail ?? 'Could not calculate an estimate')
      }
    } catch {
      setFormError('Could not reach the pricing server')
    } finally {
      setCalculating(false)
    }
  }

  async function handleLogCall() {
    if (!clientName || !phone || !jobType || !travelZone) {
      setFormError('Please fill in name, phone, job type and travel zone')
      return
    }
    setFormError('')
    setSubmitting(true)

    try {
      const params = new URLSearchParams({
        name: clientName,
        contact: phone,
        call_sid: `manual-${Date.now()}`,
        status,
      })
      // Without a quote the backend asks the pricing server for one
      if (quote) {
        params.set('quote', quote)
      }

      await api.post(`/leads/?${params.toString()}`, jobDetails())
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to log call:', error)
      setFormError('Could not save the call. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-8"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Card */}
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg mx-4">

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Log Call
        </h2>

        <div className="flex flex-col gap-4">

          <Field label="Client Name">
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Phone Number">
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Field label="Job Type">
                <select
                  value={jobType}
                  onChange={e => setJobType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a job type</option>
                  {rules && Object.entries(rules.services).map(([key, s]) => (
                    <option key={key} value={key}>{s.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Quantity">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {usesMaterial && (
              <Field label="Material">
                <select
                  value={material}
                  onChange={e => setMaterial(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Not sure</option>
                  {rules && Object.entries(rules.material_surcharges).map(([key, m]) => (
                    <option key={key} value={key}>{m.label}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Condition">
              <select
                value={damage}
                onChange={e => setDamage(e.target.value)}
                className={inputClass}
              >
                {rules && Object.entries(rules.damage_surcharges).map(([key, d]) => (
                  <option key={key} value={key}>{d.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Suburb">
              <input
                type="text"
                value={suburb}
                onChange={e => setSuburb(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Travel Zone">
              <select
                value={travelZone}
                onChange={e => setTravelZone(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a zone</option>
                {rules && Object.entries(rules.travel_zones).map(([key, z]) => (
                  <option key={key} value={key}>{z.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Quote">
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center border-b border-gray-300 focus-within:border-blue-500">
                <span className="text-sm text-gray-500 mr-1">R</span>
                <input
                  type="number"
                  value={quote}
                  placeholder="Calculated if left blank"
                  onChange={e => setQuote(e.target.value)}
                  className="flex-1 py-2 outline-none text-sm text-gray-700 bg-transparent"
                />
              </div>
              <button
                type="button"
                onClick={handleCalculate}
                disabled={calculating}
                className="text-xs px-3 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-60"
              >
                {calculating ? 'Calculating...' : 'Calculate'}
              </button>
            </div>
          </Field>

          <Field label="Status">
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500"
            >
              {statusOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>

          {formError && (
            <p className="text-sm text-red-500 text-center">{formError}</p>
          )}

          <button
            onClick={handleLogCall}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-sm mt-2 hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Log Call'}
          </button>

        </div>
      </div>

      {/* Back link */}
      <button
        onClick={() => navigate('/dashboard')}
        className="absolute bottom-4 right-4 text-sm text-white hover:underline"
      >
        Back to Dashboard
      </button>

    </div>
  )
}
