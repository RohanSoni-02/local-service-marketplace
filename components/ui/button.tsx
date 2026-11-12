"use client"

import type { ButtonHTMLAttributes } from "react"
import { useFormStatus } from "react-dom"
import { buttonClass, type Size, type Variant } from "@/components/ui/button-class"
import { cn } from "@/lib/utils"

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-[1.1em] animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
    />
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  pending?: boolean
}

export function Button({ variant, size, pending, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={buttonClass({ variant, size, className })}
    >
      {pending ? <Spinner /> : null}
      {children}
    </button>
  )
}

/** Submit button that reflects its parent form's pending state. */
export function SubmitButton(props: ButtonProps) {
  const { pending } = useFormStatus()
  return <Button {...props} type="submit" pending={pending || props.pending} />
}
