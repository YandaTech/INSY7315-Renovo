import { useEffect, useRef, useState } from 'react'
import { Call, Device } from '@twilio/voice-sdk'
import axios from 'axios'
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import api from '../lib/api'
import { Alert, Card, PageHeader } from '../components/ui'

type Status = 'idle' | 'connecting' | 'ringing' | 'connected' | 'ended'

const statusText: Record<Status, string> = {
  idle: 'Ready to call',
  connecting: 'Connecting…',
  ringing: 'Ringing…',
  connected: 'Connected',
  ended: 'Call ended',
}

async function fetchToken(): Promise<string> {
  const res = await api.get<{ token: string }>('/voice/token')
  return res.data.token
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Calls the AI receptionist from the browser through Twilio, using the same
// TwiML app as the phone line, so demo calls are handled and saved exactly
// like real ones.
export default function DemoCall() {
  const deviceRef = useRef<Device | null>(null)
  const callRef = useRef<Call | null>(null)
  const [status, setStatus]   = useState<Status>('idle')
  const [muted, setMuted]     = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError]     = useState('')

  // Tick the call timer while connected
  useEffect(() => {
    if (status !== 'connected') return
    const timer = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [status])

  // Hang up and release the microphone when leaving the page
  useEffect(() => () => {
    callRef.current?.disconnect()
    deviceRef.current?.destroy()
  }, [])

  async function startCall() {
    setError('')
    setSeconds(0)
    setMuted(false)
    setStatus('connecting')

    try {
      if (!deviceRef.current) {
        const device = new Device(await fetchToken(), { codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU] })
        device.on('tokenWillExpire', async () => {
          try {
            device.updateToken(await fetchToken())
          } catch {
            // The next call will fetch a fresh token instead
          }
        })
        device.on('error', err => setError(err.message ?? 'Call error'))
        deviceRef.current = device
      }

      const call = await deviceRef.current.connect()
      callRef.current = call
      call.on('ringing', () => setStatus('ringing'))
      call.on('accept', () => setStatus('connected'))
      call.on('disconnect', () => setStatus('ended'))
      call.on('cancel', () => setStatus('ended'))
      call.on('error', err => {
        setError(err.message ?? 'Call error')
        setStatus('ended')
      })
    } catch (err) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : null
      setError(
        typeof detail === 'string'
          ? detail
          : err instanceof Error && err.name === 'NotAllowedError'
            ? 'Microphone access was blocked. Allow it in the browser and try again.'
            : 'Could not start the call.'
      )
      setStatus('idle')
    }
  }

  function hangUp() {
    callRef.current?.disconnect()
  }

  function toggleMute() {
    const next = !muted
    callRef.current?.mute(next)
    setMuted(next)
  }

  const inCall = status === 'connecting' || status === 'ringing' || status === 'connected'

  return (
    <DashboardLayout>
      <PageHeader
        title="Demo call"
        subtitle="Talk to the AI receptionist from your browser, no phone needed."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <Card className="lg:col-span-2">
          <div className="flex flex-col items-center text-center py-8">
            <p className="text-sm font-medium text-muted">{statusText[status]}</p>
            <p className="text-4xl font-bold text-ink tabular-nums mt-2 mb-8">
              {formatDuration(seconds)}
            </p>

            {!inCall ? (
              <button
                type="button"
                onClick={startCall}
                aria-label="Call Renovo"
                className="w-20 h-20 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors"
              >
                <Phone size={32} />
              </button>
            ) : (
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={toggleMute}
                  disabled={status !== 'connected'}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                  aria-pressed={muted}
                  className={`w-14 h-14 rounded-full border flex items-center justify-center transition-colors disabled:opacity-40 ${
                    muted ? 'bg-sea-100 border-sea-300 text-sea-900' : 'bg-white border-sea-200 text-sea-700 hover:bg-sea-50'
                  }`}
                >
                  {muted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                <button
                  type="button"
                  onClick={hangUp}
                  aria-label="Hang up"
                  className="w-20 h-20 rounded-full bg-coral-500 text-white flex items-center justify-center hover:bg-coral-600 transition-colors"
                >
                  <PhoneOff size={32} />
                </button>
              </div>
            )}

            <p className="text-xs text-muted mt-8">
              {inCall ? 'Speak normally. The receptionist answers after a short pause.' : 'Press call and allow microphone access.'}
            </p>
          </div>

          {error && <Alert>{error}</Alert>}
        </Card>

        <Card title="How the demo works">
          <ul className="flex flex-col gap-3 text-sm text-muted">
            <li>This is the real AI receptionist, the same one callers reach on the phone line.</li>
            <li>Ask for a quote, e.g. "I'd like my bath re-enameled, it's enamel and stained, I'm in Rondebosch."</li>
            <li>When the call ends it's saved like any other call: the lead appears on the Dashboard with its quote, and the transcript is kept.</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  )
}
