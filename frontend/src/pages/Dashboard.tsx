import { useState, useEffect } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../lib/api'

// ── types ──────────────────────────────────────────────────────────────────

interface Lead {
  id: number
  name: string
  contact: string
  job_details: string
  quote: number
  status: string
  created_at: string
}

// ── status colours ─────────────────────────────────────────────────────────

const statusColours: Record<string, string> = {
  confirmed:  'bg-green-100 text-green-700',
  new:        'bg-blue-100 text-blue-700',
  closed:     'bg-red-100 text-red-700',
  incomplete: 'bg-orange-100 text-orange-700',
  contacted:  'bg-yellow-100 text-yellow-700',
}

export default function Dashboard() {
  const [leads, setLeads]     = useState<Lead[]>([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  useEffect(() => {
    api.get('/leads/')
      .then(res => {
        setLeads(res.data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load leads. Is the backend running?')
        setLoading(false)
      })
  }, [])

  async function updateStatus(leadId: number, newStatus: string) {
  try {
    await api.patch(`/leads/${leadId}/status?status=${newStatus}`)
    setLeads(prev =>
      prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l)
    )
  } catch (error) {
    console.error('Failed to update status:', error)
  }


}

async function filterByStatus(status: string | null) {
  setActiveFilter(status)
  try {
    const url = status ? `/leads/?status=${status}` : '/leads/'
    const res = await api.get(url)
    setLeads(res.data)
  } catch (error) {
    console.error('Failed to filter leads:', error)
  }
}

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.contact.toLowerCase().includes(search.toLowerCase()) ||
    lead.job_details.toLowerCase().includes(search.toLowerCase())
  )



  return (
    <DashboardLayout>
      <div className="p-6">

        {/* Header card */}
        <div className="bg-white rounded-xl p-5 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hello, Dean</h1>
            <p className="text-sm text-gray-500">Welcome Back</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Dean Thiart</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
              DT
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Total leads</p>
            <p className="text-3xl font-bold text-gray-900">{leads.length}</p>
            <p className="text-xs text-gray-400 mt-1">all time</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Confirmed Jobs</p>
            <p className="text-3xl font-bold text-gray-900">
              {leads.filter(l => l.status === 'confirmed').length}
            </p>
            <p className="text-xs text-gray-400 mt-1">from all leads</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Awaiting follow up</p>
            <p className="text-3xl font-bold text-gray-900">
              {leads.filter(l => l.status === 'new').length}
            </p>
            <p className="text-xs text-gray-400 mt-1">new leads</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Closed Calls</p>
            <p className="text-3xl font-bold text-gray-900">
              {leads.filter(l => l.status === 'closed').length}
            </p>
            <p className="text-xs text-gray-400 mt-1">did not proceed</p>
          </div>
        </div>

        {/* Leads table */}
        <div className="bg-white rounded-xl p-4">
          {/* Filter buttons */}
<div className="flex gap-2 mb-4 flex-wrap">
  {['All', 'new', 'contacted', 'confirmed', 'closed', 'incomplete'].map(s => (
    <button
      key={s}
      onClick={() => filterByStatus(s === 'All' ? null : s)}
      className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
        (s === 'All' && activeFilter === null) || activeFilter === s
          ? 'bg-blue-600 text-white border-blue-600'
          : 'border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300'
      }`}
    >
      {s}
    </button>
  ))}
</div>

{/* Search input */}
<input
  type="text"
  placeholder="Search by name, contact or job type..."
  value={search}
  onChange={e => setSearch(e.target.value)}
  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm mb-4 outline-none focus:border-blue-400"
/>

          {/* Loading state */}
{loading && (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-sm text-gray-400">Loading leads...</p>
  </div>
)}

          {/* Error state */}
          {error && (
            <p className="text-sm text-red-400 text-center py-8">{error}</p>
          )}

          {/* Empty state */}
          {!loading && !error && filteredLeads.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No leads found
            </p>
          )}

          {/* Table */}
          {!loading && !error && filteredLeads.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-100">
                    <th className="text-left pb-3 font-medium">Name</th>
                    <th className="text-left pb-3 font-medium">Contact</th>
                    <th className="text-left pb-3 font-medium">Job Details</th>
                    <th className="text-left pb-3 font-medium">Quote</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-3 font-medium text-gray-900">
                        {lead.name}
                      </td>
                      <td className="py-3 text-gray-600">{lead.contact}</td>
                     <td className="py-3 text-gray-600">
  {typeof lead.job_details === 'string'
    ? lead.job_details
    : JSON.stringify(lead.job_details)}
</td>
                      <td className="py-3 font-medium text-gray-900">
                        {lead.quote > 0
                          ? `R${lead.quote.toLocaleString()}`
                          : '---'}
                      </td>
                      <td className="py-3">
  <select
    value={lead.status}
    onChange={e => updateStatus(lead.id, e.target.value)}
    className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer ${statusColours[lead.status] ?? 'bg-gray-100 text-gray-600'}`}
  >
    <option value="new">New</option>
    <option value="contacted">Contacted</option>
    <option value="confirmed">Confirmed</option>
    <option value="closed">Closed</option>
    <option value="incomplete">Incomplete</option>
  </select>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}