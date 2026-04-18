export function trimProjectPrefix(
  value: string,
  projectPrefix: string,
): string {
  if (value === projectPrefix) {
    return value
  }

  const prefix = `${projectPrefix}.`
  if (value.startsWith(prefix)) {
    return value.slice(prefix.length)
  }

  return value
}
