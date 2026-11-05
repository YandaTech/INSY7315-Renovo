import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../lib/api'
import { Calculator, X } from 'lucide-react'
import { usePricingRules } from '../lib/pricingRules'
import { Alert, Button, Field, Input, Select, Toaster } from '../components/ui'
import { useToast } from '../lib/useToast'
import { useFocusTrap } from '../lib/useFocusTrap'

const statusOptions = [
  { value: 'new',        label: 'New'        },
  { value: 'contacted',  label: 'Contacted'  },
  { value: 'confirmed',  label: 'Confirmed'  },
  { value: 'closed',     label: 'Closed'     },
  { value: 'incomplete', label: 'Incomplete' },
]

export default function LogCallModal({ onClose, onSaved }: {
  onClose: () => void
  onSaved: () => void
}) {
  const { rules } = usePricingRules()
  // Server failures show as a toast; missing fields stay inline by the form
  const { toasts, toast, dismiss } = useToast()

  // Keeps Tab inside the modal and returns focus to the opener on close
  const dialogRef = useFocusTrap<HTMLFormElement>()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

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
      setQuote(String(res.data.estimated_quote))
    } catch (error) {
      // 422: these job details can't be priced. 502: pricing server is down,
      // so leave the quote empty rather than fill in R0.
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const detail = error.response.data?.detail
        setFormError(typeof detail === 'string' ? detail : 'Could not calculate an estimate')
      } else {
        toast('Could not reach the pricing server. Save without a quote, or try again.')
      }
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
      // Sent in the body so the client's name and number never appear in a URL.
      // Without a quote the backend asks the pricing server for one.
      await api.post('/leads/', {
        name: clientName,
        contact: phone,
        call_sid: `manual-${Date.now()}`,
        status,
        job_details: jobDetails(),
        quote: quote ? Number(quote) : null,
      })
      onSaved()
    } catch (error) {
      console.error('Failed to log call:', error)
      toast('Could not save the call. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4">
      <div className="fixed inset-0 bg-sea-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <form
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-call-title"
        onSubmit={e => { e.preventDefault(); handleLogCall() }}
        className="relative bg-white rounded-lg p-6 sm:p-8 w-full max-w-lg shadow-2xl my-8"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 id="log-call-title" className="text-xl font-bold tracking-tight text-ink">Log a call</h2>
            <p className="text-sm text-muted mt-1">
              For calls taken in person or outside the AI line.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-muted hover:bg-sea-50 hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Client name">
              {id => (
                <Input id={id} data-autofocus value={clientName} onChange={e => setClientName(e.target.value)} />
              )}
            </Field>
            <Field label="Phone number">
              {id => (
                <Input id={id} type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
              )}
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Field label="Job type">
                {id => (
                  <Select id={id} value={jobType} onChange={e => setJobType(e.target.value)}>
                    <option value="">Select a job type</option>
                    {rules && Object.entries(rules.services).map(([key, s]) => (
                      <option key={key} value={key}>{s.label}</option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <Field label="Quantity">
              {id => (
                <Input id={id} type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} />
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {usesMaterial && (
              <Field label="Material">
                {id => (
                  <Select id={id} value={material} onChange={e => setMaterial(e.target.value)}>
                    <option value="">Not sure</option>
                    {rules && Object.entries(rules.material_surcharges).map(([key, m]) => (
                      <option key={key} value={key}>{m.label}</option>
                    ))}
                  </Select>
                )}
              </Field>
            )}
            <Field label="Condition">
              {id => (
                <Select id={id} value={damage} onChange={e => setDamage(e.target.value)}>
                  {rules && Object.entries(rules.damage_surcharges).map(([key, d]) => (
                    <option key={key} value={key}>{d.label}</option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Suburb">
              {id => (
                <Input id={id} value={suburb} onChange={e => setSuburb(e.target.value)} />
              )}
            </Field>
            <Field label="Travel zone">
              {id => (
                <Select id={id} value={travelZone} onChange={e => setTravelZone(e.target.value)}>
                  <option value="">Select a zone</option>
                  {rules && Object.entries(rules.travel_zones).map(([key, z]) => (
                    <option key={key} value={key}>{z.label}</option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <Field label="Quote" hint="Leave blank to calculate it from current pricing.">
            {id => (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">R</span>
                  <Input
                    id={id}
                    type="number"
                    value={quote}
                    onChange={e => setQuote(e.target.value)}
                    className="pl-7 tabular-nums"
                  />
                </div>
                <Button variant="secondary" onClick={handleCalculate} disabled={calculating}>
                  <Calculator size={16} />
                  {calculating ? 'Calculating...' : 'Calculate'}
                </Button>
              </div>
            )}
          </Field>

          <Field label="Status">
            {id => (
              <Select id={id} value={status} onChange={e => setStatus(e.target.value)}>
                {statusOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            )}
          </Field>

          {formError && <Alert>{formError}</Alert>}

          <div className="flex gap-3 justify-end mt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Log call'}
            </Button>
          </div>

        </div>
      </form>

      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
