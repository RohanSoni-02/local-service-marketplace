import { BottomNav } from "@/components/bottom-nav"

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="pb-[calc(env(safe-area-inset-bottom)+5.5rem)]">{children}</main>
      <BottomNav />
    </>
  )
}
