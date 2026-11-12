import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const control =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-faint " +
  "transition-[border-color,box-shadow] duration-150 ease-out " +
  "focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/12 " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/12"

export function Field({
  label,
  hint,
  error,
  htmlFor,
  optional,
  children,
  className,
}: {
  label: string
  hint?: string
  error?: string
  htmlFor: string
  optional?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between text-[13px] font-semibold text-ink">
        {label}
        {optional ? <span className="font-normal text-ink-faint">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-ink-soft">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({
  className,
  invalid,
  prefix,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> & { invalid?: boolean; prefix?: ReactNode }) {
  const input = (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      className={cn(control, "h-12", prefix ? "pl-9" : null, className)}
    />
  )
  if (!prefix) return input
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-soft">{prefix}</span>
      {input}
    </div>
  )
}

export function Textarea({
  className,
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      className={cn(control, "min-h-28 resize-none py-3 leading-relaxed", className)}
    />
  )
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="animate-fade rounded-xl bg-danger-soft px-3.5 py-2.5 text-[13.5px] font-medium text-danger">
      {message}
    </p>
  )
}
