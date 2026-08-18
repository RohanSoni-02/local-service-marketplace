import {
  Wrench,
  Zap,
  Hammer,
  Fan,
  Store,
  Drill,
  Paintbrush,
  WashingMachine,
  type LucideProps,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  wrench: Wrench,
  zap: Zap,
  hammer: Hammer,
  fan: Fan,
  store: Store,
  drill: Drill,
  paintbrush: Paintbrush,
  "washing-machine": WashingMachine,
}

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = iconMap[icon] ?? Store
  return <Icon className={className} aria-hidden="true" />
}
