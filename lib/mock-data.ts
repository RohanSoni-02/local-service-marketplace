export type Category = {
  id: string
  name: string
  icon: string
}

export type Review = {
  id: string
  author: string
  rating: number
  text: string
  daysAgo: number
}

export type Tool = {
  id: string
  shopId: string
  name: string
  photo: string
  dailyPrice: number
  deposit: number
  condition: "Excellent" | "Good" | "Fair"
  category: string
}

export type Shop = {
  id: string
  name: string
  categoryId: string
  rating: number
  jobsCompleted: number
  tier: "Gold Verified" | "Verified" | "New"
  distanceKm: number
  photo: string
  gallery: string[]
  bio: string
  hours: string
  serviceRadiusKm: number
  pincode: string
  reviews: Review[]
  // Mock location data for map view
  latitude: number
  longitude: number
}

export type BookingStatus =
  | "broadcasting"
  | "accepted"
  | "on_the_way"
  | "completed"
  | "cancelled"

export type Booking = {
  id: string
  shopId: string
  issueType: string
  description: string
  mode: "Instant" | "Scheduled"
  scheduledFor?: string
  status: BookingStatus
  createdAt: string
  cost?: number
  userRating?: number
}

export type RentalStatus = "active" | "returned"

export type Rental = {
  id: string
  toolId: string
  shopId: string
  days: number
  dailyPrice: number
  deposit: number
  status: RentalStatus
  pickedUpAt: string
  dueAt: string
  returnedAt?: string
}

export type InventoryItem = {
  id: string
  shopId: string
  productName: string
  productPhoto: string
  category: string
  price: number // in INR
  stock: number // 0 for out of stock, >0 for in stock
}

export type ChatMessage = {
  id: string
  shopId: string
  sender: "user" | "shop"
  text: string
  time: string
}

export const categories: Category[] = [
  { id: "plumber", name: "Plumber", icon: "wrench" },
  { id: "electrician", name: "Electrician", icon: "zap" },
  { id: "carpenter", name: "Carpenter", icon: "hammer" },
  { id: "ac-repair", name: "AC Repair", icon: "fan" },
  { id: "hardware", name: "Hardware Store", icon: "store" },
  { id: "tool-rental", name: "Tool Rental", icon: "drill" },
  { id: "painter", name: "Painter", icon: "paintbrush" },
  { id: "appliance", name: "Appliance Repair", icon: "washing-machine" },
]

export const shops: Shop[] = [
  {
    id: "shop-1",
    name: "Sharma Plumbing Works",
    categoryId: "plumber",
    rating: 4.8,
    jobsCompleted: 612,
    tier: "Gold Verified",
    distanceKm: 0.8,
    photo: "/indian-plumber-shop-storefront.png",
    gallery: ["/plumbing-tools-and-pipes-shop-interior.png", "/plumber-at-work-fixing-pipe.png"],
    bio: "Family-run plumbing shop serving Lajpat Nagar for 18 years. Specialists in leak repair, bathroom fittings and borewell pumps.",
    hours: "7:00 AM – 9:00 PM, all days",
    serviceRadiusKm: 5,
    pincode: "110024",
    reviews: [
      { id: "r1", author: "Anita K.", rating: 5, text: "Fixed my kitchen leak in 20 minutes. Very professional.", daysAgo: 2 },
      { id: "r2", author: "Rohit M.", rating: 5, text: "Arrived on time, fair pricing, no surprise charges.", daysAgo: 6 },
      { id: "r3", author: "Deepak S.", rating: 4, text: "Good work, slightly delayed but called ahead.", daysAgo: 14 },
    ],
    latitude: 28.6139 + 0.005,  // Slight offset from center
    longitude: 77.2090 + 0.003,
  },
  {
    id: "shop-2",
    name: "Bright Spark Electricals",
    categoryId: "electrician",
    rating: 4.6,
    jobsCompleted: 389,
    tier: "Verified",
    distanceKm: 1.2,
    photo: "/electrician-shop-storefront-india.png",
    gallery: ["/electrical-wiring-shop-interior.png"],
    bio: "Licensed electricians for home wiring, MCB, inverter installation and fan/light fittings.",
    hours: "8:00 AM – 8:00 PM, Mon–Sat",
    serviceRadiusKm: 4,
    pincode: "110024",
    reviews: [
      { id: "r1", author: "Meera J.", rating: 5, text: "Replaced my whole board safely, explained everything.", daysAgo: 3 },
      { id: "r2", author: "Sanjay P.", rating: 4, text: "Good service, a bit pricey on parts.", daysAgo: 10 },
    ],
    latitude: 28.6139 - 0.008,  // Slight offset from center
    longitude: 77.2090 - 0.005,
  },
  {
    id: "shop-3",
    name: "Kumar Carpentry & Furniture",
    categoryId: "carpenter",
    rating: 4.9,
    jobsCompleted: 271,
    tier: "Gold Verified",
    distanceKm: 2.1,
    photo: "/carpenter-workshop-storefront-india.png",
    gallery: ["/carpentry-workshop-tools-wood.png"],
    bio: "Custom furniture, door and window repairs, modular kitchen fittings. Free measurement visit.",
    hours: "9:00 AM – 7:00 PM, Mon–Sat",
    serviceRadiusKm: 6,
    pincode: "110024",
    reviews: [
      { id: "r1", author: "Priya R.", rating: 5, text: "Beautiful wardrobe, exactly as promised.", daysAgo: 5 },
    ],
    latitude: 28.6139 + 0.012,  // Slight offset from center
    longitude: 77.2090 - 0.007,
  },
  {
    id: "shop-4",
    name: "CoolAir AC Services",
    categoryId: "ac-repair",
    rating: 4.5,
    jobsCompleted: 498,
    tier: "Verified",
    distanceKm: 1.6,
    photo: "/ac-repair-technician-shop.png",
    gallery: ["/ac-servicing-tools-shop.png"],
    bio: "AC installation, gas refill, servicing for split and window units. Same-day service available.",
    hours: "8:00 AM – 9:00 PM, all days",
    serviceRadiusKm: 8,
    pincode: "110024",
    reviews: [
      { id: "r1", author: "Vikram T.", rating: 4, text: "Quick gas refill, AC cooling great now.", daysAgo: 1 },
    ],
    latitude: 28.6139 - 0.003,  // Slight offset from center
    longitude: 77.2090 + 0.010,
  },
  {
    id: "shop-5",
    name: "Gupta Hardware & Tools",
    categoryId: "hardware",
    rating: 4.7,
    jobsCompleted: 845,
    tier: "Gold Verified",
    distanceKm: 0.5,
    photo: "/hardware-store-front-india.png",
    gallery: ["/hardware-store-tools-shelves.png"],
    bio: "One-stop hardware shop with tool rental counter. Drills, ladders, welding machines and more.",
    hours: "8:00 AM – 10:00 PM, all days",
    serviceRadiusKm: 5,
    pincode: "110024",
    reviews: [
      { id: "r1", author: "Amit V.", rating: 5, text: "Rented a tile cutter, smooth process and fair deposit.", daysAgo: 4 },
    ],
    latitude: 28.6139 + 0.002,  // Very close to center
    longitude: 77.2090 - 0.002,
  },
  {
    id: "shop-6",
    name: "Verma Tool Rentals",
    categoryId: "tool-rental",
    rating: 4.6,
    jobsCompleted: 322,
    tier: "Verified",
    distanceKm: 1.9,
    photo: "/tool-rental-shop-front-india.png",
    gallery: ["/tool-rental-shop-interior-drills.png"],
    bio: "Power tools, ladders and generators for daily or weekly rent. Deposit fully refundable on return.",
    hours: "9:00 AM – 8:00 PM, Mon–Sat",
    serviceRadiusKm: 6,
    pincode: "110024",
    reviews: [
      { id: "r1", author: "Farha N.", rating: 5, text: "Great condition tools, quick pickup.", daysAgo: 8 },
    ],
    latitude: 28.6139 - 0.015,  // Further out
    longitude: 77.2090 + 0.008,
  },
]

export const tools: Tool[] = [
  {
    id: "tool-1",
    shopId: "shop-5",
    name: "Bosch Impact Drill",
    photo: "/cordless-impact-drill-tool.png",
    dailyPrice: 150,
    deposit: 1500,
    condition: "Excellent",
    category: "Power Tools",
  },
  {
    id: "tool-2",
    shopId: "shop-5",
    name: "Tile Cutter Machine",
    photo: "/tile-cutter-machine-tool.png",
    dailyPrice: 300,
    deposit: 3000,
    condition: "Good",
    category: "Power Tools",
  },
  {
    id: "tool-3",
    shopId: "shop-6",
    name: "Aluminium Ladder (12 ft)",
    photo: "/aluminium-step-ladder.png",
    dailyPrice: 100,
    deposit: 1000,
    condition: "Good",
    category: "Access Equipment",
  },
  {
    id: "tool-4",
    shopId: "shop-6",
    name: "Portable Generator 2KVA",
    photo: "/portable-generator-2kva.png",
    dailyPrice: 500,
    deposit: 5000,
    condition: "Excellent",
    category: "Power Equipment",
  },
  {
    id: "tool-5",
    shopId: "shop-6",
    name: "Angle Grinder",
    photo: "/angle-grinder-tool.png",
    dailyPrice: 120,
    deposit: 1200,
    condition: "Fair",
    category: "Power Tools",
  },
  {
    id: "tool-6",
    shopId: "shop-5",
    name: "Pressure Washer",
    photo: "/pressure-washer-machine.png",
    dailyPrice: 250,
    deposit: 2500,
    condition: "Excellent",
    category: "Cleaning Equipment",
  },
]

export const broadcastShopIds = ["shop-1", "shop-2", "shop-3", "shop-4"]

export const bookingHistory: Booking[] = [
  {
    id: "bk-1",
    shopId: "shop-1",
    issueType: "Leaking tap",
    description: "Kitchen sink tap leaking continuously since morning.",
    mode: "Instant",
    status: "completed",
    createdAt: "2 days ago",
    cost: 350,
    userRating: 5,
  },
  {
    id: "bk-2",
    shopId: "shop-2",
    issueType: "MCB tripping",
    description: "Main MCB trips whenever the geyser is switched on.",
    mode: "Scheduled",
    scheduledFor: "Yesterday, 4:00 PM",
    status: "completed",
    createdAt: "5 days ago",
    cost: 500,
    userRating: 4,
  },
  {
    id: "bk-3",
    shopId: "shop-4",
    issueType: "AC not cooling",
    description: "Split AC in bedroom blowing warm air.",
    mode: "Instant",
    status: "cancelled",
    createdAt: "1 week ago",
  },
]

export const rentalHistory: Rental[] = [
  {
    id: "rt-1",
    toolId: "tool-3",
    shopId: "shop-6",
    days: 2,
    dailyPrice: 100,
    deposit: 1000,
    status: "returned",
    pickedUpAt: "10 days ago",
    dueAt: "8 days ago",
    returnedAt: "8 days ago",
  },
]

export const chatMessages: Record<string, ChatMessage[]> = {
  "shop-1": [
    { id: "m1", shopId: "shop-1", sender: "user", text: "Hi, is the plumber on the way?", time: "10:02 AM" },
    { id: "m2", shopId: "shop-1", sender: "shop", text: "Yes, our technician Ramesh is heading to your location now.", time: "10:03 AM" },
    { id: "m3", shopId: "shop-1", sender: "shop", text: "He will reach in about 15 minutes.", time: "10:03 AM" },
    { id: "m4", shopId: "shop-1", sender: "user", text: "Great, thank you! The tap is in the kitchen.", time: "10:05 AM" },
  ],
}

export function getShop(id: string) {
  return shops.find((s) => s.id === id)
}

export function getTool(id: string) {
  return tools.find((t) => t.id === id)
}

export function getCategory(id: string) {
  return categories.find((c) => c.id === id)
}

export function getShopsByCategory(categoryId: string) {
  return shops.filter((s) => s.categoryId === categoryId)
}

export function getToolsByShop(shopId: string) {
  return tools.filter((t) => t.shopId === shopId)
}

export const inventory: InventoryItem[] = [
  {
    id: "inv-1",
    shopId: "shop-5", // Gupta Hardware & Tools
    productName: "15mm Pipe Joint",
    productPhoto: "/placeholder.jpg",
    category: "Plumbing",
    price: 25,
    stock: 15, // In Stock
  },
  {
    id: "inv-2",
    shopId: "shop-5",
    productName: "MCB Switch",
    productPhoto: "/placeholder.jpg",
    category: "Electrical",
    price: 120,
    stock: 2, // Low Stock
  },
  {
    id: "inv-3",
    shopId: "shop-5",
    productName: "PVC Elbow",
    productPhoto: "/placeholder.jpg",
    category: "Plumbing",
    price: 18,
    stock: 0, // Out of Stock
  },
  {
    id: "inv-4",
    shopId: "shop-1", // Sharma Plumbing Works
    productName: "15mm Pipe Joint",
    productPhoto: "/placeholder.jpg",
    category: "Plumbing",
    price: 22,
    stock: 5, // Low Stock
  },
  {
    id: "inv-5",
    shopId: "shop-2", // Bright Spark Electricals
    productName: "MCB Switch",
    productPhoto: "/placeholder.jpg",
    category: "Electrical",
    price: 110,
    stock: 8, // In Stock
  },
  {
    id: "inv-6",
    shopId: "shop-5",
    productName: "Wall Plug",
    productPhoto: "/placeholder.jpg",
    category: "Hardware",
    price: 2,
    stock: 50, // In Stock
  },
  {
    id: "inv-7",
    shopId: "shop-6", // Verma Tool Rentals
    productName: "Screw Set ( Assorted )",
    productPhoto: "/placeholder.jpg",
    category: "Hardware",
    price: 150,
    stock: 12, // In Stock
  },
  {
    id: "inv-8",
    shopId: "shop-5",
    productName: "Screw Set ( Assorted )",
    productPhoto: "/placeholder.jpg",
    category: "Hardware",
    price: 140,
    stock: 3, // Low Stock
  },
]

// Society and Group Booking Types
export type Society = {
  id: string
  name: string
  address: string
  pincode: string
}

export type GroupRequest = {
  id: string
  societyId: string
  category: string
  description: string
  preferredDate: string // ISO date string
  status: "open" | "closed" | "completed"
  flatsJoined: number
  offers: Offer[]
  selectedOffer?: Offer
}

export type Offer = {
  id: string
  shopName: string
  pricePerFlat: number
  minFlats?: number
}

// Mock Societies
export const mockSocieties: Society[] = [
  { id: "soc-1", name: "Green Valley Apartments", address: "123 Main St, City", pincode: "110001" },
  { id: "soc-2", name: "Riverdale Society", address: "456 River Rd, City", pincode: "110002" },
  { id: "soc-3", name: "Hilltop Residency", address: "789 Hilltop Ave, City", pincode: "110003" },
  { id: "soc-4", name: "Sunflower Complex", address: "321 Flower St, City", pincode: "110004" },
  { id: "soc-5", name: "Ocean View Estate", address: "656 Ocean Blvd, City", pincode: "110005" },
]

// Mock Group Requests (keyed by societyId)
export const mockGroupRequests: Record<string, GroupRequest[]> = {
  "soc-1": [
    {
      id: "req-1",
      societyId: "soc-1",
      category: "Pest Control",
      description: "Monthly pest control for all flats",
      preferredDate: "2026-08-25",
      status: "open",
      flatsJoined: 6,
      offers: [
        { id: "off-1", shopName: "CleanHome Services", pricePerFlat: 150, minFlats: 10 },
        { id: "off-2", shopName: "PestFree Solutions", pricePerFlat: 200, minFlats: 5 },
      ],
      selectedOffer: undefined,
    },
    {
      id: "req-2",
      societyId: "soc-1",
      category: "Water Tank Cleaning",
      description: "Cleaning and disinfection of water tanks",
      preferredDate: "2026-08-30",
      status: "closed",
      flatsJoined: 12,
      offers: [
        { id: "off-3", shopName: "WaterCare Services", pricePerFlat: 250, minFlats: 10 },
      ],
      selectedOffer: { id: "off-3", shopName: "WaterCare Services", pricePerFlat: 250, minFlats: 10 },
    },
  ],
  "soc-2": [
    {
      id: "req-3",
      societyId: "soc-2",
      category: "Gardening",
      description: "Monthly garden maintenance for common areas",
      preferredDate: "2026-08-28",
      status: "open",
      flatsJoined: 3,
      offers: [],
    },
  ],
}

// Mock User (for demo) - in real app this would come from auth
export const mockUser = {
  id: "user1",
  name: "Rohan Soni",
  phone: "9876543210",
  societyId: null as string | null, // null means not linked
  isAdmin: false,
}
