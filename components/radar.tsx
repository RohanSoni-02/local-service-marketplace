import { Store } from "lucide-react"

const slots = [
  { angle: -38, distance: 0.8 },
  { angle: 42, distance: 0.6 },
  { angle: 152, distance: 0.72 },
  { angle: -142, distance: 0.9 },
]

/** Broadcast visual: rings pulse outward and a pin lights up for each shop that has replied. */
export function Radar({ total, responded }: { total: number; responded: number }) {
  const radius = 92
  return (
    <div className="relative mx-auto flex size-[216px] items-center justify-center" aria-hidden="true">
      {[0, 0.8, 1.6].map((delay) => (
        <span
          key={delay}
          className="absolute size-full animate-radar rounded-full border-2 border-brand/50"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
      <span className="absolute size-[38%] rounded-full border border-line-strong" />
      <span className="absolute size-[69%] rounded-full border border-line" />
      <span className="absolute size-full rounded-full border border-line" />

      <span className="relative z-10 flex size-11 items-center justify-center rounded-full bg-brand text-[11px] font-bold tracking-wide text-on-brand shadow-float">
        YOU
      </span>

      {slots.slice(0, total).map((slot, index) => {
        const rad = (slot.angle * Math.PI) / 180
        const lit = index < responded
        return (
          <span
            key={slot.angle}
            className="absolute flex size-9 items-center justify-center rounded-full border transition-[background-color,color,border-color,scale] duration-500 ease-out-quint"
            style={{
              translate: `${Math.cos(rad) * radius * slot.distance}px ${Math.sin(rad) * radius * slot.distance}px`,
              scale: lit ? 1.08 : 1,
              background: lit ? "var(--color-marigold)" : "var(--color-surface)",
              borderColor: lit ? "var(--color-marigold)" : "var(--color-line-strong)",
              color: lit ? "var(--color-marigold-ink)" : "var(--color-ink-faint)",
            }}
          >
            <Store className="size-4" />
          </span>
        )
      })}
    </div>
  )
}
