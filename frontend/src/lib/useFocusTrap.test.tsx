import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFocusTrap } from './useFocusTrap'

// jsdom does no layout, so getClientRects() is always empty and the hook
// would see nothing as focusable. Report one rect so elements count as visible.
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(
    [{}] as unknown as DOMRectList
  )
})

function Dialog() {
  const ref = useFocusTrap<HTMLDivElement>()
  return (
    <div ref={ref} role="dialog">
      <button>First</button>
      <button>Last</button>
    </div>
  )
}

function Page() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(o => !o)}>Opener</button>
      {open && <Dialog />}
    </>
  )
}

describe('useFocusTrap', () => {
  it('focuses the first element, wraps Tab both ways and returns focus on close', () => {
    render(<Page />)
    const opener = screen.getByRole('button', { name: 'Opener' })
    opener.focus()
    fireEvent.click(opener)

    const first = screen.getByRole('button', { name: 'First' })
    const last = screen.getByRole('button', { name: 'Last' })
    expect(first).toHaveFocus()

    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(first).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()

    // Focus outside the dialog: Tab brings it back in
    opener.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(first).toHaveFocus()

    fireEvent.click(opener)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})
