import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

const jobTypes = [
  'Bath & Sink Re-enameling',
  'Fix Cracked Sinks & Baths',
  'Kitchen & Bedroom Cupboard Respraying',
  'Counter-Top & Vanity Restoration',
  'Tile & Shower Tray Resurfacing',
  'Sanitaryware Polishing & Restoration',
]

const statusOptions = [
  { value: 'new',        label: 'New'        },
  { value: 'contacted',  label: 'Contacted'  },
  { value: 'confirmed',  label: 'Confirmed'  },
  { value: 'closed',     label: 'Closed'     },
  { value: 'incomplete', label: 'Incomplete' },
]

export default function LogCall() {
  const navigate = useNavigate()
  const [clientName, setClientName]   = useState('')
  const [jobType, setJobType]         = useState('')
  const [suburb, setSuburb]           = useState('')
  const [quote, setQuote]             = useState('')
  const [status, setStatus]           = useState('new')
  const [phone, setPhone] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleLogCall() {
  if (!clientName || !jobType || !suburb || !phone) {
    setFormError('Please fill in all required fields')
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

    await api.post(`/leads/?${params.toString()}`, {
      job_type: jobType,
      suburb,
    })
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
      className="min-h-screen flex items-center justify-center"
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

          {/* Client Name */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full border-b border-gray-300 py-2 outline-none text-sm text-gray-700 focus:border-blue-500"
            />
          </div>

          {/* Phone */}
<div>
  <label className="text-sm text-gray-600 mb-1 block">
    Phone Number
  </label>
  <input
    type="text"
    value={phone}
    onChange={e => setPhone(e.target.value)}
    className="w-full border-b border-gray-300 py-2 outline-none text-sm text-gray-700 focus:border-blue-500"
  />
</div>

          {/* Job Type */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Job Type
            </label>
            <select
              value={jobType}
              onChange={e => setJobType(e.target.value)}
              className="w-full border-b border-gray-300 py-2 outline-none text-sm text-gray-700 bg-transparent focus:border-blue-500"
            >
              <option value="">Select a job type</option>
              {jobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Suburb */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Suburb
            </label>
            <input
              type="text"
              value={suburb}
              onChange={e => setSuburb(e.target.value)}
              className="w-full border-b border-gray-300 py-2 outline-none text-sm text-gray-700 focus:border-blue-500"
            />
          </div>

          {/* Quote */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Quote
            </label>
            <div className="flex items-center border-b border-gray-300 focus-within:border-blue-500">
              <span className="text-sm text-gray-500 mr-1">R</span>
              <input
                type="number"
                value={quote}
                onChange={e => setQuote(e.target.value)}
                className="flex-1 py-2 outline-none text-sm text-gray-700 bg-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500"
            >
              {statusOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Error message */}
{formError && (
  <p className="text-sm text-red-500 text-center">{formError}</p>
)}

{/* Submit button */}
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