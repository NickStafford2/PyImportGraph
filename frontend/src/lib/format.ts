export function joinOrNone(values: string[]): string {
  return values.length > 0 ? values.join(', ') : '(none)'
}
