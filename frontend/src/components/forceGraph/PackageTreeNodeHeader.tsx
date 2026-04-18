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
  onPackageHighlightChange: (checked: boolean) => void
  onSubtreeHighlightChange: (checked: boolean) => void
  onHighlightOnlyPackage: () => void
  onToggleCollapsedPackage: (packageName: string) => void
}

const GREYED_LEGEND_COLOR = '#475569'

// this is the "only"" button
function getActionButtonClasses(variant: 'default' | 'muted' = 'default'): string {
  return [
    'flex h-6 shrink-0 items-center justify-center rounded-md border px-2 text-[10px] transition',
    variant === 'default'
      ? 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-500'
      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-600',
  ].join(' ')
}

function getLabelClasses(isGreyed: boolean): string {
  return isGreyed ? 'text-slate-500' : 'text-slate-300'
}

export function PackageTreeNodeHeader({
  packageName,
  displayPrefix,
  isGreyed,
  isHighlighted,
  isSubtreeHighlighted,
  hasChildren,
  isCollapsed,
  onPackageHighlightChange,
  onSubtreeHighlightChange,
  onHighlightOnlyPackage,
  onToggleCollapsedPackage,
}: PackageTreeNodeHeaderProps) {
  const displayName = trimModulePrefix(packageName, displayPrefix)

  return (
    <div className="flex flex-wrap items-center gap-2">

      <div
        role="switch"
        aria-checked={isHighlighted}
        aria-label={`Toggle highlight for ${packageName}`}
        onClick={() => onPackageHighlightChange(!isHighlighted)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onPackageHighlightChange(!isHighlighted)
          }
        }}
        tabIndex={0}
        className={[
          'flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-left text-xs transition',
          isGreyed ? 'text-slate-500' : 'text-slate-200',
          isHighlighted ? 'bg-sky-500/10' : '',
        ].join(' ')}
        title={packageName}
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

      {/* <button */}
      {/*   type="button" */}
      {/*   onClick={onHighlightOnlyPackage} */}
      {/*   className={getActionButtonClasses()} */}
      {/*   aria-label="Highlight only this package" */}
      {/*   title="Highlight only this package" */}
      {/* > */}
      {/*   only */}
      {/* </button> */}


      {hasChildren && (
        <>
          <ToggleSwitch
            checked={isSubtreeHighlighted}
            onChange={onSubtreeHighlightChange}
            ariaLabel="Toggle subtree highlight"
            title="Toggle subtree highlight"
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
            {hasChildren ? (isCollapsed ? '▸' : '▾') : '•'}
          </button>
        </>
      )}

    </div>
  )
}
