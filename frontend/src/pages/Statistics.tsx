import DashboardLayout from '../layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../lib/api'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface Call {
  created_at: string
  outcome: string | null
}

interface Lead {
  id: number
  name: string
  status: string
  created_at: string
}

const statusColours: Record<string, string> = {
  incomplete: 'bg-orange-100 text-orange-700',
  new:        'bg-blue-100 text-blue-700',
  closed:     'bg-red-100 text-red-700',
  confirmed:  'bg-green-100 text-green-700',
  contacted:  'bg-yellow-100 text-yellow-700',
}

// Bars for the last 7 days, oldest first, ending today.
function callsPerDay(calls: Call[]) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  return days.map(day => ({
    day: day.toLocaleDateString('en-GB', { weekday: 'short' }),
    calls: calls.filter(call => {
      // Backend timestamps are UTC without a zone suffix
      const created = new Date(`${call.created_at}Z`)
      created.setHours(0, 0, 0, 0)
      return created.getTime() === day.getTime()
    }).length,
  }))
}

function formatTime(iso: string) {
  return new Date(`${iso}Z`).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Statistics() {
  const navigate = useNavigate()
  const [calls, setCalls]     = useState<Call[]>([])
  const [leads, setLeads]     = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    Promise.all([api.get<Call[]>('/calls/'), api.get<Lead[]>('/leads/')])
      .then(([callsRes, leadsRes]) => {
        setCalls(callsRes.data)
        setLeads(leadsRes.data)
      })
      .catch(() => setError('Could not load statistics. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  const quotedCalls = calls.filter(call => call.outcome === 'quoted').length

  return (
    <DashboardLayout>
      <div className="p-6">
        {error && (
          <p className="text-sm text-red-400 text-center py-4">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-4">

          {/* Left column — chart + totals */}
          <div className="col-span-2 flex flex-col gap-4">

            {/* Bar chart */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-900">Calls</h2>
                <span className="text-sm text-gray-500">Last 7 days</span>
              </div>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading call data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={callsPerDay(calls)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="calls"
                      fill="#3B5BDB"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 flex items-center gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-900">Total calls</p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
                <p className="text-4xl font-bold text-gray-900">{calls.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 flex items-center gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-900">Quotes given</p>
                  <p className="text-xs text-gray-500 mt-1">By the AI agent</p>
                </div>
                <p className="text-4xl font-bold text-gray-900">{quotedCalls}</p>
              </div>
            </div>

          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Log a call button */}
            <button
              onClick={() => navigate('/log-call')}
              className="bg-blue-600 text-white text-sm font-medium py-3 px-4 rounded-full hover:bg-blue-700 transition-colors"
            >
              + Log a call
            </button>

            {/* Recent activity */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
              {!loading && leads.length === 0 && (
                <p className="text-sm text-gray-400">No leads yet</p>
              )}
              <div className="flex flex-col gap-3">
                {leads.slice(0, 5).map(lead => (
                  <div key={lead.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-400">{formatTime(lead.created_at)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColours[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
