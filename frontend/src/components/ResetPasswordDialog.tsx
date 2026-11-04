import { type FormEvent, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import api from '../lib/api'
import { MIN_PASSWORD_LENGTH, type StaffMember, displayName, errorDetail, validatePasswordReset } from '../lib/staff'
import { useFocusTrap } from '../lib/useFocusTrap'
import { Alert, Button, Field, Input } from './ui'

// Admin only: set a new temporary password for someone else
// (POST /users/{id}/password). Their open sessions end at once.
export default function ResetPasswordDialog({ member, onClose, onReset }: {
  member: StaffMember
  onClose: () => void
  onReset: (member: StaffMember) => void
}) {
  const dialogRef = useFocusTrap<HTMLFormElement>()
  const [password, setPassword]         = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError]               = useState('')
  const [saving, setSaving]             = useState(false)
  const name = displayName(member)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, saving])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const problem = validatePasswordReset(password, confirmation)
    if (problem) {
      setError(problem)
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.post(`/users/${member.id}/password`, { new_password: password })
      onReset(member)
    } catch (err) {
      setError(errorDetail(err, 'Could not reset the password'))
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto p-4">
      <div className="fixed inset-0 bg-sea-900/40" onClick={saving ? undefined : onClose} aria-hidden="true" />

      <form
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-password-title"
        onSubmit={handleSubmit}
        className="relative bg-white rounded-lg border border-sea-100 p-6 w-full max-w-md my-8"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 id="reset-password-title" className="text-lg font-semibold text-ink">
              Reset password for {name}
            </h2>
            <p className="text-sm text-muted mt-1">
              {name} is logged out everywhere and logs in with this temporary password.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="p-1.5 rounded text-muted hover:bg-sea-50 hover:text-ink disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Field label="New temporary password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
            {id => (
              <Input
                id={id}
                data-autofocus
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            )}
          </Field>
          <Field label="Confirm new password">
            {id => (
              <Input
                id={id}
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={e => setConfirmation(e.target.value)}
              />
            )}
          </Field>

          {error && <Alert>{error}</Alert>}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" disabled={saving} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Resetting...' : 'Reset password'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
