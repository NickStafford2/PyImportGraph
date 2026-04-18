export function toAnchorId(
  kind: 'module' | 'package',
  name: string,
): string {
  return `${kind}-${name.replaceAll('.', '-')}`
}
