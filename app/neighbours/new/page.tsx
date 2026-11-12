import type { Metadata } from "next"
import { requireUser } from "@/lib/server/auth"
import { ListingForm } from "@/components/listing-form"
import { TopBar } from "@/components/ui/top-bar"

export const metadata: Metadata = { title: "Lend an item" }

export default async function NewListingPage() {
  await requireUser("/neighbours/new")
  return (
    <>
      <TopBar title="Lend an item" subtitle="Earn from things that sit idle" fallback="/neighbours" />
      <ListingForm />
    </>
  )
}
