import { PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS } from './graphInfluence'
import { MultiplierSlider } from './MultiplierSlider'
import type { PackageInfluenceSettings } from './types'

type PackageInfluenceControlsProps = {
  packageName: string
  settings: PackageInfluenceSettings
  onPackageInfluenceChange: (
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) => void
}

export function PackageInfluenceControls({
  packageName,
  settings,
  onPackageInfluenceChange,
}: PackageInfluenceControlsProps) {
  function handleVisibilitySliderChange(nextMultiplier: number): void {
    onPackageInfluenceChange(packageName, {
      ...settings,
      edgeVisibilityMultiplier: nextMultiplier,
    })
  }

  function handleStrengthSliderChange(nextMultiplier: number): void {
    onPackageInfluenceChange(packageName, {
      ...settings,
      edgeStrengthMultiplier: nextMultiplier,
    })
  }

  return (
    <div className="space-y-2">
      <MultiplierSlider
        label="Visibility"
        value={settings.edgeVisibilityMultiplier}
        options={PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS}
        onChange={handleVisibilitySliderChange}
        ariaLabel={`Edge visibility for ${packageName}`}
      />
      <MultiplierSlider
        label="Weight"
        value={settings.edgeStrengthMultiplier}
        options={PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS}
        onChange={handleStrengthSliderChange}
        ariaLabel={`Edge weight for ${packageName}`}
      />
    </div>
  )
}
