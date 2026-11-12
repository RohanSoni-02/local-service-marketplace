export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-4 px-4 pt-6">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-sunken" />
      <div className="h-12 animate-pulse rounded-xl bg-sunken" />
      <div className="h-28 animate-pulse rounded-2xl bg-sunken" />
      <div className="h-28 animate-pulse rounded-2xl bg-sunken" />
    </div>
  )
}
