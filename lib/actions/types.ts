import type { ZodError } from "zod"

export type FormState = {
  error?: string
  fieldErrors?: Record<string, string | undefined>
  ok?: boolean
}

export type ActionResult = { ok: true } | { ok: false; error: string }

/** Collapses a zod error to the first message per field, for inline display. */
export function fieldErrors(error: ZodError): FormState {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form")
    out[key] ??= issue.message
  }
  return { fieldErrors: out }
}
