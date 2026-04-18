import { useEffect, useState } from 'react'
import type { ProjectSnapshot } from '../types'

type UseSnapshotResult = {
  snapshot: ProjectSnapshot | null
  error: string | null
  loading: boolean
}

export function useSnapshot(): UseSnapshotResult {
  const [snapshot, setSnapshot] = useState<ProjectSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadSnapshot(): Promise<void> {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/snapshot')
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = (await response.json()) as ProjectSnapshot
        if (!cancelled) {
          setSnapshot(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadSnapshot()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    snapshot,
    error,
    loading,
  }
}
