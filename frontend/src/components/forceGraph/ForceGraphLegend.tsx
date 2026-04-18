import { trimModulePrefix } from '../../lib/moduleName'
import { getPackageColor } from './graphColors'
import {
  DEFAULT_PACKAGE_INFLUENCE_SETTINGS,
  PACKAGE_INFLUENCE_MULTIPLIER_OPTIONS,
  getPackageInfluenceSettings,
} from './graphInfluence'
import type {
  PackageInfluenceConfig,
  PackageInfluenceSettings,
} from './types'

type ForceGraphLegendProps = {
  packageNames: string[]
  displayPrefix: string | null
  selectedPackage: string | null
  onPackageSelect: (packageName: string) => void
  packageInfluenceConfig: PackageInfluenceConfig
  onPackageInfluenceChange: (
    packageName: string,
    nextSettings: PackageInfluenceSettings,
  ) => void
}

const GREYED_LEGEND_COLOR = '#475569'

function formatMultiplierLabel(multiplier: number): string {
  return `${Math.round(multiplier * 100)}%`
}

export function ForceGraphLegend({
  packageNames,
  selectedPackage,
  onPackageSelect,
  displayPrefix,
  packageInfluenceConfig,
  onPackageInfluenceChange,
}: ForceGraphLegendProps) {
  const sortedPackages = [...packageNames].sort((left, right) =>
    left.localeCompare(right),
  )

  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold text-white">Packages</h3>
      <div className="mt-4 border-t border-slate-800 pt-4">
        <div className="flex flex-col gap-2 max-h-[900px] overflow-y-auto ">
          {sortedPackages.map((packageName) => {
            const isSelected = selectedPackage === packageName
            const isGreyed =
              selectedPackage != null && selectedPackage !== packageName
            const displayName = trimModulePrefix(packageName, displayPrefix)
            const settings = getPackageInfluenceSettings(
              packageName,
              packageInfluenceConfig,
            )

            return (
              <div
                key={packageName}
                className={[
                  'rounded-xl border px-3 py-3 transition',
                  isSelected
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-800 bg-slate-950/60',
                ].join(' ')}
              >
                <button
                  type="button"
                  onClick={() => onPackageSelect(packageName)}
                  className={[
                    'flex w-full items-center gap-2 text-left text-xs',
                    isGreyed ? 'text-slate-500' : 'text-slate-200',
                  ].join(' ')}
                  title={packageName}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor: isGreyed
                        ? GREYED_LEGEND_COLOR
                        : getPackageColor(packageName),
                    }}
                  />
                  <span className="truncate" title={packageName}>
                    {displayName}
                  </span>
                </button>

                <div className="mt-3 space-y-2">
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    Edge influence
                  </div>

                  <div className="flex flex-wrap gap-2">
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
                            'rounded-lg border px-2 py-1 text-[11px] transition',
                            isActive
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                              : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500',
                          ].join(' ')}
                        >
                          {formatMultiplierLabel(multiplier)}
                        </button>
                      )
                    })}

                    <button
                      type="button"
                      onClick={() =>
                        onPackageInfluenceChange(
                          packageName,
                          DEFAULT_PACKAGE_INFLUENCE_SETTINGS,
                        )
                      }
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
