import DashboardLayout from '../layouts/DashboardLayout'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import api from '../lib/api'
import { useLogCall, useOnLeadCreated } from '../lib/logCall'
import { Alert, Button, Card, EmptyState, Spinner, StatusBadge, PageHeader } from '../components/ui'
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
  const { openLogCall } = useLogCall()
  const [calls, setCalls]     = useState<Call[]>([])
  const [leads, setLeads]     = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  function load() {
    Promise.all([api.get<Call[]>('/calls/'), api.get<Lead[]>('/leads/')])
      .then(([callsRes, leadsRes]) => {
        setCalls(callsRes.data)
        setLeads(leadsRes.data)
      })
      .catch(() => setError('Could not load statistics. Is the backend running?'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])
  useOnLeadCreated(load)

  const quotedCalls = calls.filter(call => call.outcome === 'quoted').length

  return (
    <DashboardLayout>
      <PageHeader
        title="Statistics"
        subtitle="How the phone line is performing."
        action={
          <Button onClick={openLogCall}>
            <Plus size={16} /> Log a call
          </Button>
        }
      />

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left column — chart + totals */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          <Card title="Calls" subtitle="Last 7 days">
            {loading ? (
              <Spinner label="Loading call data..." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={callsPerDay(calls)} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1eff0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: '#5f7076' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#5f7076' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f2f8f8' }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #c3dfe1', fontSize: 12 }}
                  />
                  <Bar dataKey="calls" fill="#4f969c" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Total calls</p>
              <p className="text-4xl font-bold text-ink mt-2">{calls.length}</p>
              <p className="text-xs text-muted mt-1">All time</p>
            </Card>
            <Card>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Quotes given</p>
              <p className="text-4xl font-bold text-ink mt-2">{quotedCalls}</p>
              <p className="text-xs text-muted mt-1">By the AI agent</p>
            </Card>
          </div>

        </div>

        {/* Right column */}
        <Card title="Recent activity">
          {!loading && leads.length === 0 && <EmptyState>No leads yet</EmptyState>}
          <ul className="flex flex-col divide-y divide-sea-50">
            {leads.slice(0, 6).map(lead => (
              <li key={lead.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{lead.name}</p>
                  <p className="text-xs text-muted">{formatTime(lead.created_at)}</p>
                </div>
                <StatusBadge status={lead.status} />
              </li>
            ))}
          </ul>
        </Card>

      </div>
    </DashboardLayout>
  )
}
