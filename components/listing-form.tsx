"use client"

import { useActionState, useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Camera, LocateFixed, ShieldCheck, X } from "lucide-react"
import { toast } from "sonner"
import { createListing } from "@/lib/actions/listings"
import { listingCategories, listingConditions, serviceArea } from "@/lib/catalog"
import { formatINR } from "@/lib/format"
import { Button, SubmitButton } from "@/components/ui/button"
import { Field, FormError, Input, Textarea } from "@/components/ui/field"
import { ActionBar } from "@/components/ui/top-bar"

const LocationPicker = dynamic(() => import("@/components/location-picker"), {
  ssr: false,
  loading: () => <div className="h-52 animate-pulse rounded-2xl bg-sunken" />,
})

const chip =
  "pressable flex h-10 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-medium text-ink " +
  "has-checked:border-brand has-checked:bg-brand has-checked:text-on-brand has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand"

/** Shrinks a phone photo to a ~60 KB JPEG in the browser, so no file storage service is needed. */
async function shrink(file: File) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL("image/jpeg", 0.78)
}

export function ListingForm() {
  const [state, action] = useActionState(createListing, {})
  const [photo, setPhoto] = useState("")
  const [point, setPoint] = useState({ latitude: serviceArea.latitude, longitude: serviceArea.longitude })
  const [price, setPrice] = useState("")
  const [bond, setBond] = useState("")
  const [locating, setLocating] = useState(false)
  const errors = state.fieldErrors ?? {}

  async function pickPhoto(file: File | undefined) {
    if (!file) return
    try {
      setPhoto(await shrink(file))
    } catch {
      toast.error("That photo couldn't be read. Try a JPEG or PNG.")
    }
  }

  function locate() {
    if (!navigator.geolocation) return toast.error("Your browser can't share a location. Drag the pin instead.")
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPoint({ latitude: coords.latitude, longitude: coords.longitude })
        setLocating(false)
      },
      () => {
        toast.error("Couldn't get your location. Drag the pin instead.")
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <form action={action} className="flex flex-col gap-7 px-4 pb-32 pt-5">
      <input type="hidden" name="photo" value={photo} />
      <input type="hidden" name="latitude" value={point.latitude} />
      <input type="hidden" name="longitude" value={point.longitude} />

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-ink">Photo</span>
        {photo ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-sunken">
            <Image src={photo} alt="Your item" fill unoptimized className="animate-fade object-cover" />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => setPhoto("")}
              className="pressable absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-surface text-ink shadow-float"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label className="pressable flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong bg-surface text-ink-soft hover:bg-sunken has-focus-visible:outline-2 has-focus-visible:outline-brand">
            <Camera className="size-7 text-brand" strokeWidth={1.6} aria-hidden="true" />
            <span className="text-sm font-semibold text-ink">Add a photo</span>
            <span className="text-[13px]">Listings with a photo get borrowed far more often</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => pickPhoto(event.target.files?.[0])} />
          </label>
        )}
        {errors.photo ? <p className="text-[13px] text-danger">{errors.photo}</p> : null}
      </div>

      <Field label="What are you lending?" htmlFor="title" error={errors.title}>
        <Input id="title" name="title" required maxLength={70} placeholder="PlayStation 5 with two controllers" invalid={Boolean(errors.title)} />
      </Field>

      <fieldset>
        <legend className="mb-2.5 text-[13px] font-semibold text-ink">Category</legend>
        <div className="flex flex-wrap gap-2">
          {listingCategories.map((category, index) => (
            <label key={category.id} className={chip}>
              <input type="radio" name="category" value={category.id} defaultChecked={index === 0} className="sr-only" />
              {category.name}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Details" htmlFor="description" error={errors.description} hint="What's included, and anything a borrower should know.">
        <Textarea id="description" name="description" required maxLength={600} invalid={Boolean(errors.description)} placeholder="Disc edition with two games. HDMI cable and both controllers included." />
      </Field>

      <fieldset>
        <legend className="mb-2.5 text-[13px] font-semibold text-ink">Condition</legend>
        <div className="flex flex-wrap gap-2">
          {listingConditions.map((condition) => (
            <label key={condition} className={chip}>
              <input type="radio" name="condition" value={condition} defaultChecked={condition === "Good"} className="sr-only" />
              {condition}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Price per day" htmlFor="dailyPrice" error={errors.dailyPrice}>
          <Input id="dailyPrice" name="dailyPrice" required inputMode="numeric" pattern="[0-9]*" prefix="₹" placeholder="500" value={price} onChange={(event) => setPrice(event.target.value.replace(/\D/g, ""))} invalid={Boolean(errors.dailyPrice)} />
        </Field>
        <Field label="Refundable bond" htmlFor="bond" error={errors.bond}>
          <Input id="bond" name="bond" required inputMode="numeric" pattern="[0-9]*" prefix="₹" placeholder="4000" value={bond} onChange={(event) => setBond(event.target.value.replace(/\D/g, ""))} invalid={Boolean(errors.bond)} />
        </Field>
        <p className="col-span-2 flex gap-2.5 rounded-xl bg-brand-soft px-3.5 py-3 text-[13px] leading-relaxed text-brand-deep">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            The borrower hands you the bond when they collect. You return it when the item comes back fine, or keep part
            of it for damage.{" "}
            {Number(price) > 0 && !bond ? `For something worth replacing, ${formatINR(Number(price) * 8)} is a typical bond.` : ""}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-ink">Pickup spot</span>
          <Button variant="ghost" size="sm" pending={locating} onClick={locate} className="text-brand-deep">
            <LocateFixed aria-hidden="true" />
            Use my location
          </Button>
        </div>
        <LocationPicker value={point} onChange={setPoint} />
        {errors.latitude ? (
          <p className="text-[13px] text-danger">{errors.latitude}</p>
        ) : (
          <p className="text-[13px] text-ink-soft">
            Tap the map or drag the pin. Neighbours only see it to the nearest 100 m, never your exact door.
          </p>
        )}
      </div>

      <FormError message={state.error} />

      <ActionBar>
        <SubmitButton size="lg" className="w-full">
          Publish listing
        </SubmitButton>
      </ActionBar>
    </form>
  )
}
