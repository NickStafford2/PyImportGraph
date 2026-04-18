import { trimModulePrefix } from '../lib/moduleName'

type ModuleNameProps = {
  name: string
  prefix: string | null
  className?: string
}

export function ModuleName({ name, prefix, className }: ModuleNameProps) {
  return <span className={className}>{trimModulePrefix(name, prefix)}</span>
}
