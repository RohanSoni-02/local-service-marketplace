import Link from "next/link"
import { Wordmark } from "@/components/brand"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col px-5 pb-10 pt-8">
      <Link href="/" aria-label="Thikana home" className="self-start">
        <Wordmark />
      </Link>
      <div className="mt-12 animate-rise">{children}</div>
    </main>
  )
}
