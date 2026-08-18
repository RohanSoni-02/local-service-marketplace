"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Building2, Search, UserPlus, Building, CalendarCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockSocieties, mockGroupRequests, mockUser, Society, GroupRequest, Offer } from "@/lib/mock-data"

export default function SocietyPage() {
  const [society, setSociety] = useState<Society | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    name: "",
    address: "",
    adminName: "",
    adminPhone: "",
  })
  const [activeTab, setActiveTab] = useState<"dashboard" | "requests">("dashboard")
  const [groupRequests, setGroupRequests] = useState<GroupRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<GroupRequest | null>(null)
  const [joinedRequest, setJoinedRequest] = useState<string | null>(null) // requestId that user has joined
  const [offerSelected, setOfferSelected] = useState<Offer | null>(null) // selected offer for admin

  // Simulate checking user's society link from mock data
  useEffect(() => {
    // In real app, this would come from auth context or API
    // For demo, we'll simulate that the user is not linked initially
    // We'll also simulate admin role based on mockUser
    if (mockUser.societyId) {
      const society = mockSocieties.find((s) => s.id === mockUser.societyId)
      setSociety(society ?? null)
      setIsAdmin(mockUser.isAdmin)
    } else {
      setSociety(null)
      setIsAdmin(false)
    }
  }, [])

  // If society is linked, load its group requests
  useEffect(() => {
    if (society) {
      const requests = mockGroupRequests[society.id] || []
      setGroupRequests(requests)
    } else {
      setGroupRequests([])
    }
  }, [society])

  // Handle society search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Handle society selection from search results (demo: auto-select first match)
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const matches = mockSocieties.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.pincode.includes(searchTerm)
      )
      if (matches.length > 0) {
        setSelectedSociety(matches[0])
      }
    }
  }, [searchTerm])

  // Handle society registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, send to backend
    // For demo, we'll create a mock society and link user
    const newSociety: Society = {
      id: Date.now().toString(),
      name: registerForm.name,
      address: registerForm.address,
      pincode: "110006", // dummy
    }
    // Add to mock list (not persistent)
    mockSocieties.push(newSociety)
    // Link user
    mockUser.societyId = newSociety.id
    mockUser.isAdmin = true // registering user becomes admin
    setSociety(newSociety)
    setIsAdmin(true)
    setShowRegisterForm(false)
    // Reset form
    setRegisterForm({ name: "", address: "", adminName: "", adminPhone: "" })
  }

  // Handle joining a group request (for residents)
  const handleJoinRequest = (requestId: string) => {
    // In real app, update backend
    // For demo, just update local state
    setJoinedRequest(requestId)
    // Also increment flatsJoined in mock data (not persistent)
    const updatedRequests = groupRequests.map((req) =>
      req.id === requestId ? { ...req, flatsJoined: req.flatsJoined + 1 } : req
    )
    setGroupRequests(updatedRequests)
  }

  // Handle posting a new group request (for admins)
  const handlePostRequest = (e: React.FormEvent) => {
    e.preventDefault()
    // In real app, send to backend
    // For demo, create a mock request and add to list
    const newRequest: GroupRequest = {
      id: Date.now().toString(),
      societyId: society?.id ?? "",
      category: "Pest Control", // from form
      description: "Test request", // from form
      preferredDate: "2026-08-25", // from form
      status: "open",
      flatsJoined: 0,
      offers: [],
    }
    // Update mock data (not persistent)
    if (society?.id) {
      mockGroupRequests[society.id] = [
        ...(mockGroupRequests[society.id] || []),
        newRequest,
      ]
    }
    setGroupRequests([...groupRequests, newRequest])
    // In real app, navigate to request details
  }

  // Handle admin selecting an offer and closing the request
  const handleSelectOffer = (offer: Offer) => {
    setOfferSelected(offer)
    // In real app, update request status to closed and notify residents
    // For demo, we'll just update the request status
    if (selectedRequest) {
      const updatedRequests = groupRequests.map((req) =>
        req.id === selectedRequest.id
          ? { ...req, status: "closed", selectedOffer: offer }
          : req
      )
      setGroupRequests(updatedRequests)
    }
  }

  // If no society linked, show join/register screen
  if (!society) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-bold">Book for your Society</h2>
          <p className="text-muted-foreground">
            Tap to join or register your society for group bookings
          </p>
        </div>

        {/* Join/Search Society */}
        <div className="space-y-4">
          <h3 className="font-medium">Join an Existing Society</h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Search society by name or pincode"
              value={searchTerm}
              onChange={handleSearch}
              className="input input-bordered w-full"
            />
            {selectedSociety && (
              <button
                onClick={() => {
                  // Link user to this society
                  mockUser.societyId = selectedSociety.id
                  // For demo, assume user is not admin unless they created it
                  mockUser.isAdmin = false
                  setSociety(selectedSociety)
                  setIsAdmin(false)
                  setSelectedSociety(null)
                  setSearchTerm("")
                }}
                className="btn btn-primary w-full"
              >
                Join {selectedSociety.name}
              </button>
            )}
          </div>
        </div>

        {/* Register New Society */}
        <div className="space-y-4">
          <h3 className="font-medium">Register New Society</h3>
          <button
            onClick={() => setShowRegisterForm(true)}
            className="btn btn-outline w-full"
          >
            Register Your Society
          </button>
        </div>

        {showRegisterForm && (
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Register Society Details</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label text-sm font-medium">Society Name</label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label text-sm font-medium">Address</label>
                <input
                  type="text"
                  required
                  value={registerForm.address}
                  onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-sm font-medium">Admin Name</label>
                  <input
                    type="text"
                    required
                    value={registerForm.adminName}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, adminName: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label text-sm font-medium">Admin Phone</label>
                  <input
                    type="tel"
                    required
                    value={registerForm.adminPhone}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, adminPhone: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Register Society
              </button>
            </form>
          </div>
        )}
      </div>
    )
  }

  // Society is linked - show dashboard based on role
  return (
    <div className="space-y-6">
      {/* Header with society info and role toggle (for demo) */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{society?.name}</h2>
          <p className="text-muted-foreground">{society?.address}</p>
        </div>
        {/* Demo: toggle admin role in profile - we'll show a button to toggle for demo */}
        <div className="space-x-2">
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className={cn(
              "btn btn-outline btn-sm",
              isAdmin ? "btn-primary" : "btn-secondary"
            )}
          >
            {isAdmin ? "Admin Mode" : "Resident Mode"}
          </button>
        </div>
      </div>

      {/* Tabs for Dashboard and Requests */}
      <div className="border rounded-lg">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "flex-1 py-2 text-sm font-medium",
              activeTab === "dashboard"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-muted"
            )}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={cn(
              "flex-1 py-2 text-sm font-medium",
              activeTab === "requests"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-muted"
            )}
          >
            Requests
          </button>
        </div>
      </div>

      {/* Dashboard Tab Content */}
      {activeTab === "dashboard" && (
        <div className="space-y-4">
          {isAdmin ? (
            <div className="space-y-4">
              <h3 className="font-medium">Post a Group Request</h3>
              <ButtonGroupRequestForm
                onPostRequest={handlePostRequest}
                society={society}
              />
              {/* Show active request if any */}
              {groupRequests.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Active Requests</h3>
                  {groupRequests.map((request) => (
                    <RequestCardAdmin
                      key={request.id}
                      request={request}
                      onSelectOffer={handleSelectOffer}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show notification if there's an open request */}
              {groupRequests.some((req) => req.status === "open") && (
                <div className="border-l-4 border-primary bg-primary/5 p-4">
                  <h3 className="font-medium">Your society has an open group request</h3>
                  <p className="mb-2">
                    {groupRequests
                      .filter((req) => req.status === "open")
                      .map((req) => `${req.category} — join for bulk pricing`)
                      .join(", ")}
                  </p>
                  <button
                    onClick={() => {
                      // Show details of the first open request
                      const openReq = groupRequests.find((req) => req.status === "open")
                      setSelectedRequest(openReq ?? null)
                    }}
                    className="btn btn-outline w-full"
                  >
                    View Details
                  </button>
                </div>
              )}

              {/* Show joined request status */}
              {joinedRequest && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">You've joined a request</h3>
                  <p>
                    You'll be notified once a shop is confirmed.
                  </p>
                </div>
              )}

              {/* List all requests for resident to join */}
              <h3 className="font-medium">Society Requests</h3>
              {groupRequests.map((request) => (
                <RequestCardResident
                  key={request.id}
                  request={request}
                  onJoinRequest={handleJoinRequest}
                  joinedRequestId={joinedRequest}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Requests Tab Content - shows all requests with details */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <h3 className="font-medium">All Requests</h3>
          {groupRequests.length === 0 ? (
            <p className="text-muted-foreground">No group requests yet.</p>
          ) : (
            <div className="space-y-4">
              {groupRequests.map((request) => (
                <RequestCardDetails
                  key={request.id}
                  request={request}
                  isAdmin={isAdmin}
                  society={society}
                  selectedRequest={selectedRequest}
                  onSelectRequest={setSelectedRequest}
                  onJoinRequest={handleJoinRequest}
                  onSelectOffer={handleSelectOffer}
                  offerSelected={offerSelected}
                  joinedRequestId={joinedRequest}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Component for admin to post a group request
function ButtonGroupRequestForm({
  onPostRequest,
  society,
}: {
  onPostRequest: (e: React.FormEvent) => void
  society: Society | null
}): React.ReactNode {
  const [form, setForm] = React.useState({
    category: "Pest Control",
    description: "",
    preferredDate: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onPostRequest(e)
    // Reset form
    setForm({ category: "Pest Control", description: "", preferredDate: "" })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
      <div>
        <label className="label text-sm font-medium">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="select select-bordered w-full"
        >
          <option value="Pest Control">Pest Control</option>
          <option value="Water Tank Cleaning">Water Tank Cleaning</option>
          <option value="Gardening">Gardening</option>
          <option value="Deep Cleaning">Deep Cleaning</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="label text-sm font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="textarea textarea-bordered h-20 w-full"
          placeholder="Describe the service needed..."
        />
      </div>
      <div>
        <label className="label text-sm font-medium">Preferred Date</label>
        <input
          type="date"
          value={form.preferredDate}
          onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
          className="input input-bordered w-full"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full">
        Post Request
      </button>
    </form>
  )
}

// Request card for admin view
function RequestCardAdmin({
  request,
  onSelectOffer,
}: {
  request: GroupRequest
  onSelectOffer: (offer: Offer) => void
}): React.ReactNode {
  const [selectedOffer, setSelectedOffer] = React.useState<Offer | null>(null)

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{request.category}</h3>
        <span className={cn("badge", request.status === "open" ? "badge-success" : "badge-error")}>
          {request.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        {request.description}
      </p>
      <p className="text-sm text-muted-foreground mb-2">
        Preferred Date: {request.preferredDate}
      </p>
      <p className="font-medium mb-2">
        {request.flatsJoined} flats have joined
      </p>

      {/* Show offers if any */}
      {request.offers.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Shop Offers</h4>
          {request.offers.map((offer: Offer) => (
            <div
              key={offer.id}
              className={cn("border rounded-lg p-3", offer.id === selectedOffer?.id ? "border-primary" : "")}
              onClick={() => {
                setSelectedOffer(offer)
                onSelectOffer(offer)
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium">{offer.shopName}</h5>
                  <p className="text-sm text-muted-foreground">
                    ₹{offer.pricePerFlat}/flat
                    {offer.minFlats ? ` (min ${offer.minFlats} flats)` : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* If no shows yet */}
      {request.offers.length === 0 && request.status === "open" && (
        <p className="text-muted-foreground italic">
          Waiting for shop offers...
        </p>
      )}
    </div>
  )
}

// Request card for resident view
function RequestCardResident({
  request,
  onJoinRequest,
  joinedRequestId,
}: {
  request: GroupRequest
  onJoinRequest: (requestId: string) => void
  joinedRequestId: string | null
}): React.ReactNode {
  const isJoined = joinedRequestId === request.id

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold">{request.category}</h3>
        <span className={cn("badge", request.status === "open" ? "badge-success" : "badge-error")}>
          {request.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        {request.description}
      </p>
      <p className="text-sm text-muted-foreground mb-2">
        Preferred Date: {request.preferredDate}
      </p>
      <p className="font-medium mb-2">
        {request.flatsJoined} flats have joined
      </p>

      {!isJoined && request.status === "open" && (
        <button
          onClick={() => onJoinRequest(request.id)}
          className="btn btn-primary w-full"
        >
          Join Request
        </button>
      )}

      {isJoined && (
        <p className="text-success text-sm mt-2">
          You've joined! Waiting for shop confirmation.
        </p>
      )}
    </div>
  )
}

// Detailed request card for requests tab
function RequestCardDetails({
  request,
  isAdmin,
  society,
  selectedRequest,
  onSelectRequest,
  onJoinRequest,
  onSelectOffer,
  offerSelected,
  joinedRequestId,
}: {
  request: GroupRequest
  isAdmin: boolean
  society: Society | null
  selectedRequest: GroupRequest | null
  onSelectRequest: (req: GroupRequest | null) => void
  onJoinRequest: (requestId: string) => void
  onSelectOffer: (offer: Offer) => void
  offerSelected: Offer | null
  joinedRequestId: string | null
}): React.ReactNode {
  const isSelected = selectedRequest?.id === request.id
  const isJoined = joinedRequestId === request.id

  return (
    <div
      className={cn("border rounded-lg p-4 hover:border-primary", isSelected ? "border-primary" : "")}
      onClick={() => onSelectRequest(request)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{request.category}</h3>
        <span className={cn(
          "badge",
          request.status === "open" ? "badge-success" : request.status === "closed" ? "badge-warning" : "badge-error"
        ) }>{request.status}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        {request.description}
      </p>
      <p className="text-sm text-muted-foreground mb-2">
        Preferred Date: {request.preferredDate}
      </p>
      <p className="font-medium mb-2">
        {request.flatsJoined} flats have joined
      </p>

      {/* Admin controls */}
      {isAdmin && request.status === "open" && (
        <div className="mt-4 pt-3 border-t">
          <h4 className="font-medium mb-2">Shop Offers</h4>
          {request.offers.length > 0 ? (
            <div className="space-y-2">
              {request.offers.map((offer: Offer) => (
                <div
                  key={offer.id}
                  className={cn(
                    "border rounded-lg p-3",
                    offer.id === offerSelected?.id ? "border-primary" : ""
                  )}
                  onClick={() => onSelectOffer(offer)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{offer.shopName}</h5>
                      <p className="text-sm text-muted-foreground">
                        ₹{offer.pricePerFlat}/flat
                        {offer.minFlats ? ` (min ${offer.minFlats} flats)` : ""}
                      </p>
                    </div>
                    {offerSelected?.id === offer.id && (
                      <span className="badge badge-success">Selected</span>
                    )}
                  </div>
                </div>
              ))}
              {offerSelected && request.selectedOffer && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      // In real app, close request and notify
                      alert("Request closed and shops notified!")
                    }}
                    className="btn btn-primary w-full"
                  >
                    Close & Send to Shops
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              No offers yet. Waiting for shops to respond...
            </p>
          )}
        </div>
      )}

      {/* Resident controls */}
      {!isAdmin && request.status === "open" && (
        <div className="mt-4 pt-3 border-t">
          {!isJoined && (
            <button
              onClick={() => onJoinRequest(request.id)}
              className="btn btn-primary w-full"
            >
              Join Request
            </button>
          )}
          {isJoined && (
            <p className="text-success text-sm">
              You've joined! Waiting for shop confirmation.
            </p>
          )}
        </div>
      )}

      {/* Closed/completed requests */}
      {(request.status === "closed" || request.status === "completed") && (
        <div className="mt-4 pt-3 border-t">
          <h4 className="font-medium mb-2">Request Closed</h4>
          {request.selectedOffer && (
            <div className="space-y-2">
              <p className="text-sm">
                Selected Shop: {request.selectedOffer.shopName}
              </p>
              <p className="text-sm">
                Price: ₹{request.selectedOffer.pricePerFlat}/flat
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}