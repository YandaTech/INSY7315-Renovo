import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from '../components/ui'
import { statusStyles } from './status'

describe('statusStyles', () => {
  it('has a colour for every lead status', () => {
    expect(Object.keys(statusStyles).sort()).toEqual(
      ['closed', 'confirmed', 'contacted', 'incomplete', 'new']
    )
  })

  it('gives each status its own colour', () => {
    const colours = Object.values(statusStyles)
    expect(new Set(colours).size).toBe(colours.length)
  })
})

describe('StatusBadge', () => {
  it('shows the status with its colour', () => {
    render(<StatusBadge status="confirmed" />)
    const badge = screen.getByText('confirmed')
    expect(badge.className).toContain('bg-emerald-50')
  })

  it('falls back to grey for an unknown status', () => {
    render(<StatusBadge status="archived" />)
    expect(screen.getByText('archived').className).toContain('bg-slate-100')
  })
})
