import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

const serviceTypes = [
  'kitchen_renovation',
  'bathroom_renovation',
  'painting',
  'flooring',
  'roofing',
  'general_repair',
]

const scopeOptions = [
  'small',
  'medium',
  'large',
]

const urgencyOptions = [
  'standard',
  'urgent',
  'emergency',
]

const materialOptions = [
  'budget',
  'standard',
  'premium',
]

const travelZones = [
  'zone_1',
  'zone_2',
  'zone_3',
  'out_of_area',
]

const statusOptions = [
  'new',
  'contacted',
  'confirmed',
  'closed',
  'incomplete',
]

export default function LogCall() {
  const navigate = useNavigate()

  const [clientName, setClientName] = useState('')
  const [phone, setPhone]           = useState('')
  const [serviceType, setServiceType] = useState('')
  const [scope, setScope]           = useState('small')
  const [urgency, setUrgency]       = useState('standard')
  const [materials, setMaterials]   = useState('standard')
  const [travelZone, setTravelZone] = useState('zone_1')
  const [status, setStatus]         = useState('new')
  const [formError, setFormError]   = useState('')

  async function handleLogCall() {
    if (!clientName || !phone || !serviceType) {
      setFormError('Please fill in all required fields')
      return
    }
    setFormError('')

    try {
      const params = new URLSearchParams({
        name: clientName,
        contact: phone,
        call_sid: `manual-${Date.now()}`,
      })

      await api.post(
        `/leads/?${params.toString()}`,
        {
          job_type: serviceType,
          scope: scope,
          urgency: urgency,
          materials: materials,
          travel_zone: travelZone,
          status: status
        }
      )
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to log call:', error)
      setFormError('Failed to save lead. Please try again.')
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
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg mx-4">

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Log Call
        </h2>

        <div className="flex flex-col gap-4">

          {/* Client Name */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Client Name <span className="text-red-500">*</span>
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
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border-b border-gray-300 py-2 outline-none text-sm text-gray-700 focus:border-blue-500"
            />
          </div>

          {/* Service Type */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Service Type <span className="text-red-500">*</span>
            </label>
            <select
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              className="w-full border-b border-gray-300 py-2 outline-none text-sm text-gray-700 bg-transparent focus:border-blue-500"
            >
              <option value="">Select a service</option>
              {serviceTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Scope */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Scope</label>
            <select
              value={scope}
              onChange={e => setScope(e.target.value)}
              className="w-full border-b border-gray-300 py-2 outline-none text-sm text-gray-700 bg-transparent focus:border-blue-500"
            >
              {scopeOptions.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Urgency</label>
            <select
              value={urgency}
              onChange={e => setUrgency(e.target.value)}
              className="w-full border-b border-gray-300 py-2 outline-none text-sm text-gray-700 bg-transparent focus:border-blue-500"
            >
              {urgencyOptions.map(u => (
                <option key={u} value={u}>
                  {u.charAt(0).toUpperCase() + u.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Materials */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Materials</label>
            <select
              value={materials}
              onChange={e => setMaterials(e.target.value)}
              className="w-full border-b border-gray-300 py-2 outline-none text-sm text-gray-700 bg-transparent focus:border-blue-500"
            >
              {materialOptions.map(m => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Travel Zone */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Travel Zone</label>
            <select
              value={travelZone}
              onChange={e => setTravelZone(e.target.value)}
              className="w-full border-b border-gray-300 py-2 outline-none text-sm text-gray-700 bg-transparent focus:border-blue-500"
            >
              {travelZones.map(z => (
                <option key={z} value={z}>
                  {z.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500"
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
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
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-sm mt-2 hover:bg-blue-700 transition-colors"
          >
            Log Call
          </button>

        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="absolute bottom-4 right-4 text-sm text-white hover:underline"
      >
        Back to Dashboard
      </button>

    </div>
  )
}