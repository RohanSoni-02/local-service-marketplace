/** Static reference data: service categories and the issue types each one handles. */

export type Category = {
  id: string
  name: string
  short: string
  icon: string
}

export const categories: Category[] = [
  { id: "plumber", name: "Plumber", short: "Plumber", icon: "wrench" },
  { id: "electrician", name: "Electrician", short: "Electrician", icon: "zap" },
  { id: "carpenter", name: "Carpenter", short: "Carpenter", icon: "hammer" },
  { id: "ac-repair", name: "AC Repair", short: "AC repair", icon: "fan" },
  { id: "hardware", name: "Hardware Store", short: "Hardware", icon: "store" },
  { id: "tool-rental", name: "Tool Rental", short: "Tool rental", icon: "drill" },
  { id: "painter", name: "Painter", short: "Painter", icon: "paintbrush" },
  { id: "appliance", name: "Appliance Repair", short: "Appliances", icon: "washing-machine" },
]

export function getCategory(id: string) {
  return categories.find((c) => c.id === id)
}

const issueTypesByCategory: Record<string, string[]> = {
  plumber: ["Leaking tap", "Blocked drain", "No water pressure", "Pipe installation", "Other"],
  electrician: ["Power outage", "MCB tripping", "Fan/light fitting", "Wiring issue", "Other"],
  carpenter: ["Door/window repair", "Furniture repair", "New furniture", "Modular fitting", "Other"],
  "ac-repair": ["AC not cooling", "Gas refill", "New installation", "Servicing", "Other"],
  hardware: ["Material supply", "Fitting help", "General enquiry", "Other"],
  "tool-rental": ["Tool delivery", "Operator needed", "General enquiry", "Other"],
  painter: ["Wall painting", "Waterproofing", "Touch-up work", "Other"],
  appliance: ["Washing machine", "Refrigerator", "Microwave", "Other"],
}

export function getIssueTypes(categoryId: string) {
  return issueTypesByCategory[categoryId] ?? ["Repair", "Installation", "Other"]
}

export const societyServiceCategories = [
  "Pest Control",
  "Water Tank Cleaning",
  "Gardening",
  "Deep Cleaning",
  "Other",
] as const

/** The neighbourhood the marketplace currently serves; distances are measured from here. */
export const serviceArea = {
  name: "Lajpat Nagar",
  city: "New Delhi",
  pincode: "110024",
  latitude: 28.5677,
  longitude: 77.2433,
  radiusKm: 5,
}

/** What neighbours lend each other. */
export const listingCategories = [
  { id: "gaming", name: "Gaming" },
  { id: "party", name: "Party & events" },
  { id: "electronics", name: "Electronics" },
  { id: "furniture", name: "Furniture" },
  { id: "tools", name: "Tools" },
  { id: "sports", name: "Sports & outdoors" },
  { id: "other", name: "Other" },
] as const

export type ListingCategoryId = (typeof listingCategories)[number]["id"]

export const listingConditions = ["Like new", "Good", "Well used"] as const

export function getListingCategory(id: string) {
  return listingCategories.find((category) => category.id === id)
}
