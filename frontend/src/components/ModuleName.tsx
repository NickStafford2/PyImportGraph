import { trimProjectPrefix } from '../lib/moduleName'

type ModuleNameProps = {
  name: string
  projectPrefix?: string
  className?: string
}

export function ModuleName({
  name,
  projectPrefix = 'pyimportgraph',
  className,
}: ModuleNameProps) {
  return (
    <span className={className}>
      {trimProjectPrefix(name, projectPrefix)}
    </span>
  )
}
