import { trimModulePrefix } from '../../lib/moduleName'
import { getPackageColor } from './graphColors'

type PackageTreeNodeHeaderProps = {
  packageName: string
  displayPrefix: string | null
  isGreyed: boolean
  onPackageSelect: (packageName: string) => void
}

const GREYED_LEGEND_COLOR = '#475569'

export function PackageTreeNodeHeader({
  packageName,
  displayPrefix,
  isGreyed,
  onPackageSelect,
}: PackageTreeNodeHeaderProps) {
  const displayName = trimModulePrefix(packageName, displayPrefix)

  return (
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
      <span className="truncate font-medium" title={packageName}>
        {displayName}
      </span>
    </button>
  )
}
