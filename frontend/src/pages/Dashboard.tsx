import { useState, useEffect } from 'react'
import { Search, Trash2 } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../lib/api'
import { useOnLeadCreated } from '../lib/logCall'
import { formatJobDetails } from '../lib/jobDetails'
import { useCurrentUser } from '../lib/useCurrentUser'
import { usePricingRules } from '../lib/pricingRules'
import { Alert, Card, EmptyState, Spinner, Toaster } from '../components/ui'
import { useToast } from '../lib/useToast'
import { statusStyles } from '../lib/status'
import { formatQuote, quoteClass } from '../lib/quote'
import LeadDetailPanel, { type Lead } from '../components/LeadDetailPanel'

// ── types ──────────────────────────────────────────────────────────────────


const statuses = ['new', 'contacted', 'confirmed', 'closed', 'incomplete']

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// Trash button that asks "Delete?" in place before removing the lead
function DeleteAction({ lead, confirming, onAsk, onCancel, onConfirm }: {
  lead: Lead
  confirming: boolean
  onAsk: () => void
  onCancel: () => void
  onConfirm: () => void
}) {
  if (confirming) {
    return (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={onConfirm}
          className="text-xs font-medium px-2 py-1 rounded bg-coral-500 text-white hover:bg-coral-600"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium px-2 py-1 rounded text-muted hover:bg-sea-50"
        >
          Cancel
        </button>
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onAsk}
      aria-label={`Delete lead for ${lead.name}`}
      className="p-1.5 rounded text-muted hover:text-coral-600 hover:bg-coral-50"
    >
      <Trash2 size={16} />
    </button>
  )
}

function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="text-3xl font-bold text-ink mt-2">{value}</p>
      <p className="text-xs text-muted mt-1">{note}</p>
    </Card>
  )
}

function StatusSelect({ lead, onChange }: { lead: Lead; onChange: (status: string) => void }) {
  return (
    <select
      value={lead.status}
      onChange={e => onChange(e.target.value)}
      aria-label={`Status for ${lead.name}`}
      className={`text-xs pl-2 pr-7 py-1 rounded font-medium capitalize ring-1 ring-inset border-0 cursor-pointer ${statusStyles[lead.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}
    >
      {statuses.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  )
}

export default function Dashboard() {
  const { user } = useCurrentUser()
  const { rules } = usePricingRules()
  const displayName = user?.first_name || user?.username || ''

  // Toast notifications for API failures
  const { toasts, toast } = useToast()

  const [leads, setLeads]     = useState<Lead[]>([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selectedLead = leads.find(l => l.id === selectedId) ?? null

  useEffect(() => {
    api.get('/leads/')
      .then(res => setLeads(res.data))
      .catch(() => setError('Could not load leads. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(leadId: number, newStatus: string) {
    try {
      await api.patch(`/leads/${leadId}/status?status=${newStatus}`)
      setLeads(prev =>
        prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l)
      )
    } catch {
      // The list only changes on success, so just tell the user
      toast('Failed to update status. Please try again.')
    }
  }

  async function deleteLead(leadId: number) {
    setConfirmingDelete(null)
    try {
      await api.delete(`/leads/${leadId}`)
      if (selectedId === leadId) setSelectedId(null)
      setLeads(prev => prev.filter(l => l.id !== leadId))
    } catch {
      toast('Failed to delete lead. Please try again.')
    }
  }

  async function filterByStatus(status: string | null) {
    setActiveFilter(status)
    try {
      const url = status ? `/leads/?status=${status}` : '/leads/'
      const res = await api.get(url)
      setLeads(res.data)
    } catch {
      toast('Failed to load leads. Check your connection.')
    }
  }

  useOnLeadCreated(() => filterByStatus(activeFilter))

  const query = search.toLowerCase()
  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(query) ||
    lead.contact.toLowerCase().includes(query) ||
    formatJobDetails(lead.job_details, rules).toLowerCase().includes(query)
  )

  return (
    <DashboardLayout>

      {/* Header - flat on the page background */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          {greeting()}{displayName && `, ${displayName}`}
        </h1>
        <p className="text-sm text-muted mt-1">Here's what's come in from your calls.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Metric label="Total leads" value={leads.length} note="all time" />
        <Metric
          label="Confirmed jobs"
          value={leads.filter(l => l.status === 'confirmed').length}
          note="from all leads"
        />
        <Metric
          label="Awaiting follow up"
          value={leads.filter(l => l.status === 'new').length}
          note="new leads"
        />
        <Metric
          label="Closed"
          value={leads.filter(l => l.status === 'closed').length}
          note="did not proceed"
        />
      </div>

      {/* Leads */}
      <Card title="Leads">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          {/* Filter buttons */}
          <div
            className="inline-flex flex-wrap rounded-md border border-sea-200 bg-white p-0.5"
            role="group"
            aria-label="Filter by status"
          >
            {['all', ...statuses].map(s => {
              const active = (s === 'all' && activeFilter === null) || activeFilter === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => filterByStatus(s === 'all' ? null : s)}
                  aria-pressed={active}
                  className={`text-xs font-medium px-3 py-1.5 rounded transition-colors capitalize ${
                    active
                      ? 'bg-sea-100 text-sea-900'
                      : 'text-muted hover:text-ink hover:bg-sea-50'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>

          {/* Search input */}
          <div className="relative md:ml-auto md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sea-500" />
            <input
              type="search"
              placeholder="Search name, contact or job..."
              aria-label="Search leads"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-md border border-sea-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        {loading && <Spinner label="Loading leads..." />}
        {error && <Alert>{error}</Alert>}
        {!loading && !error && filteredLeads.length === 0 && (
          <EmptyState>No leads found</EmptyState>
        )}

        {!loading && !error && filteredLeads.length > 0 && (
          <>
            {/* Table on larger screens */}
            <div className="hidden md:block overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-y border-sea-100 bg-sea-50/60">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Contact</th>
                    <th className="px-5 py-3 font-medium">Job details</th>
                    <th className="px-5 py-3 font-medium text-right">Quote</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sea-50">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-sea-50/50">
                      <td className="px-5 py-3 font-medium text-ink">
                        <button
                          type="button"
                          onClick={() => setSelectedId(lead.id)}
                          className="text-left hover:text-brand-600 hover:underline"
                        >
                          {lead.name}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-muted">{lead.contact}</td>
                      <td className="px-5 py-3 text-muted">{formatJobDetails(lead.job_details, rules)}</td>
                      <td className={`px-5 py-3 text-right tabular-nums ${quoteClass(lead.quote)}`}>
                        {formatQuote(lead.quote)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusSelect lead={lead} onChange={s => updateStatus(lead.id, s)} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <DeleteAction
                          lead={lead}
                          confirming={confirmingDelete === lead.id}
                          onAsk={() => setConfirmingDelete(lead.id)}
                          onCancel={() => setConfirmingDelete(null)}
                          onConfirm={() => deleteLead(lead.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards on phones */}
            <ul className="md:hidden flex flex-col divide-y divide-sea-100">
              {filteredLeads.map(lead => (
                <li key={lead.id} className="py-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedId(lead.id)}
                      className="font-medium text-ink text-left hover:text-brand-600 hover:underline"
                    >
                      {lead.name}
                    </button>
                    <p className={`tabular-nums ${quoteClass(lead.quote)}`}>{formatQuote(lead.quote)}</p>
                  </div>
                  <p className="text-sm text-muted">{formatJobDetails(lead.job_details, rules)}</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted">{lead.contact}</p>
                    <div className="flex items-center gap-2">
                      <StatusSelect lead={lead} onChange={s => updateStatus(lead.id, s)} />
                      <DeleteAction
                        lead={lead}
                        confirming={confirmingDelete === lead.id}
                        onAsk={() => setConfirmingDelete(lead.id)}
                        onCancel={() => setConfirmingDelete(null)}
                        onConfirm={() => deleteLead(lead.id)}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      {selectedLead && (
        <LeadDetailPanel
          key={selectedLead.id}
          lead={selectedLead}
          rules={rules}
          onClose={() => setSelectedId(null)}
          onStatusChange={status => updateStatus(selectedLead.id, status)}
          onDelete={() => deleteLead(selectedLead.id)}
          onError={toast}
        />
      )}

      {/* Toast notifications — rendered last so they sit above everything */}
      <Toaster toasts={toasts} />

    </DashboardLayout>
  )
}