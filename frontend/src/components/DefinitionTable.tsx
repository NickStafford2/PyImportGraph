import { useMemo, useState } from 'react'
import type { DefinitionSnapshot } from '../types'
import { ModuleName } from './ModuleName'

type DefinitionTableProps = {
  title: string
  definitions: DefinitionSnapshot[]
  displayPrefix: string | null
}

type SortKey = 'symbol_name' | 'module_name' | 'kind' | 'line'
type SortDirection = 'asc' | 'desc'

export function DefinitionTable({
  title,
  definitions,
  displayPrefix,
}: DefinitionTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('symbol_name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedDefinitions = useMemo(() => {
    const sorted = [...definitions]

    sorted.sort((left, right) => {
      switch (sortKey) {
        case 'line': {
          const result = left.line - right.line
          return sortDirection === 'asc' ? result : -result
        }

        case 'symbol_name': {
          const result = left.symbol_name.localeCompare(right.symbol_name)
          return sortDirection === 'asc' ? result : -result
        }

        case 'module_name': {
          const result = left.module_name.localeCompare(right.module_name)
          return sortDirection === 'asc' ? result : -result
        }

        case 'kind': {
          const result = left.kind.localeCompare(right.kind)
          return sortDirection === 'asc' ? result : -result
        }

        default:
          return 0
      }
    })

    return sorted
  }, [definitions, sortDirection, sortKey])

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection((currentDirection) =>
        currentDirection === 'asc' ? 'desc' : 'asc',
      )
      return
    }

    setSortKey(nextSortKey)
    setSortDirection('asc')
  }

  function renderSortIndicator(columnKey: SortKey) {
    if (sortKey !== columnKey) {
      return <span className="ml-1 text-slate-600">↕</span>
    }

    return (
      <span className="ml-1 text-slate-300">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  function headerButtonClassName(isActive: boolean) {
    return [
      'inline-flex items-center rounded-md px-1 py-1 transition-colors',
      isActive
        ? 'text-slate-200 hover:text-white'
        : 'text-slate-400 hover:text-slate-200',
    ].join(' ')
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>

      {definitions.length === 0 ? (
        <div className="text-sm text-slate-500">(none)</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="border-separate text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">
                  <button
                    type="button"
                    className={headerButtonClassName(sortKey === 'symbol_name')}
                    onClick={() => handleSort('symbol_name')}
                    aria-sort={
                      sortKey === 'symbol_name'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <span>Symbol Name</span>
                    {renderSortIndicator('symbol_name')}
                  </button>
                </th>

                <th className="px-3 py-2 font-medium">
                  <button
                    type="button"
                    className={headerButtonClassName(sortKey === 'module_name')}
                    onClick={() => handleSort('module_name')}
                    aria-sort={
                      sortKey === 'module_name'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <span>Defined in Module</span>
                    {renderSortIndicator('module_name')}
                  </button>
                </th>

                <th className="px-3 py-2 font-medium">
                  <button
                    type="button"
                    className={headerButtonClassName(sortKey === 'kind')}
                    onClick={() => handleSort('kind')}
                    aria-sort={
                      sortKey === 'kind'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <span>Kind</span>
                    {renderSortIndicator('kind')}
                  </button>
                </th>

                <th className="px-3 py-2 font-medium">
                  <button
                    type="button"
                    className={headerButtonClassName(sortKey === 'line')}
                    onClick={() => handleSort('line')}
                    aria-sort={
                      sortKey === 'line'
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <span>Line #</span>
                    {renderSortIndicator('line')}
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedDefinitions.map((definition) => (
                <tr
                  key={`${definition.module_name}-${definition.symbol_name}-${definition.line}`}
                >
                  <td className="border border-slate-800 bg-slate-900/70 px-3 py-1 text-slate-200">
                    {definition.symbol_name}
                  </td>

                  <td className="border-y border-slate-800 bg-slate-900/70 px-3 py-1 text-slate-300">
                    <ModuleName
                      name={definition.module_name}
                      prefix={displayPrefix}
                    />
                  </td>

                  <td className="border-y border-slate-800 bg-slate-900/70 px-3 py-1 text-slate-300">
                    {definition.kind}
                  </td>

                  <td className="border border-slate-800 bg-slate-900/70 px-3 py-1 text-slate-300">
                    {definition.line}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
