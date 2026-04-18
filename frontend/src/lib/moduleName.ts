export function findCommonModulePrefix(values: string[]): string | null {
  if (values.length === 0) {
    return null
  }

  const segmented = values
    .filter((value) => value.length > 0)
    .map((value) => value.split('.'))

  if (segmented.length === 0) {
    return null
  }

  const first = segmented[0]
  const prefixParts: string[] = []

  for (let index = 0; index < first.length; index += 1) {
    const candidate = first[index]
    const allMatch = segmented.every((parts) => parts[index] === candidate)

    if (!allMatch) {
      break
    }

    prefixParts.push(candidate)
  }

  if (prefixParts.length === 0) {
    return null
  }

  return prefixParts.join('.')
}

export function trimModulePrefix(
  value: string,
  prefix: string | null,
): string {
  if (!prefix) {
    return value
  }

  if (value === prefix) {
    return value
  }

  const dottedPrefix = `${prefix}.`
  if (value.startsWith(dottedPrefix)) {
    return value.slice(dottedPrefix.length)
  }

  return value
}
