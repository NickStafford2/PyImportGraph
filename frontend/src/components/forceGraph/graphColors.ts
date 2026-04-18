const PACKAGE_COLORS = [
  '#60a5fa', // blue
  '#34d399', // emerald
  '#f59e0b', // amber
  '#f472b6', // pink
  '#a78bfa', // violet
  '#f87171', // red
  '#22d3ee', // cyan
  '#84cc16', // lime
  '#fb7185', // rose
  '#c084fc', // purple
  '#2dd4bf', // teal
  '#fbbf24', // yellow
] as const

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

export function getPackageColor(packageName: string): string {
  return PACKAGE_COLORS[hashString(packageName) % PACKAGE_COLORS.length]
}
