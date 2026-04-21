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
  isSubtreeIncluded: boolean
  isSubtreeHighlighted: boolean
  hasChildren: boolean
  isCollapsed: boolean
  isSubtreeIncludeDisabled: boolean
  isHighlightDisabled: boolean
  isSubtreeHighlightDisabled: boolean
  onPackageIncludeChange: (checked: boolean) => void
  onSubtreeIncludeChange: (checked: boolean) => void
  onPackageHighlightChange: (checked: boolean) => void
  onSubtreeHighlightChange: (checked: boolean) => void
  onToggleCollapsedPackage: (packageName: string) => void
}

const GREYED_LEGEND_COLOR = '#475569'
const EXCLUDED_LEGEND_COLOR = '#1e293b'

export function PackageTreeNodeHeader({
  packageName,
  displayPrefix,
  isIncluded,
  isGreyed,
  isHighlighted,
  isSubtreeIncluded,
  isSubtreeHighlighted,
  hasChildren,
  isCollapsed,
  isSubtreeIncludeDisabled,
  isHighlightDisabled,
  isSubtreeHighlightDisabled,
  onPackageIncludeChange,
  onSubtreeIncludeChange,
  onPackageHighlightChange,
  onSubtreeHighlightChange,
  onToggleCollapsedPackage,
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

      {hasChildren && (
        <>
          <ToggleSwitch
            checked={isSubtreeIncluded}
            onChange={onSubtreeIncludeChange}
            ariaLabel="Toggle subtree inclusion"
            title="Toggle subtree inclusion"
            disabled={isSubtreeIncludeDisabled}
            color="visibility"
          />

          <ToggleSwitch
            checked={isSubtreeHighlighted}
            onChange={onSubtreeHighlightChange}
            ariaLabel="Toggle subtree highlight"
            title="Toggle subtree highlight"
            disabled={isSubtreeHighlightDisabled}
            color="selection"
          />

          <button
            type="button"
            onClick={() => onToggleCollapsedPackage(packageName)}
            disabled={!hasChildren}
            className={[
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[11px] transition',
              hasChildren
                ? 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-500'
                : 'border-transparent text-slate-600',
            ].join(' ')}
            aria-label={isCollapsed ? 'Expand package' : 'Collapse package'}
            title={isCollapsed ? 'Expand package' : 'Collapse package'}
          >
            {isCollapsed ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 2v8M2 6h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </>
      )}
    </div>
  )
}
