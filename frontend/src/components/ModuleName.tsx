import { useEffect, useRef, useState } from 'react'
import { trimModulePrefix } from '../lib/moduleName'

// todo. find out why the tooltip does not work. I have no idea. 

type ModuleNameProps = {
  name: string
  prefix: string | null
  className?: string
}

type TooltipPosition = {
  x: number
  y: number
}

export function ModuleName({ name, prefix, className }: ModuleNameProps) {
  const display = trimModulePrefix(name, prefix)

  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<TooltipPosition | null>(null)

  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!hovering) {
      setVisible(false)
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    timeoutRef.current = window.setTimeout(() => {
      setVisible(true)
    }, 500)

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [hovering])

  function handleMouseEnter(event: React.MouseEvent<HTMLSpanElement>) {
    setHovering(true)
    setPosition({
      x: event.clientX,
      y: event.clientY,
    })
  }

  function handleMouseMove(event: React.MouseEvent<HTMLSpanElement>) {
    setPosition({
      x: event.clientX,
      y: event.clientY,
    })
  }

  function handleMouseLeave() {
    setHovering(false)
    setVisible(false)
  }

  return (
    <>
      <span
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {display}
      </span>

      {visible && display !== name && position != null ? (
        <div
          className="pointer-events-none fixed z-[9999] rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 shadow-xl"
          style={{
            left: position.x + 12,
            top: position.y - 8,
          }}
        >
          {name}
        </div>
      ) : null}
    </>
  )
}
