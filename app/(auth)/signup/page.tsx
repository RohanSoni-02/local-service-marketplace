import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getUser, safeNextPath } from "@/lib/server/auth"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = { title: "Create account" }

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNextPath((await searchParams).next)
  if (await getUser()) redirect(next)

  return (
    <>
      <h1 className="text-[32px] font-bold leading-[1.05]">Create your account</h1>
      <p className="mt-2 text-[15px] text-ink-soft">Shops use these details to reach you and find your door.</p>
      <AuthForm mode="signup" next={next} />
      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-deep underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
