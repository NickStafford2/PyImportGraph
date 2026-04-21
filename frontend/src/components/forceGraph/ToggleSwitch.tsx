type ToggleSwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  ariaLabel: string
  title?: string
  disabled?: boolean
  color?: 'selection' | 'visibility'
}

export function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
  title,
  disabled = false,
  color = 'selection',
}: ToggleSwitchProps) {
  const checkedClasses =
    color === 'visibility'
      ? 'border-emerald-500 bg-emerald-500/20'
      : 'border-sky-500 bg-sky-500/20'
  const thumbCheckedClasses =
    color === 'visibility' ? 'translate-x-4 bg-emerald-400' : 'translate-x-4 bg-sky-400'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition',
        'focus:outline-none focus:ring-2 focus:ring-sky-500/50',
        disabled
          ? 'cursor-not-allowed border-slate-800 bg-slate-900/50 opacity-50'
          : checked
            ? checkedClasses
            : 'border-slate-700 bg-slate-950/80 hover:border-slate-500',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-3.5 w-3.5 rounded-full transition-transform',
          checked ? thumbCheckedClasses : 'translate-x-1 bg-slate-400',
        ].join(' ')}
      />
    </button>
  )
}
