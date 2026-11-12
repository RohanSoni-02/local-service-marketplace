import { eq } from "drizzle-orm"
import { db, schema } from "@/lib/db"

/** Serves a listing's uploaded photo. A listing's photo never changes, so it caches forever. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [photo] = await db
    .select()
    .from(schema.listingPhotos)
    .where(eq(schema.listingPhotos.listingId, id))
    .limit(1)
  if (!photo) return new Response(null, { status: 404 })
  return new Response(Buffer.from(photo.data, "base64"), {
    headers: {
      "Content-Type": photo.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
