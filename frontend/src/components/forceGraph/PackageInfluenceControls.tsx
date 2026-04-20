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
  function handleSliderChange(nextMultiplier: number): void {
    onPackageInfluenceChange(packageName, {
      edgeStrengthMultiplier: nextMultiplier,
      edgeVisibilityMultiplier: nextMultiplier,
    })
  }

  return (
    <MultiplierSlider
      label="Edge influence"
      value={settings.edgeStrengthMultiplier}
      options={PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS}
      onChange={handleSliderChange}
      ariaLabel={`Edge influence for ${packageName}`}
    />
  )
}
