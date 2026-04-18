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

const SLIDER_OPTIONS = [...PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS].sort(
  (left, right) => left - right,
)

function formatMultiplierLabel(multiplier: number): string {
  return `${Math.round(multiplier * 100)}%`
}

function getSliderIndexForSettings(
  settings: PackageInfluenceSettings,
): number {
  const currentMultiplier = settings.edgeStrengthMultiplier

  const exactIndex = SLIDER_OPTIONS.findIndex(
    (multiplier) => multiplier === currentMultiplier,
  )

  if (exactIndex >= 0) {
    return exactIndex
  }

  let closestIndex = 0
  let closestDistance = Math.abs(SLIDER_OPTIONS[0] - currentMultiplier)

  for (let index = 1; index < SLIDER_OPTIONS.length; index += 1) {
    const distance = Math.abs(SLIDER_OPTIONS[index] - currentMultiplier)

    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = index
    }
  }

  return closestIndex
}

export function PackageInfluenceControls({
  packageName,
  settings,
  onPackageInfluenceChange,
  onReset,
}: PackageInfluenceControlsProps) {
  const sliderIndex = getSliderIndexForSettings(settings)
  const currentMultiplier = SLIDER_OPTIONS[sliderIndex]

  function handleSliderChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextIndex = Number(event.target.value)
    const nextMultiplier = SLIDER_OPTIONS[nextIndex]

    if (nextMultiplier == null) {
      return
    }

    onPackageInfluenceChange(packageName, {
      edgeStrengthMultiplier: nextMultiplier,
      edgeVisibilityMultiplier: nextMultiplier,
    })
  }

  const isDefault =
    settings.edgeStrengthMultiplier === 1 &&
    settings.edgeVisibilityMultiplier === 1

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">
          Edge influence
        </div>
        <div className="text-[11px] text-slate-400">
          {formatMultiplierLabel(currentMultiplier)}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3">
        <input
          type="range"
          min={0}
          max={SLIDER_OPTIONS.length - 1}
          step={1}
          value={sliderIndex}
          onChange={handleSliderChange}
          className="w-full cursor-pointer accent-emerald-400"
          aria-label={`Edge influence for ${packageName}`}
        />

        <div className="mt-2 grid grid-cols-4 text-[10px] text-slate-400">
          {SLIDER_OPTIONS.map((multiplier, index) => {
            const isActive = index === sliderIndex

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
                  'rounded px-1 py-1 text-center transition',
                  isActive
                    ? 'text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200',
                ].join(' ')}
                aria-label={`Set edge influence to ${formatMultiplierLabel(multiplier)}`}
              >
                {formatMultiplierLabel(multiplier)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onReset}
          disabled={isDefault}
          className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
