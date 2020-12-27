export function bump(version: string): string {
  const elements = version.split('.')
  elements[elements.length - 1] = String(
    Number(elements[elements.length - 1]) + 1
  )
  return elements.join('.')
}
