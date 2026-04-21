import {
  EDGE_RELATIONSHIP_BASE_DISTANCE_OPTIONS,
  EDGE_RELATIONSHIP_BASE_STRENGTH_OPTIONS,
  EDGE_RELATIONSHIP_MULTIPLIER_OPTIONS,
  LINK_PACKAGE_RELATIONSHIPS,
  type EdgeRelationshipConfig,
  type EdgeRelationshipSettings,
  type LinkPackageRelationship,
} from './graphRelationships'
import { MultiplierSlider } from './MultiplierSlider'
import { ToggleSwitch } from './ToggleSwitch'

type ForceGraphEdgeControlsProps = {
  edgeRelationshipConfig: EdgeRelationshipConfig
  highlightMutualPackageDependenciesOnly: boolean
  onHighlightMutualPackageDependenciesOnlyChange: (value: boolean) => void
  onEdgeRelationshipChange: (
    relationship: LinkPackageRelationship,
    updates: Partial<EdgeRelationshipSettings>,
  ) => void
}

const EDGE_RELATIONSHIP_COPY: Record<
  LinkPackageRelationship,
  { label: string; description: string }
> = {
  same_package: {
    label: 'Same package',
    description: 'Imports between modules in the exact same package.',
  },
  subpackage: {
    label: 'Subpackage',
    description: 'Imports between a package and one of its descendants.',
  },
  cross_package: {
    label: 'Cross package',
    description: 'Imports between separate package branches.',
  },
  direct_child_package: {
    label: 'Direct child package',
    description:
      'Structural edges from a package root to its immediate child package root.',
  },
  sibling_package: {
    label: 'Sibling package',
    description:
      'Structural edges between packages that share the same direct parent.',
  },
  sibling_module: {
    label: 'Sibling module',
    description:
      'Structural edges between direct peer modules in the same package.',
  },
}

function formatStrengthValue(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '')
}

function formatDistanceValue(value: number): string {
  return `${Math.round(value)}`
}

export function ForceGraphEdgeControls({
  edgeRelationshipConfig,
  highlightMutualPackageDependenciesOnly,
  onHighlightMutualPackageDependenciesOnlyChange,
  onEdgeRelationshipChange,
}: ForceGraphEdgeControlsProps) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-white">
            Mutual package dependency edges
          </div>
          <div className="text-xs text-slate-400">
            Highlight edges when package A imports package B and package B imports package A.
          </div>
        </div>

        <ToggleSwitch
          checked={highlightMutualPackageDependenciesOnly}
          onChange={onHighlightMutualPackageDependenciesOnlyChange}
          ariaLabel="Highlight mutual package dependency edges"
          title="Highlight mutual package dependency edges"
          color="selection"
        />
      </div>

      <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
        <div className="mb-3">
          <div className="text-sm font-medium text-white">Edge type display</div>
          <div className="text-xs text-slate-400">
            Include or highlight same-package, subpackage, cross-package, and structural package-tree edges.
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-6">
          {LINK_PACKAGE_RELATIONSHIPS.map((relationship) => {
            const copy = EDGE_RELATIONSHIP_COPY[relationship]
            const settings = edgeRelationshipConfig[relationship]

            return (
              <div
                key={relationship}
                className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
              >
                <div className="mb-3">
                  <div className="text-sm font-medium text-white">
                    {copy.label}
                  </div>
                  <div className="text-xs text-slate-400">
                    {copy.description}
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2">
                  <div className="text-xs text-slate-400">Included</div>
                  <ToggleSwitch
                    checked={settings.included}
                    onChange={(checked) =>
                      onEdgeRelationshipChange(relationship, { included: checked })
                    }
                    ariaLabel={`Toggle ${copy.label.toLowerCase()} edge inclusion`}
                    title={`Toggle ${copy.label.toLowerCase()} edge inclusion`}
                    color="visibility"
                  />

                  <div className="text-xs text-slate-400">Highlighted</div>
                  <ToggleSwitch
                    checked={settings.highlighted}
                    onChange={(checked) =>
                      onEdgeRelationshipChange(relationship, { highlighted: checked })
                    }
                    ariaLabel={`Toggle ${copy.label.toLowerCase()} edge highlighting`}
                    title={`Toggle ${copy.label.toLowerCase()} edge highlighting`}
                    color="selection"
                  />
                </div>

                <div className="mt-3">
                  <MultiplierSlider
                    label="Visibility"
                    value={settings.visibilityMultiplier}
                    options={EDGE_RELATIONSHIP_MULTIPLIER_OPTIONS}
                    onChange={(multiplier) =>
                      onEdgeRelationshipChange(relationship, {
                        visibilityMultiplier: multiplier,
                      })
                    }
                    ariaLabel={`${copy.label} edge visibility`}
                  />
                  <MultiplierSlider
                    label="Weight"
                    value={settings.strengthMultiplier}
                    options={EDGE_RELATIONSHIP_MULTIPLIER_OPTIONS}
                    onChange={(multiplier) =>
                      onEdgeRelationshipChange(relationship, {
                        strengthMultiplier: multiplier,
                      })
                    }
                    ariaLabel={`${copy.label} edge weight`}
                  />
                  <MultiplierSlider
                    label="Base strength"
                    value={settings.baseStrength}
                    options={EDGE_RELATIONSHIP_BASE_STRENGTH_OPTIONS}
                    onChange={(value) =>
                      onEdgeRelationshipChange(relationship, { baseStrength: value })
                    }
                    ariaLabel={`${copy.label} base edge strength`}
                    formatValue={formatStrengthValue}
                  />
                  <MultiplierSlider
                    label="Base distance"
                    value={settings.baseDistance}
                    options={EDGE_RELATIONSHIP_BASE_DISTANCE_OPTIONS}
                    onChange={(value) =>
                      onEdgeRelationshipChange(relationship, { baseDistance: value })
                    }
                    ariaLabel={`${copy.label} base edge distance`}
                    formatValue={formatDistanceValue}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
