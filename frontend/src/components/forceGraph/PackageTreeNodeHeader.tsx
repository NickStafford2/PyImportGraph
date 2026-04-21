// frontend/src/components/forceGraph/PackageTreeNodeHeader.tsx

import { trimModulePrefix } from '../../lib/moduleName'
import { getPackageColor } from './graphColors'
import { ToggleSwitch } from './ToggleSwitch'

type PackageTreeNodeHeaderProps = {
  packageName: string
  displayPrefix: string | null
  isIncluded: boolean
  isGreyed: boolean
  isHighlighted: boolean
  isHighlightDisabled: boolean
  onPackageIncludeChange: (checked: boolean) => void
  onPackageHighlightChange: (checked: boolean) => void
}

const GREYED_LEGEND_COLOR = '#475569'
const EXCLUDED_LEGEND_COLOR = '#1e293b'

export function PackageTreeNodeHeader({
  packageName,
  displayPrefix,
  isIncluded,
  isGreyed,
  isHighlighted,
  isHighlightDisabled,
  onPackageIncludeChange,
  onPackageHighlightChange,
}: PackageTreeNodeHeaderProps) {
  const displayName = trimModulePrefix(packageName, displayPrefix)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className={[
          'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left text-xs transition',
          isIncluded
            ? isGreyed
              ? 'text-slate-500'
              : 'text-slate-200'
            : 'text-slate-500 opacity-60',
          isHighlighted ? 'bg-sky-500/10' : '',
        ].join(' ')}
      >
        <span
          className="h-3 w-3 shrink-0 rounded-full transition"
          style={{
            backgroundColor: isHighlighted
              ? getPackageColor(packageName)
              : isIncluded
                ? GREYED_LEGEND_COLOR
                : EXCLUDED_LEGEND_COLOR,
          }}
        />
        <span className="truncate font-medium" title={packageName}>
          {displayName}
        </span>
      </div>

      <ToggleSwitch
        checked={isHighlighted}
        onChange={onPackageHighlightChange}
        ariaLabel={`Toggle highlight for ${packageName}`}
        title={
          isHighlightDisabled
            ? isIncluded
              ? `${packageName} is not imported outside its own package`
              : `${packageName} is not included in the graph`
            : `Toggle highlight for ${packageName}`
        }
        disabled={isHighlightDisabled}
        color="selection"
      />

      <ToggleSwitch
        checked={isIncluded}
        onChange={onPackageIncludeChange}
        ariaLabel={`Toggle inclusion for ${packageName}`}
        title={`Toggle inclusion for ${packageName}`}
        color="visibility"
      />
    </div>
  )
}
