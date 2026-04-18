import { trimModulePrefix } from '../../lib/moduleName'
import { getPackageColor } from './graphColors'

type PackageTreeNodeHeaderProps = {
  packageName: string
  displayPrefix: string | null
  isGreyed: boolean
  isHighlighted: boolean
  hasChildren: boolean
  isCollapsed: boolean
  onTogglePackageHighlight: (packageName: string) => void
  onTogglePackageTreeHighlight: () => void
  onSelectOnlyPackageHighlight: () => void
  onToggleCollapsedPackage: (packageName: string) => void
}

const GREYED_LEGEND_COLOR = '#475569'

export function PackageTreeNodeHeader({
  packageName,
  displayPrefix,
  isGreyed,
  isHighlighted,
  hasChildren,
  isCollapsed,
  onTogglePackageHighlight,
  onTogglePackageTreeHighlight,
  onSelectOnlyPackageHighlight,
  onToggleCollapsedPackage,
}: PackageTreeNodeHeaderProps) {
  const displayName = trimModulePrefix(packageName, displayPrefix)

  return (
    <div className="flex items-center gap-2">
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
      >
        {hasChildren ? (isCollapsed ? '▸' : '▾') : '•'}
      </button>

      {hasChildren && (
        <button
          type="button"
          onClick={onTogglePackageTreeHighlight}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950/70 text-[11px] text-slate-300 transition hover:border-slate-500"
          aria-label="Toggle package subtree highlight"
          title="Toggle this package and all subpackages"
        >
          ⊞
        </button>
      )}

      <button
        type="button"
        onClick={onSelectOnlyPackageHighlight}
        className="flex h-6 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950/70 px-2 text-[10px] text-slate-300 transition hover:border-slate-500"
        aria-label="Select only this package"
        title="Select only this package"
      >
        only
      </button>

      <button
        type="button"
        onClick={() => onTogglePackageHighlight(packageName)}
        className={[
          'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left text-xs transition',
          isGreyed ? 'text-slate-500' : 'text-slate-200',
          isHighlighted ? 'bg-sky-500/10' : 'hover:bg-slate-800/70',
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
      </button>
    </div>
  )
}
