import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const jobTypes = [
  'Bath & Sink Re-enameling',
  'Fix Cracked Sinks & Baths',
  'Kitchen & Bedroom Cupboard Respraying',
  'Counter-Top & Vanity Restoration',
  'Tile & Shower Tray Resurfacing',
  'Sanitaryware Polishing & Restoration',
]

const statusOptions = [
  'New',
  'Contacted',
  'Confirmed',
  'Closed',
  'Incomplete',
]

export default function LogCall() {
  const navigate = useNavigate()
  const [clientName, setClientName]   = useState('')
  const [jobType, setJobType]         = useState('')
  const [suburb, setSuburb]           = useState('')
  const [quote, setQuote]             = useState('')
  const [status, setStatus]           = useState('New')

  function handleLogCall() {
    // for now just navigate back to dashboard
    // real logic will POST to Demira's /leads/ endpoint later
    if (clientName && jobType && suburb) {
      navigate('/dashboard')
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
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Submit button */}
          <button
            onClick={handleLogCall}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-sm mt-2 hover:bg-blue-700 transition-colors"
          >
            Log Call
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