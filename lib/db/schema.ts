import { sql } from "drizzle-orm"
import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

const id = () => text("id").primaryKey()
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`)
const ts = (name: string) => integer(name, { mode: "timestamp_ms" })

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  address: text("address").notNull().default(""),
  pincode: text("pincode").notNull().default(""),
  /** Placeholder neighbours from the seed catalogue; they cannot sign in. */
  isSeed: integer("is_seed", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
})

export const sessions = sqliteTable(
  "sessions",
  {
    /** SHA-256 of the cookie token — the raw token never touches the database. */
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: ts("expires_at").notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
)

export const loginAttempts = sqliteTable(
  "login_attempts",
  {
    id: id(),
    phone: text("phone").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("login_attempts_phone_idx").on(t.phone, t.createdAt)],
)

export const shops = sqliteTable(
  "shops",
  {
    id: id(),
    name: text("name").notNull(),
    categoryId: text("category_id").notNull(),
    tier: text("tier", { enum: ["Gold Verified", "Verified", "New"] }).notNull(),
    photo: text("photo"),
    gallery: text("gallery", { mode: "json" }).$type<string[]>().notNull().default([]),
    bio: text("bio").notNull(),
    hours: text("hours").notNull(),
    area: text("area").notNull(),
    pincode: text("pincode").notNull(),
    phone: text("phone").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    serviceRadiusKm: integer("service_radius_km").notNull(),
    /** Minimum charge for a home visit, in INR. */
    visitFee: integer("visit_fee").notNull(),
    rating: real("rating").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    jobsCompleted: integer("jobs_completed").notNull().default(0),
  },
  (t) => [index("shops_category_idx").on(t.categoryId)],
)

export const reviews = sqliteTable(
  "reviews",
  {
    id: id(),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    bookingId: text("booking_id").unique(),
    author: text("author").notNull(),
    rating: integer("rating").notNull(),
    text: text("text").notNull().default(""),
    createdAt: createdAt(),
  },
  (t) => [index("reviews_shop_idx").on(t.shopId, t.createdAt)],
)

export const tools = sqliteTable(
  "tools",
  {
    id: id(),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    photo: text("photo"),
    category: text("category").notNull(),
    condition: text("condition", { enum: ["Excellent", "Good", "Fair"] }).notNull(),
    dailyPrice: integer("daily_price").notNull(),
    deposit: integer("deposit").notNull(),
  },
  (t) => [index("tools_shop_idx").on(t.shopId)],
)

export const inventory = sqliteTable(
  "inventory",
  {
    id: id(),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id, { onDelete: "cascade" }),
    productName: text("product_name").notNull(),
    category: text("category").notNull(),
    price: integer("price").notNull(),
    stock: integer("stock").notNull(),
  },
  (t) => [index("inventory_name_idx").on(t.productName)],
)

export const bookingStatuses = ["broadcasting", "accepted", "on_the_way", "completed", "cancelled", "expired"] as const
export type BookingStatus = (typeof bookingStatuses)[number]

export const bookings = sqliteTable(
  "bookings",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** The shop the customer started from. */
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id),
    /** The shop that won the job (set on acceptance). */
    assignedShopId: text("assigned_shop_id").references(() => shops.id),
    categoryId: text("category_id").notNull(),
    issueType: text("issue_type").notNull(),
    description: text("description").notNull(),
    address: text("address").notNull(),
    scheduledAt: ts("scheduled_at"),
    budget: integer("budget"),
    allowNegotiation: integer("allow_negotiation", { mode: "boolean" }).notNull(),
    status: text("status", { enum: bookingStatuses }).notNull().default("broadcasting"),
    price: integer("price"),
    etaMinutes: integer("eta_minutes"),
    createdAt: createdAt(),
    acceptedAt: ts("accepted_at"),
    enRouteAt: ts("en_route_at"),
    completedAt: ts("completed_at"),
    closedAt: ts("closed_at"),
  },
  (t) => [index("bookings_user_idx").on(t.userId, t.createdAt)],
)

export const offerStatuses = ["pending", "countered", "firm", "accepted", "declined"] as const
export type OfferStatus = (typeof offerStatuses)[number]

export const offers = sqliteTable(
  "offers",
  {
    id: id(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id),
    price: integer("price").notNull(),
    etaMinutes: integer("eta_minutes").notNull(),
    /** `firm` = the shop turned down a counter and is holding its original price. */
    status: text("status", { enum: offerStatuses }).notNull().default("pending"),
    counterPrice: integer("counter_price"),
    counteredAt: ts("countered_at"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("offers_booking_shop_idx").on(t.bookingId, t.shopId)],
)

export const rentalStatuses = ["reserved", "active", "returned", "cancelled"] as const
export type RentalStatus = (typeof rentalStatuses)[number]

export const rentals = sqliteTable(
  "rentals",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toolId: text("tool_id")
      .notNull()
      .references(() => tools.id),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id),
    days: integer("days").notNull(),
    dailyPrice: integer("daily_price").notNull(),
    deposit: integer("deposit").notNull(),
    pickupCode: text("pickup_code").notNull(),
    status: text("status", { enum: rentalStatuses }).notNull().default("reserved"),
    createdAt: createdAt(),
    pickedUpAt: ts("picked_up_at"),
    dueAt: ts("due_at"),
    returnedAt: ts("returned_at"),
  },
  (t) => [index("rentals_user_idx").on(t.userId, t.createdAt), index("rentals_tool_idx").on(t.toolId, t.status)],
)

export const reservationStatuses = ["held", "cancelled"] as const

export const reservations = sqliteTable(
  "reservations",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    inventoryId: text("inventory_id")
      .notNull()
      .references(() => inventory.id),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id),
    productName: text("product_name").notNull(),
    price: integer("price").notNull(),
    pickupCode: text("pickup_code").notNull(),
    status: text("status", { enum: reservationStatuses }).notNull().default("held"),
    /** Set once the unit has been put back on the shelf (cancelled or lapsed). */
    stockReleased: integer("stock_released", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
    expiresAt: ts("expires_at").notNull(),
  },
  (t) => [index("reservations_user_idx").on(t.userId, t.createdAt)],
)

export const messages = sqliteTable(
  "messages",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    shopId: text("shop_id")
      .notNull()
      .references(() => shops.id),
    sender: text("sender", { enum: ["user", "shop"] }).notNull(),
    text: text("text").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("messages_thread_idx").on(t.userId, t.shopId, t.createdAt)],
)

export const societies = sqliteTable("societies", {
  id: id(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  pincode: text("pincode").notNull(),
  createdAt: createdAt(),
})

export const societyMembers = sqliteTable(
  "society_members",
  {
    /** A resident belongs to one society at a time. */
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    societyId: text("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    flat: text("flat").notNull(),
    role: text("role", { enum: ["admin", "resident"] }).notNull(),
    joinedAt: createdAt(),
  },
  (t) => [index("society_members_society_idx").on(t.societyId)],
)

export const groupRequests = sqliteTable(
  "group_requests",
  {
    id: id(),
    societyId: text("society_id")
      .notNull()
      .references(() => societies.id, { onDelete: "cascade" }),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
    category: text("category").notNull(),
    description: text("description").notNull(),
    /** ISO date, e.g. 2026-08-25 */
    preferredDate: text("preferred_date").notNull(),
    status: text("status", { enum: ["open", "closed", "completed"] }).notNull().default("open"),
    selectedOfferId: text("selected_offer_id"),
    createdAt: createdAt(),
  },
  (t) => [index("group_requests_society_idx").on(t.societyId, t.createdAt)],
)

export const groupParticipants = sqliteTable(
  "group_participants",
  {
    requestId: text("request_id")
      .notNull()
      .references(() => groupRequests.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    joinedAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.requestId, t.userId] })],
)

export const groupOffers = sqliteTable(
  "group_offers",
  {
    id: id(),
    requestId: text("request_id")
      .notNull()
      .references(() => groupRequests.id, { onDelete: "cascade" }),
    shopName: text("shop_name").notNull(),
    pricePerFlat: integer("price_per_flat").notNull(),
    minFlats: integer("min_flats").notNull().default(1),
    createdAt: createdAt(),
  },
  (t) => [index("group_offers_request_idx").on(t.requestId)],
)

export const listings = sqliteTable(
  "listings",
  {
    id: id(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    condition: text("condition", { enum: ["Like new", "Good", "Well used"] }).notNull(),
    /** A public path: a bundled image or /listing-photo/<id>. */
    photo: text("photo"),
    dailyPrice: integer("daily_price").notNull(),
    /** Refundable bond the borrower leaves with the owner. */
    bond: integer("bond").notNull(),
    area: text("area").notNull(),
    /** Rounded to ~100 m so a listing never pinpoints a home. */
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    status: text("status", { enum: ["active", "paused", "removed"] }).notNull().default("active"),
    createdAt: createdAt(),
  },
  (t) => [index("listings_owner_idx").on(t.ownerId), index("listings_status_idx").on(t.status, t.category)],
)

export const listingPhotos = sqliteTable("listing_photos", {
  listingId: text("listing_id")
    .primaryKey()
    .references(() => listings.id, { onDelete: "cascade" }),
  mime: text("mime").notNull(),
  /** Base64 image, resized in the browser before upload. */
  data: text("data").notNull(),
})

export const peerRentalStatuses = [
  "requested",
  "approved",
  "active",
  "returned",
  "closed",
  "declined",
  "cancelled",
] as const
export type PeerRentalStatus = (typeof peerRentalStatuses)[number]

export const peerRentals = sqliteTable(
  "peer_rentals",
  {
    id: id(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    renterId: text("renter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    days: integer("days").notNull(),
    dailyPrice: integer("daily_price").notNull(),
    bond: integer("bond").notNull(),
    note: text("note").notNull().default(""),
    /** The borrower shows this; the owner enters it to confirm handover and bond. */
    handoverCode: text("handover_code").notNull(),
    /** `returned` = borrower says it's back, owner hasn't settled the bond yet. */
    status: text("status", { enum: peerRentalStatuses }).notNull().default("requested"),
    bondStatus: text("bond_status", { enum: ["none", "held", "refunded", "claimed"] }).notNull().default("none"),
    bondWithheld: integer("bond_withheld").notNull().default(0),
    claimNote: text("claim_note").notNull().default(""),
    createdAt: createdAt(),
    approvedAt: ts("approved_at"),
    startedAt: ts("started_at"),
    dueAt: ts("due_at"),
    returnedAt: ts("returned_at"),
    closedAt: ts("closed_at"),
  },
  (t) => [
    index("peer_rentals_renter_idx").on(t.renterId, t.createdAt),
    index("peer_rentals_owner_idx").on(t.ownerId, t.createdAt),
    index("peer_rentals_listing_idx").on(t.listingId, t.status),
  ],
)

export type Listing = typeof listings.$inferSelect
export type PeerRental = typeof peerRentals.$inferSelect
export type User = typeof users.$inferSelect
export type Shop = typeof shops.$inferSelect
export type Review = typeof reviews.$inferSelect
export type Tool = typeof tools.$inferSelect
export type InventoryItem = typeof inventory.$inferSelect
export type Booking = typeof bookings.$inferSelect
export type Offer = typeof offers.$inferSelect
export type Rental = typeof rentals.$inferSelect
export type Reservation = typeof reservations.$inferSelect
export type Message = typeof messages.$inferSelect
export type Society = typeof societies.$inferSelect
export type SocietyMember = typeof societyMembers.$inferSelect
export type GroupRequest = typeof groupRequests.$inferSelect
export type GroupOffer = typeof groupOffers.$inferSelect
