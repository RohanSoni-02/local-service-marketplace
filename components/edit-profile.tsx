"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"
import { updateProfile } from "@/lib/actions/auth"
import type { FormState } from "@/lib/actions/types"
import { Button, SubmitButton } from "@/components/ui/button"
import { Field, FormError, Input } from "@/components/ui/field"
import { Sheet } from "@/components/ui/sheet"

export function EditProfile({ user }: { user: { name: string; address: string; pincode: string } }) {
  const [open, setOpen] = useState(false)
  const [state, action] = useActionState(async (previous: FormState, formData: FormData) => {
    const next = await updateProfile(previous, formData)
    if (next.ok) {
      setOpen(false)
      toast.success("Profile updated")
    }
    return next
  }, {})
  const errors = state.fieldErrors ?? {}

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Sheet open={open} onOpenChange={setOpen} title="Edit profile">
        <form action={action} className="flex flex-col gap-4">
          <Field label="Full name" htmlFor="profile-name" error={errors.name}>
            <Input id="profile-name" name="name" required autoComplete="name" defaultValue={user.name} invalid={Boolean(errors.name)} />
          </Field>
          <Field label="Flat and street" htmlFor="profile-address" error={errors.address}>
            <Input id="profile-address" name="address" required autoComplete="street-address" defaultValue={user.address} invalid={Boolean(errors.address)} />
          </Field>
          <Field label="Pincode" htmlFor="profile-pincode" error={errors.pincode}>
            <Input id="profile-pincode" name="pincode" required inputMode="numeric" maxLength={6} autoComplete="postal-code" defaultValue={user.pincode} invalid={Boolean(errors.pincode)} />
          </Field>
          <FormError message={state.error} />
          <SubmitButton size="lg">Save changes</SubmitButton>
        </form>
      </Sheet>
    </>
  )
}
