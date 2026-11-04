import DashboardLayout from '../layouts/DashboardLayout'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import api from '../lib/api'
import { usePricingRules, type PricingRules } from '../lib/pricingRules'
import { jobFields, type JobFields } from '../lib/jobDetails'
import { useLogCall, useOnLeadCreated } from '../lib/logCall'
import {
  countNotifications,
  fetchAllNotifications,
  type DeliveryCounts,
  type NotificationCounts,
  type NotificationRecord,
} from '../lib/notifications'
import { Alert, Button, Card, EmptyState, Spinner, StatusBadge, PageHeader } from '../components/ui'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface Call {
  created_at: string
  outcome: string | null
}

interface Lead extends JobFields {
  id: number
  name: string
  status: string
  created_at: string
  job_details: string | null
}

function jobType(lead: Lead): string | null {
  const fields = jobFields(lead)
  return fields && typeof fields === 'object' ? fields.job_type ?? null : null
}

// Most requested services across all leads, busiest first
function topServices(leads: Lead[], rules: PricingRules | null) {
  const counts: Record<string, number> = {}
  for (const lead of leads) {
    const type = jobType(lead)
    if (type) counts[type] = (counts[type] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([type, count]) => ({
      name: rules?.services[type]?.label ?? type.replace(/_/g, ' '),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
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

function DeliveryStat({ label, counts }: { label: string; counts: DeliveryCounts }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label} sent</p>
      <p className="text-4xl font-bold text-ink mt-2 tabular-nums">{counts.sent}</p>
      <p className={`text-xs mt-1 tabular-nums ${counts.failed > 0 ? 'text-coral-700' : 'text-muted'}`}>
        {counts.failed} failed
      </p>
    </div>
  )
}

function loadNotifications() {
  return fetchAllNotifications(async (skip, limit) => {
    const res = await api.get<NotificationRecord[]>('/notifications/', { params: { skip, limit } })
    return res.data
  })
}

export default function Statistics() {
  const { openLogCall } = useLogCall()
  const { rules } = usePricingRules()
  const [calls, setCalls]     = useState<Call[]>([])
  const [leads, setLeads]     = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [notifications, setNotifications] = useState<NotificationCounts | null>(null)
  const [notificationsError, setNotificationsError] = useState('')

  function load() {
    // Loaded on its own so a failure here still shows the call statistics.
    loadNotifications()
      .then(rows => {
        setNotifications(countNotifications(rows))
        setNotificationsError('')
      })
      .catch(() => setNotificationsError('Could not load SMS and email counts.'))

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

          <Card title="Quote confirmations" subtitle="SMS and email sent after quoted calls, all time">
            {notificationsError ? (
              <Alert>{notificationsError}</Alert>
            ) : !notifications ? (
              <Spinner label="Loading SMS and email counts..." />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <DeliveryStat label="SMS" counts={notifications.sms} />
                <DeliveryStat label="Email" counts={notifications.email} />
              </div>
            )}
          </Card>

        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
        <Card title="Recent activity">
          {!loading && leads.length === 0 && <EmptyState>No leads yet</EmptyState>}
          <ul className="flex flex-col divide-y divide-sea-50">
            {leads.slice(0, 6).map(lead => (
              <li key={lead.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{lead.name}</p>
                  <p className="text-xs text-muted truncate">
                    {formatTime(lead.created_at)}
                    {jobType(lead) && ` · ${rules?.services[jobType(lead)!]?.label ?? jobType(lead)}`}
                  </p>
                </div>
                <StatusBadge status={lead.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Top services" subtitle="Across all leads">
          {!loading && topServices(leads, rules).length === 0 && <EmptyState>No data yet</EmptyState>}
          <ul className="flex flex-col gap-3">
            {topServices(leads, rules).map(service => (
              <li key={service.name}>
                <div className="flex justify-between gap-3 text-xs mb-1">
                  <span className="font-medium text-ink truncate">{service.name}</span>
                  <span className="text-muted shrink-0 tabular-nums">
                    {service.count} {service.count === 1 ? 'lead' : 'leads'}
                  </span>
                </div>
                <div className="h-1.5 bg-sea-50 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-sea-500 rounded-sm"
                    style={{ width: `${(service.count / leads.length) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        </div>

      </div>
    </DashboardLayout>
  )
}
