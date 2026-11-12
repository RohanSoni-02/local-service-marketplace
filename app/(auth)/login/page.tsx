import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getUser, safeNextPath } from "@/lib/server/auth"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNextPath((await searchParams).next)
  if (await getUser()) redirect(next)

  return (
    <>
      <h1 className="text-[32px] font-bold leading-[1.05]">Welcome back</h1>
      <p className="mt-2 text-[15px] text-ink-soft">Sign in to book visits, rent tools and chat with shops.</p>
      <AuthForm mode="signin" next={next} />
      <p className="mt-6 text-center text-sm text-ink-soft">
        New to Thikana?{" "}
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-deep underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  )
}
