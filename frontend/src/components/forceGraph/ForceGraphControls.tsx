import { FORCE_PRESET_OPTIONS } from './presets'
import type { ForcePresetKey } from './types'

type ForceGraphControlsProps = {
  value: ForcePresetKey
  onChange: (value: ForcePresetKey) => void
}

export function ForceGraphControls({
  value,
  onChange,
}: ForceGraphControlsProps) {
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {FORCE_PRESET_OPTIONS.map((preset) => {
        const isActive = preset.key === value

        return (
          <button
            key={preset.key}
            type="button"
            onClick={() => onChange(preset.key)}
            className={[
              'rounded-2xl border p-4 text-left transition',
              isActive
                ? 'border-sky-500 bg-sky-500/10'
                : 'border-slate-800 bg-slate-900/70 hover:border-slate-700',
            ].join(' ')}
          >
            <div className="text-sm font-semibold text-white">{preset.label}</div>
            <div className="mt-2 text-xs leading-5 text-slate-400">
              {preset.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}
