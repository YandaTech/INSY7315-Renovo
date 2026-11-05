import { act, render, renderHook, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Toaster } from '../components/ui'
import { useToast } from './useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('adds a toast, as an error by default', () => {
    const { result } = renderHook(() => useToast())
    act(() => result.current.toast('Could not save'))
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0]).toMatchObject({ message: 'Could not save', tone: 'error' })
  })

  it('dismisses a toast after 4 seconds', () => {
    const { result } = renderHook(() => useToast())
    act(() => result.current.toast('Saved', 'success'))

    act(() => vi.advanceTimersByTime(3999))
    expect(result.current.toasts).toHaveLength(1)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current.toasts).toHaveLength(0)
  })

  it('gives two toasts added at once distinct ids and dismisses each on its own timer', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.toast('First')
      result.current.toast('Second', 'success')
    })
    const [first, second] = result.current.toasts
    expect(first.id).not.toBe(second.id)

    act(() => vi.advanceTimersByTime(2000))
    act(() => result.current.toast('Third'))
    expect(result.current.toasts.map(t => t.message)).toEqual(['First', 'Second', 'Third'])

    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.toasts.map(t => t.message)).toEqual(['Third'])

    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.toasts).toHaveLength(0)
  })
})

describe('Toaster', () => {
  it('renders nothing with no toasts', () => {
    const { container } = render(<Toaster toasts={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders each message, errors as alerts and successes as status', () => {
    render(
      <Toaster
        toasts={[
          { id: 1, message: 'Could not save', tone: 'error' },
          { id: 2, message: 'Lead updated', tone: 'success' },
        ]}
      />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Could not save')
    expect(screen.getByRole('status')).toHaveTextContent('Lead updated')
  })

  it('has no dismiss button unless onDismiss is given', () => {
    render(<Toaster toasts={[{ id: 1, message: 'Saved', tone: 'success' }]} />)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
  })

  it('calls onDismiss with the toast id', () => {
    const onDismiss = vi.fn()
    render(<Toaster toasts={[{ id: 7, message: 'Saved', tone: 'success' }]} onDismiss={onDismiss} />)
    screen.getByRole('button', { name: 'Dismiss' }).click()
    expect(onDismiss).toHaveBeenCalledWith(7)
  })
})
