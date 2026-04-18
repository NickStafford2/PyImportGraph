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

  return (
    <div className="flex flex-row flex-nowrap items-center justify-between gap-2">
      <div className="text-[11px] uppercase text-nowrap tracking-wide text-slate-500">
        Edge influence
      </div>

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
      <div className="text-[11px] text-slate-400">
        {formatMultiplierLabel(currentMultiplier)}
      </div>
    </div>
  )
}
