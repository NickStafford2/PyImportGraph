import { trimModulePrefix } from '../../lib/moduleName'
import { getPackageColor } from './graphColors'

type PackageTreeNodeHeaderProps = {
  packageName: string
  displayPrefix: string | null
  isGreyed: boolean
  isHighlighted: boolean
  hasChildren: boolean
  isCollapsed: boolean
  onHighlightPackage: (packageName: string) => void
  onUnhighlightPackage: (packageName: string) => void
  onHighlightPackageTree: () => void
  onUnhighlightPackageTree: () => void
  onHighlightOnlyPackage: () => void
  onToggleCollapsedPackage: (packageName: string) => void
}

const GREYED_LEGEND_COLOR = '#475569'

function getActionButtonClasses(variant: 'default' | 'muted' = 'default'): string {
  return [
    'flex h-6 shrink-0 items-center justify-center rounded-md border px-2 text-[10px] transition',
    variant === 'default'
      ? 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-500'
      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-600',
  ].join(' ')
}

export function PackageTreeNodeHeader({
  packageName,
  displayPrefix,
  isGreyed,
  isHighlighted,
  hasChildren,
  isCollapsed,
  onHighlightPackage,
  onUnhighlightPackage,
  onHighlightPackageTree,
  onUnhighlightPackageTree,
  onHighlightOnlyPackage,
  onToggleCollapsedPackage,
}: PackageTreeNodeHeaderProps) {
  const displayName = trimModulePrefix(packageName, displayPrefix)

  return (
    <div className="flex flex-wrap items-center gap-2">
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

      <button
        type="button"
        onClick={() => onHighlightPackage(packageName)}
        className={getActionButtonClasses()}
        aria-label="Highlight this package"
        title="Highlight this package"
      >
        +
      </button>

      <button
        type="button"
        onClick={() => onUnhighlightPackage(packageName)}
        className={getActionButtonClasses('muted')}
        aria-label="Unhighlight this package"
        title="Unhighlight this package"
      >
        −
      </button>

      {hasChildren && (
        <>
          <button
            type="button"
            onClick={onHighlightPackageTree}
            className={getActionButtonClasses()}
            aria-label="Highlight this package and all subpackages"
            title="Highlight this package and all subpackages"
          >
            ++
          </button>

          <button
            type="button"
            onClick={onUnhighlightPackageTree}
            className={getActionButtonClasses('muted')}
            aria-label="Unhighlight this package and all subpackages"
            title="Unhighlight this package and all subpackages"
          >
            −−
          </button>
        </>
      )}

      <button
        type="button"
        onClick={onHighlightOnlyPackage}
        className={getActionButtonClasses()}
        aria-label="Highlight only this package"
        title="Highlight only this package"
      >
        only
      </button>

      <div
        className={[
          'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left text-xs transition',
          isGreyed ? 'text-slate-500' : 'text-slate-200',
          isHighlighted ? 'bg-sky-500/10' : '',
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
        <span className="truncate font-medium" title={packageName}>
          {displayName}
        </span>
      </div>
    </div>
  )
}
