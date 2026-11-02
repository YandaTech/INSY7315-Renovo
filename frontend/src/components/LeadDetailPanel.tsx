import { useEffect, useState } from 'react'
import { Phone, Trash2, X } from 'lucide-react'
import api from '../lib/api'
import { formatJobDetails } from '../lib/jobDetails'
import type { PricingRules } from '../lib/pricingRules'
import { statusStyles } from '../lib/status'
import { useFocusTrap } from '../lib/useFocusTrap'
import { Alert, Spinner } from './ui'

export interface Lead {
  id: number
  name: string
  contact: string
  job_details: string | null
  quote: number | null
  status: string
  created_at: string
  call_sid: string | null
}

interface CallLog {
  duration: number
  outcome: string | null
  transcript: string | null
}

const statuses = ['new', 'contacted', 'confirmed', 'closed', 'incomplete']

function formatQuote(quote: number | null) {
  return quote
    ? `R${quote.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—'
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

// "Agent: ..." / "Caller: ..." lines from voice-bridge
function parseTranscript(transcript: string | null) {
  return (transcript ?? '')
    .split('\n')
    .map(line => {
      const match = line.match(/^(Agent|Caller):\s?(.*)$/)
      return match ? { speaker: match[1], text: match[2] } : null
    })
    .filter((turn): turn is { speaker: string; text: string } => !!turn?.text)
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-sea-50 last:border-0">
      <dt className="text-sm text-muted shrink-0">{label}</dt>
      <dd className="text-sm text-ink text-right">{children}</dd>
    </div>
  )
}

export default function LeadDetailPanel({ lead, rules, onClose, onStatusChange, onDelete, onError }: {
  lead: Lead
  rules: PricingRules | null
  onClose: () => void
  onStatusChange: (status: string) => void
  onDelete: () => void
  // Shows a toast on the page that owns the panel
  onError: (message: string) => void
}) {
  const [call, setCall]               = useState<CallLog | null>(null)
  const [callError, setCallError]     = useState('')
  const [loadingCall, setLoadingCall] = useState(!!lead.call_sid)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Keeps Tab inside the panel and returns focus to the opener on close
  const panelRef = useFocusTrap<HTMLElement>()

  useEffect(() => {
    if (!lead.call_sid) return
    api.get<CallLog>(`/calls/${lead.call_sid}`)
      .then(res => setCall(res.data))
      .catch(() => {
        setCallError('Could not load the call.')
        onError('Could not load the call log. Please try again.')
      })
      .finally(() => setLoadingCall(false))
  }, [lead.call_sid, onError])

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const turns = parseTranscript(call?.transcript ?? null)
  const isPhone = /^\+?\d[\d\s]{6,}$/.test(lead.contact)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-sea-900/30" onClick={onClose} aria-hidden="true" />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-detail-title"
        className="relative w-full max-w-md bg-white h-full flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-sea-100">
          <div className="min-w-0">
            <h2 id="lead-detail-title" className="text-lg font-bold tracking-tight text-ink truncate">
              {lead.name}
            </h2>
            <p className="text-sm text-muted">
              {new Date(`${lead.created_at}Z`).toLocaleString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded text-muted hover:bg-sea-50 hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          {/* Summary */}
          <dl>
            <Row label="Contact">
              {isPhone ? (
                <a href={`tel:${lead.contact.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:underline">
                  <Phone size={14} /> {lead.contact}
                </a>
              ) : (
                lead.contact
              )}
            </Row>
            <Row label="Job">{formatJobDetails(lead.job_details, rules)}</Row>
            <Row label="Quote">
              <span className="font-semibold tabular-nums">{formatQuote(lead.quote)}</span>
            </Row>
            <Row label="Status">
              <select
                value={lead.status}
                onChange={e => onStatusChange(e.target.value)}
                aria-label="Status"
                className={`text-xs pl-2 pr-7 py-1 rounded font-medium capitalize ring-1 ring-inset border-0 cursor-pointer ${statusStyles[lead.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Row>
            {call && (
              <>
                <Row label="Call length">{formatDuration(call.duration)}</Row>
                <Row label="Call outcome"><span className="capitalize">{call.outcome ?? '—'}</span></Row>
              </>
            )}
          </dl>

          {/* Transcript */}
          <section>
            <h3 className="text-sm font-semibold text-ink mb-3">Call transcript</h3>
            {!lead.call_sid && (
              <p className="text-sm text-muted">Logged manually, so there's no call recording.</p>
            )}
            {loadingCall && <Spinner label="Loading call..." />}
            {callError && <Alert>{callError}</Alert>}
            {call && turns.length === 0 && (
              <p className="text-sm text-muted">No transcript was saved for this call.</p>
            )}
            <ol className="flex flex-col gap-2">
              {turns.map((turn, i) => (
                <li
                  key={i}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    turn.speaker === 'Caller'
                      ? 'self-end bg-brand-50 text-ink'
                      : 'self-start bg-sea-50 text-ink'
                  }`}
                >
                  <span className="block text-[11px] font-medium text-muted mb-0.5">
                    {turn.speaker === 'Caller' ? lead.name : 'Receptionist'}
                  </span>
                  {turn.text}
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-sea-100 flex justify-end gap-2">
          {confirmDelete ? (
            <>
              <span className="text-sm text-muted mr-auto self-center">Delete this lead?</span>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-sm font-medium px-3 py-2 rounded-md text-muted hover:bg-sea-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="text-sm font-medium px-3 py-2 rounded-md bg-coral-500 text-white hover:bg-coral-600"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md text-coral-700 hover:bg-coral-50"
            >
              <Trash2 size={16} /> Delete lead
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}