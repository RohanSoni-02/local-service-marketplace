import { Drill, Fan, Hammer, Paintbrush, Store, WashingMachine, Wrench, Zap, type LucideProps } from "lucide-react"
import { getCategory } from "@/lib/catalog"

const icons: Record<string, React.ComponentType<LucideProps>> = {
  wrench: Wrench,
  zap: Zap,
  hammer: Hammer,
  fan: Fan,
  store: Store,
  drill: Drill,
  paintbrush: Paintbrush,
  "washing-machine": WashingMachine,
}

export function CategoryIcon({ categoryId, ...props }: { categoryId: string } & LucideProps) {
  const Icon = icons[getCategory(categoryId)?.icon ?? "store"] ?? Store
  return <Icon aria-hidden="true" strokeWidth={1.8} {...props} />
}
