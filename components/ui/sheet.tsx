"use client"

import type { ReactNode } from "react"
import { Drawer } from "vaul"

/** Bottom sheet, aligned to the app column. Drag down or tap outside to dismiss. */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/45" />
        <Drawer.Content
          aria-describedby={description ? undefined : ""}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-[30rem] flex-col rounded-t-[28px] bg-surface outline-none"
        >
          <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line-strong" />
          <div className="overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-4">
            <Drawer.Title className="font-display text-xl font-semibold tracking-tight text-ink">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="mt-1 text-sm text-ink-soft">{description}</Drawer.Description>
            ) : null}
            <div className="mt-5">{children}</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
