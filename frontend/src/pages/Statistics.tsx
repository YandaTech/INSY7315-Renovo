import DashboardLayout from '../layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../lib/api'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { mockCallData, mockEmailsSent } from '../lib/mockData'

const statusColours: Record<string, string> = {
  incomplete: 'bg-orange-100 text-orange-700',
  new:        'bg-blue-100 text-blue-700',
  closed:     'bg-red-100 text-red-700',
  confirmed:  'bg-green-100 text-green-700',
  contacted:  'bg-yellow-100 text-yellow-700',
}

interface Lead {
  id: number
  name: string
  contact: string
  job_details: string
  quote: number
  status: string
  created_at: string
}

export default function Statistics() {
  const navigate = useNavigate()

  const [calls, setCalls]             = useState<{ day: string, calls: number }[]>([])
  const [totalCalls, setTotalCalls]   = useState(0)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    // load calls for chart
    api.get('/calls/')
      .then(res => {
        const data = res.data
        setTotalCalls(data.length)

        const dayCounts: Record<string, number> = {
          Monday: 0, Tuesday: 0, Wednesday: 0,
          Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
        }
        data.forEach((call: { created_at: string }) => {
          const day = new Date(call.created_at).toLocaleDateString(
            'en-GB', { weekday: 'long' }
          )
          if (dayCounts[day] !== undefined) {
            dayCounts[day]++
          }
        })
        setCalls(Object.entries(dayCounts).map(([day, count]) => ({
          day,
          calls: count
        })))
        setLoading(false)
      })
      .catch(() => {
        setCalls(mockCallData)
        setLoading(false)
      })

    // load recent leads for activity panel
    api.get('/leads/')
      .then(res => {
        // sort by created_at descending and take last 4
        const sorted = [...res.data].sort(
          (a: Lead, b: Lead) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setRecentLeads(sorted.slice(0, 4))
      })
      .catch(() => setRecentLeads([]))

  }, [])

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} mins ago`
    if (diffHours < 24) return `Today, ${date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`
    if (diffDays === 1) return `Yesterday, ${date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`
    return date.toLocaleDateString('en-ZA')
  }

  function getJobTypeName(jobDetails: string) {
    try {
      const raw = jobDetails.replace(/'/g, '"').replace(/None/g, 'null')
      const details = JSON.parse(raw)
      if (details.job_type) {
        return details.job_type
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase())
      }
    } catch {
      return jobDetails
    }
    return jobDetails
  }

  function getTopServices(leads: Lead[]) {
  const counts: Record<string, number> = {}

  leads.forEach(lead => {
    try {
      const raw = lead.job_details.replace(/'/g, '"').replace(/None/g, 'null')
      const details = JSON.parse(raw)
      if (details.job_type) {
        const name = details.job_type
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase())
        counts[name] = (counts[name] || 0) + 1
      }
    } catch {
      if (typeof lead.job_details === 'string' && lead.job_details) {
        counts[lead.job_details] = (counts[lead.job_details] || 0) + 1
      }
    }
  })

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
}
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">

          {/* Left column — chart + total */}
          <div className="col-span-2 flex flex-col gap-4">

            {/* Bar chart */}
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-900">Calls</h2>
                <span className="text-sm text-gray-500">This Week</span>
              </div>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading call data...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={calls}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
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

            {/* Total calls */}
            <div className="bg-white rounded-xl p-4 flex items-center gap-6">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Total calls
                </p>
                <p className="text-sm font-medium text-gray-900">
                  in the system
                </p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">{totalCalls}</p>
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

            {/* Recent activity — real data */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">
                Recent Activity
              </h3>
              {recentLeads.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  No recent activity
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(lead.created_at)} · {getJobTypeName(lead.job_details)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColours[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Services */}
<div className="bg-white rounded-xl p-4">
  <h3 className="font-bold text-gray-900 mb-3">
    Top Services
  </h3>
  {recentLeads.length === 0 ? (
    <p className="text-xs text-gray-400 text-center py-4">
      No data yet
    </p>
  ) : (
    <div className="flex flex-col gap-3">
      {getTopServices(recentLeads).map(service => (
        <div key={service.name} className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-gray-700">
              {service.name}
            </p>
            <p className="text-xs text-gray-500">
              {service.count} {service.count === 1 ? 'lead' : 'leads'}
            </p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{
                width: `${(service.count / recentLeads.length) * 100}%`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )}
</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}