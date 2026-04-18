import { PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS } from './graphInfluence'
import type { PackageInfluenceSettings } from './types'

type PackageInfluenceControlsProps = {
  packageName: string
  settings: PackageInfluenceSettings
  onPackageInfluenceChange: (
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) => void
  onReset: () => void
}

function formatMultiplierLabel(multiplier: number): string {
  return `${Math.round(multiplier * 100)}%`
}

export function PackageInfluenceControls({
  packageName,
  settings,
  onPackageInfluenceChange,
  onReset,
}: PackageInfluenceControlsProps) {
  return (
    <div className="mt-3 space-y-2">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">
        Edge influence
      </div>

      <div className="flex flex-wrap gap-1">
        {PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS.map((multiplier) => {
          const isActive =
            settings.edgeStrengthMultiplier === multiplier &&
            settings.edgeVisibilityMultiplier === multiplier

          return (
            <button
              key={multiplier}
              type="button"
              onClick={() =>
                onPackageInfluenceChange(packageName, {
                  edgeStrengthMultiplier: multiplier,
                  edgeVisibilityMultiplier: multiplier,
                })
              }
              className={[
                'rounded-lg border px-1 py-1 text-[10px] transition',
                isActive
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                  : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-500',
              ].join(' ')}
            >
              {formatMultiplierLabel(multiplier)}
            </button>
          )
        })}

        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
