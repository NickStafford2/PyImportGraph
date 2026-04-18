declare module 'd3-force-3d' {
  export function forceCollide<T = any>(
    radius?: number | ((node: T) => number)
  ): any

  export function forceManyBody(): any
  export function forceLink(): any
  export function forceCenter(): any
}
