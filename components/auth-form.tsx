"use client"

import { useActionState } from "react"
import { signIn, signUp } from "@/lib/actions/auth"
import { serviceArea } from "@/lib/catalog"
import { SubmitButton } from "@/components/ui/button"
import { Field, FormError, Input } from "@/components/ui/field"

export function AuthForm({ mode, next }: { mode: "signin" | "signup"; next: string }) {
  const [state, action] = useActionState(mode === "signup" ? signUp : signIn, {})
  const errors = state.fieldErrors ?? {}
  const signup = mode === "signup"

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      {signup ? (
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <Input id="name" name="name" required autoComplete="name" invalid={Boolean(errors.name)} />
        </Field>
      ) : null}
      <Field label="Mobile number" htmlFor="phone" error={errors.phone}>
        <Input
          id="phone"
          name="phone"
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel-national"
          prefix="+91"
          className="pl-12"
          invalid={Boolean(errors.phone)}
        />
      </Field>
      <Field label="Password" htmlFor="password" error={errors.password} hint={signup ? "At least 8 characters" : undefined}>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={signup ? 8 : undefined}
          autoComplete={signup ? "new-password" : "current-password"}
          invalid={Boolean(errors.password)}
        />
      </Field>
      {signup ? (
        <>
          <Field label="Flat and street" htmlFor="address" error={errors.address}>
            <Input id="address" name="address" required autoComplete="street-address" placeholder="B-204, Green Valley Apartments" invalid={Boolean(errors.address)} />
          </Field>
          <Field label="Pincode" htmlFor="pincode" error={errors.pincode}>
            <Input
              id="pincode"
              name="pincode"
              required
              inputMode="numeric"
              maxLength={6}
              autoComplete="postal-code"
              defaultValue={serviceArea.pincode}
              invalid={Boolean(errors.pincode)}
            />
          </Field>
        </>
      ) : null}
      <FormError message={state.error} />
      <SubmitButton size="lg" className="mt-2">
        {signup ? "Create account" : "Sign in"}
      </SubmitButton>
    </form>
  )
}
