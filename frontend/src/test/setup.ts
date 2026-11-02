import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Node 25+ has its own experimental localStorage global, which is undefined
// without --localstorage-file and hides jsdom's. Vitest exposes the JSDOM
// instance as `jsdom`; take its storage instead.
const dom = (globalThis as { jsdom?: { window: Window } }).jsdom
if (dom && !globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: dom.window.localStorage,
    configurable: true,
    writable: true,
  })
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
