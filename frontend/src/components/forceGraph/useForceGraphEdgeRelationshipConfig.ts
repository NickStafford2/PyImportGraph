import { useCallback, useState } from 'react'
import {
  buildDefaultEdgeRelationshipConfig,
  type EdgeRelationshipConfig,
  type EdgeRelationshipSettings,
  type LinkPackageRelationship,
} from './graphRelationships'

type UseForceGraphEdgeRelationshipConfigResult = {
  edgeRelationshipConfig: EdgeRelationshipConfig
  updateEdgeRelationship: (
    relationship: LinkPackageRelationship,
    updates: Partial<EdgeRelationshipSettings>,
  ) => void
}

export function useForceGraphEdgeRelationshipConfig(): UseForceGraphEdgeRelationshipConfigResult {
  const [edgeRelationshipConfig, setEdgeRelationshipConfig] =
    useState<EdgeRelationshipConfig>(buildDefaultEdgeRelationshipConfig)

  const updateEdgeRelationship = useCallback((
    relationship: LinkPackageRelationship,
    updates: Partial<EdgeRelationshipSettings>,
  ) => {
    setEdgeRelationshipConfig((current) => ({
      ...current,
      [relationship]: {
        ...current[relationship],
        ...updates,
      },
    }))
  }, [])

  return {
    edgeRelationshipConfig,
    updateEdgeRelationship,
  }
}
