import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Toaster } from './ui'
import ToastProvider from './ToastProvider'
import { useToast } from '../lib/useToast'

// A modal-like component that raises a toast and closes itself, the way
// LogCallModal does after saving.
function Emitter({ onDone }: { onDone: () => void }) {
  const { toasts, toast, dismiss } = useToast()
  return (
    <>
      <button type="button" onClick={() => { toast('Call logged and lead saved', 'success'); onDone() }}>
        Save
      </button>
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

function Page() {
  const [open, setOpen] = useState(true)
  return open ? <Emitter onDone={() => setOpen(false)} /> : <p>Modal closed</p>
}

describe('ToastProvider', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps a toast on screen after the component that raised it unmounts', async () => {
    render(<ToastProvider><Page /></ToastProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Modal closed')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Call logged and lead saved')
  })

  it('shows each toast once, in the shared stack only', async () => {
    render(<ToastProvider><Page /></ToastProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getAllByText('Call logged and lead saved')).toHaveLength(1)
  })

  it('removes a toast when its dismiss button is clicked', async () => {
    render(<ToastProvider><Page /></ToastProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByText('Call logged and lead saved')).not.toBeInTheDocument()
  })

  it('still dismisses a toast on its own after 4 seconds', () => {
    vi.useFakeTimers()
    render(<ToastProvider><Page /></ToastProvider>)
    act(() => screen.getByRole('button', { name: 'Save' }).click())
    expect(screen.getByRole('status')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(4000))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
