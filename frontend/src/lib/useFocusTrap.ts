import { useEffect, useRef } from 'react'

// Keeps keyboard focus inside a dialog while it is mounted.
//
//   const ref = useFocusTrap<HTMLFormElement>()
//   <form ref={ref} role="dialog" ...>
//
// On mount:   remembers the element that opened the dialog, then focuses the
//             element marked data-autofocus, or else the first focusable one.
// On Tab:     wraps from the last focusable element to the first, and
//             Shift+Tab wraps from the first to the last. If focus has left
//             the dialog (say, after a click on the backdrop), Tab brings it back.
// On unmount: returns focus to the element that opened the dialog.
//
// Escape is left to the dialog itself.

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusableIn(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter(el => el.getClientRects().length > 0)
}

export function useFocusTrap<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const opener = document.activeElement instanceof HTMLElement
      && !container.contains(document.activeElement)
      ? document.activeElement
      : null

    const initial = container.querySelector<HTMLElement>('[data-autofocus]') ?? focusableIn(container)[0]
    initial?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !container) return
      const elements = focusableIn(container)
      if (elements.length === 0) {
        e.preventDefault()
        return
      }
      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement

      if (!container.contains(active)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      // The opener may be gone (a deleted lead's row, a closed menu)
      if (opener?.isConnected) opener.focus()
    }
  }, [])

  return ref
}
