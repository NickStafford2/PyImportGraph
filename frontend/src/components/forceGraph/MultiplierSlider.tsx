import type { ChangeEvent } from 'react'

type MultiplierSliderProps = {
  label: string
  value: number
  options: readonly number[]
  onChange: (nextValue: number) => void
  ariaLabel: string
  formatValue?: (value: number) => string
}

function defaultFormatValue(value: number): string {
  return `${Math.round(value * 100)}%`
}

function getClosestSliderIndex(
  value: number,
  sortedOptions: readonly number[],
): number {
  const exactIndex = sortedOptions.findIndex((option) => option === value)

  if (exactIndex >= 0) {
    return exactIndex
  }

  let closestIndex = 0
  let closestDistance = Math.abs(sortedOptions[0] - value)

  for (let index = 1; index < sortedOptions.length; index += 1) {
    const distance = Math.abs(sortedOptions[index] - value)

    if (distance < closestDistance) {
      closestDistance = distance
      closestIndex = index
    }
  }

  return closestIndex
}

export function MultiplierSlider({
  label,
  value,
  options,
  onChange,
  ariaLabel,
  formatValue = defaultFormatValue,
}: MultiplierSliderProps) {
  const sortedOptions = [...options].sort((left, right) => left - right)
  const sliderIndex = getClosestSliderIndex(value, sortedOptions)
  const currentValue = sortedOptions[sliderIndex]

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const nextIndex = Number(event.target.value)
    const nextValue = sortedOptions[nextIndex]

    if (nextValue == null) {
      return
    }

    onChange(nextValue)
  }

  return (
    <div className="flex flex-row flex-nowrap items-center justify-between gap-2">
      <div className="text-[11px] uppercase text-nowrap tracking-wide text-slate-500">
        {label}
      </div>

      <input
        type="range"
        min={0}
        max={sortedOptions.length - 1}
        step={1}
        value={sliderIndex}
        onChange={handleChange}
        className="w-full cursor-pointer accent-emerald-400"
        aria-label={ariaLabel}
      />

      <div className="text-[11px] text-slate-400">
        {formatValue(currentValue)}
      </div>
    </div>
  )
}
