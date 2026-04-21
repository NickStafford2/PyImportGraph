import { ToggleSwitch } from './ToggleSwitch'

type PackageTreeNodeFooterProps = {
  packageName: string
  isSubtreeIncluded: boolean
  isSubtreeHighlighted: boolean
  isCollapsed: boolean
  isSubtreeIncludeDisabled: boolean
  isSubtreeHighlightDisabled: boolean
  onSubtreeIncludeChange: (checked: boolean) => void
  onSubtreeHighlightChange: (checked: boolean) => void
  onToggleCollapsedPackage: (packageName: string) => void
}

export function PackageTreeNodeFooter({
  packageName,
  isSubtreeIncluded,
  isSubtreeHighlighted,
  isCollapsed,
  isSubtreeIncludeDisabled,
  isSubtreeHighlightDisabled,
  onSubtreeIncludeChange,
  onSubtreeHighlightChange,
  onToggleCollapsedPackage,
}: PackageTreeNodeFooterProps) {
  return (
    <div className="mt-2 flex items-center justify-end gap-2 border-t border-slate-800 pt-2">

      <button
        type="button"
        onClick={() => onToggleCollapsedPackage(packageName)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-950/70 text-[11px] text-slate-300 transition hover:border-slate-500"
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

      <span className="mr-auto text-[11px] uppercase tracking-wide text-slate-500">
        Subpackages
      </span>

      <ToggleSwitch
        checked={isSubtreeHighlighted}
        onChange={onSubtreeHighlightChange}
        ariaLabel={`Toggle subtree highlight for ${packageName}`}
        title={`Toggle subtree highlight for ${packageName}`}
        disabled={isSubtreeHighlightDisabled}
        color="selection"
      />

      <ToggleSwitch
        checked={isSubtreeIncluded}
        onChange={onSubtreeIncludeChange}
        ariaLabel={`Toggle subtree inclusion for ${packageName}`}
        title={`Toggle subtree inclusion for ${packageName}`}
        disabled={isSubtreeIncludeDisabled}
        color="visibility"
      />

    </div>
  )
}
