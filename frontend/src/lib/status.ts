// Badge colours per lead status, shared by StatusBadge and the dashboard
// status dropdown.
export const statusStyles: Record<string, string> = {
  new:        'bg-brand-50 text-brand-700 ring-brand-100',
  contacted:  'bg-amber-50 text-amber-800 ring-amber-200',
  confirmed:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  closed:     'bg-slate-100 text-slate-600 ring-slate-200',
  incomplete: 'bg-coral-50 text-coral-700 ring-coral-100',
}
