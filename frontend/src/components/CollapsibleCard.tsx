import { PropsWithChildren, useState } from 'react'

type CollapsibleCardProps = PropsWithChildren<{
  title: string
  subtitle?: string
  defaultOpen?: boolean
}>

export function CollapsibleCard({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-black/20">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-xs text-slate-400">{subtitle}</div>
          ) : null}
        </div>

        <div className="shrink-0 rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
          {isOpen ? 'Hide' : 'Show'}
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-slate-800 px-5 py-4">{children}</div>
      ) : null}
    </section>
  )
}
