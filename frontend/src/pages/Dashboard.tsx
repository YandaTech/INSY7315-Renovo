import { useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout'
import { mockLeads, mockMetrics } from '../lib/mockData'

const statusColours: Record<string, string> = {
  Confirmed:  'bg-green-100 text-green-700',
  New:        'bg-blue-100 text-blue-700',
  Closed:     'bg-red-100 text-red-700',
  Incomplete: 'bg-orange-100 text-orange-700',
  Contacted:  'bg-yellow-100 text-yellow-700',
}

export default function Dashboard() {
  const [search, setSearch] = useState('')

  const filteredLeads = mockLeads.filter(lead =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.suburb.toLowerCase().includes(search.toLowerCase()) ||
    lead.jobType.toLowerCase().includes(search.toLowerCase())
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
            <p className="text-xs text-gray-500 mb-1">This week's calls</p>
            <p className="text-3xl font-bold text-gray-900">25</p>
            <p className="text-xs text-gray-400 mt-1">3 more than last week</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Confirmed Jobs</p>
            <p className="text-3xl font-bold text-gray-900">11</p>
            <p className="text-xs text-gray-400 mt-1">4 more than last week</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Awaiting follow up</p>
            <p className="text-3xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-400 mt-1">clients waiting for follow up</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Closed Calls</p>
            <p className="text-3xl font-bold text-gray-900">2</p>
            <p className="text-xs text-gray-400 mt-1">clients did not proceed with job</p>
          </div>
        </div>

        {/* Leads table */}
        <div className="bg-white rounded-xl p-4">
          <input
            type="text"
            placeholder="Search by Name, Suburb, Job Type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm mb-4 outline-none focus:border-blue-400"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-100">
                  <th className="text-left pb-3 font-medium">Name</th>
                  <th className="text-left pb-3 font-medium">Job Type</th>
                  <th className="text-left pb-3 font-medium">Suburb</th>
                  <th className="text-left pb-3 font-medium">Quote</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-400">{lead.phone}</p>
                    </td>
                    <td className="py-3 text-gray-600">{lead.jobType}</td>
                    <td className="py-3 text-gray-600">{lead.suburb}</td>
                    <td className="py-3 font-medium text-gray-900">
                      {lead.quote > 0 ? `R${lead.quote.toLocaleString()}` : '---'}
                    </td>
                    <td className="py-3 text-gray-500">{lead.date}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColours[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}