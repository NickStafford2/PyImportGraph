// frontend/src/components/forceGraph/PackageTreeNodeHeader.tsx

import { trimModulePrefix } from '../../lib/moduleName'
import { getPackageColor } from './graphColors'
import { ToggleSwitch } from './ToggleSwitch'

type PackageTreeNodeHeaderProps = {
  packageName: string
  displayPrefix: string | null
  isGreyed: boolean
  isHighlighted: boolean
  isSubtreeHighlighted: boolean
  hasChildren: boolean
  isCollapsed: boolean
  isHighlightDisabled: boolean
  isSubtreeHighlightDisabled: boolean
  onPackageHighlightChange: (checked: boolean) => void
  onSubtreeHighlightChange: (checked: boolean) => void
  onHighlightOnlyPackage: () => void
  onToggleCollapsedPackage: (packageName: string) => void
}

const GREYED_LEGEND_COLOR = '#475569'

export function PackageTreeNodeHeader({
  packageName,
  displayPrefix,
  isGreyed,
  isHighlighted,
  isSubtreeHighlighted,
  hasChildren,
  isCollapsed,
  isHighlightDisabled,
  isSubtreeHighlightDisabled,
  onPackageHighlightChange,
  onSubtreeHighlightChange,
  onToggleCollapsedPackage,
}: PackageTreeNodeHeaderProps) {
  const displayName = trimModulePrefix(packageName, displayPrefix)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="switch"
        aria-checked={isHighlighted}
        aria-disabled={isHighlightDisabled}
        aria-label={`Toggle highlight for ${packageName}`}
        onClick={() => {
          if (isHighlightDisabled) {
            return
          }

          onPackageHighlightChange(!isHighlighted)
        }}
        onKeyDown={(event) => {
          if (isHighlightDisabled) {
            return
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onPackageHighlightChange(!isHighlighted)
          }
        }}
        tabIndex={isHighlightDisabled ? -1 : 0}
        className={[
          'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left text-xs transition',
          isHighlightDisabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer',
          isGreyed ? 'text-slate-500' : 'text-slate-200',
          isHighlighted ? 'bg-sky-500/10' : '',
        ].join(' ')}
        title={
          isHighlightDisabled
            ? `${packageName} is not imported outside its own package`
            : packageName
        }
      >
        <span
          className="h-3 w-3 shrink-0 rounded-full transition"
          style={{
            backgroundColor: isHighlighted
              ? getPackageColor(packageName)
              : GREYED_LEGEND_COLOR,
          }}
        />
        <span className="truncate font-medium" title={packageName}>
          {displayName}
        </span>
      </div>

      {hasChildren && (
        <>
          <ToggleSwitch
            checked={isSubtreeHighlighted}
            onChange={onSubtreeHighlightChange}
            ariaLabel="Toggle subtree highlight"
            title="Toggle subtree highlight"
            disabled={isSubtreeHighlightDisabled}
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
