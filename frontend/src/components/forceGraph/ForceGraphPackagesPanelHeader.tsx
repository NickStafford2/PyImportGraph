import { ToggleSwitch } from './ToggleSwitch'

type ForceGraphPackagesPanelHeaderProps = {
  includedCount: number
  highlightedCount: number
  totalCount: number
  externallyImportedCount: number
  showOnlyExternallyImportedIncludedPackages: boolean
  showOnlyExternallyImportedPackages: boolean
  onShowOnlyExternallyImportedIncludedPackagesChange: (value: boolean) => void
  onShowOnlyExternallyImportedPackagesChange: (value: boolean) => void
  onIncludeAllPackages: () => void
  onExcludeAllPackages: () => void
  onHighlightAllPackages: () => void
  onUnhighlightAllPackages: () => void
  onExpandAllPackages: () => void
  onCollapseAllPackages: () => void
}

export function ForceGraphPackagesPanelHeader({
  includedCount,
  highlightedCount,
  totalCount,
  externallyImportedCount,
  showOnlyExternallyImportedIncludedPackages,
  showOnlyExternallyImportedPackages,
  onShowOnlyExternallyImportedIncludedPackagesChange,
  onShowOnlyExternallyImportedPackagesChange,
  onIncludeAllPackages,
  onExcludeAllPackages,
  onHighlightAllPackages,
  onUnhighlightAllPackages,
  onExpandAllPackages,
  onCollapseAllPackages,
}: ForceGraphPackagesPanelHeaderProps) {
  return (
    <div className="border-b border-slate-800 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex w-full flex-row justify-between">
          <h3 className="text-md font-semibold text-white">Packages</h3>
          <span className="mt-1 text-xs text-slate-400">
            {includedCount} of {totalCount} included, {highlightedCount} highlighted
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-2">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
            Only externally imported
          </div>
          <div className="text-[11px] text-slate-500">
            Limits controls to {externallyImportedCount} package
            {externallyImportedCount === 1 ? '' : 's'}
          </div>
        </div>

        <div className="grid grid-cols-[auto_auto] items-center gap-x-3 gap-y-2">
          <div className="text-[11px] text-slate-400">Included</div>
          <ToggleSwitch
            checked={showOnlyExternallyImportedIncludedPackages}
            onChange={onShowOnlyExternallyImportedIncludedPackagesChange}
            ariaLabel="Only include packages imported outside their own package"
            title="Only include packages imported outside their own package"
            color="visibility"
          />

          {!showOnlyExternallyImportedIncludedPackages && (
            <>
              <div className="text-[11px] text-slate-400">Highlighted</div>
              <ToggleSwitch
                checked={showOnlyExternallyImportedPackages}
                onChange={onShowOnlyExternallyImportedPackagesChange}
                ariaLabel="Only highlight packages imported outside their own package"
                title="Only highlight packages imported outside their own package"
                color="selection"
              />
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onIncludeAllPackages}
          disabled={includedCount === totalCount}
          className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Include all
        </button>
        <button
          type="button"
          onClick={onExcludeAllPackages}
          disabled={includedCount === 0}
          className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Exclude all
        </button>
        <button
          type="button"
          onClick={onHighlightAllPackages}
          disabled={includedCount === 0 || highlightedCount === includedCount}
          className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Highlight all
        </button>
        <button
          type="button"
          onClick={onUnhighlightAllPackages}
          disabled={highlightedCount === 0}
          className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Unhighlight all
        </button>
        <button
          type="button"
          onClick={onExpandAllPackages}
          className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500"
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={onCollapseAllPackages}
          className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-300 transition hover:border-slate-500"
        >
          Collapse all
        </button>
      </div>
    </div>
  )
}
