"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { InventoryItem } from "@/lib/mock-data";
import { getShop } from "@/lib/mock-data";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StockResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const router = useRouter();

  if (query.trim() === "") {
    return (
      <div className="flex flex-col items-center py-12">
        <h2 className="text-[20px] font-semibold text-foreground mb-4">
          Search for a part or tool
        </h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Enter a search term above to see stock availability at nearby shops.
        </p>
        <Link
          href="/"
          className="rounded-2xl border border-border bg-card px-4 py-3 text-muted-foreground shadow-sm"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Get all inventory and filter by query
  const allInventory = (window as any).__INVENTORY_MOCK__ || [];
  const inventoryItems = allInventory
    .filter(
      (item: InventoryItem) =>
        item.productName.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    )
    .map((item: InventoryItem) => {
      const shop = getShop(item.shopId);
      if (!shop) return null;
      return {
        ...item,
        shop,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.shop.distanceKm - b.shop.distanceKm);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  if (inventoryItems.length === 0) {
    return (
      <div className="flex flex-col items-center py-12">
        <h2 className="text-[20px] font-semibold text-foreground mb-4">
          No results for "{query}"
        </h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Try a different search or scan a photo of the part.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-muted-foreground shadow-sm"
          >
            Back to Home
          </button>
          <button
            onClick={() => {
              const term = query || "15mm pipe joint";
              router.push(`/stock-results?query=${encodeURIComponent(term)}`);
            }}
            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6 pt-3">
      <div className="flex flex-col gap-1 px-4">
        <h1 className="font-heading text-[22px] font-bold leading-tight text-foreground">
          Stock Check Results
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Showing results for "{query}"
        </p>
      </div>

      {/* Map/List Toggle */}
      <div className="px-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-primary">within 5 km</span>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          >
            {viewMode === 'map' ? (
              <span className="lucide-icon list-icon">⎇</span>
            ) : (
              <span className="lucide-icon map-icon">🗺️</span>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {inventoryItems.map((item) => (
            <StockResultItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="px-4">
          {/* For map view, we'll reuse the existing MapView component but we need to pass shops with inventory data? */}
          {/* We'll create a simplified version that just shows shop locations */}
          <div id="map-view" className="h-[300px] rounded-2xl overflow-hidden">
            {/* We'll just show a placeholder for now, since modifying MapView is out of scope */}
            <div className="flex h-full items-center justify-center bg-muted/50">
              <span className="text-[14px] text-muted-foreground">
                Map view showing shop locations
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StockResultItem({ item }: { item: any }) {
  const { productName, productPhoto, price, stock, shop } = item;

  const getStockBadge = () => {
    if (stock > 10) {
      return {
        text: "In Stock",
        color: "text-green-600 bg-green-50",
      };
    } else if (stock > 0) {
      return {
        text: `Low Stock — ${stock} left`,
        color: "text-yellow-600 bg-yellow-50",
      };
    } else {
      return {
        text: "Out of Stock",
        color: "text-red-600 bg-red-50",
      };
    }
  };

  const { text: badgeText, color: badgeColor } = getStockBadge();

  return (
    <Link
      href={`/reserve-confirmation?shopId=${shop.id}&productName=${encodeURIComponent(
        productName
      )}&price=${price}&stock=${stock}`}
      className="flex-shrink-0 w-[120px] flex flex-col gap-4"
    >
      <div className="flex flex-col items-center gap-3 p-4 bg-card rounded-xl border shadow-sm">
        {/* Product Image */}
        <div className="w-16 h-16 flex items-center justify-center bg-muted/50 rounded-lg">
          {/* We'll use a placeholder image since we don't have actual images */}
          <img
            src={productPhoto || "/placeholder.png"}
            alt={productName}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Product Name */}
        <div className="text-center text-[12px] font-medium text-foreground">
          {productName}
        </div>

        {/* Stock Badge */}
        <div
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}
        >
          {badgeText}
        </div>

        {/* Price */}
        {stock > 0 && (
          <div className="text-[12px] font-semibold text-foreground">
            ₹{price}
          </div>
        )}

        {/* Shop Info */}
        <div className="flex flex-col items-center gap-1 mt-2">
          <div className="text-[11px] font-medium text-foreground">
            {shop.name}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {shop.distanceKm.toFixed(1)} km away
          </div>
        </div>

        {/* Action Buttons - only show if in stock */}
        {stock > 0 && (
          <div className="flex flex-col gap-2 w-full mt-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                // Navigate to reserve confirmation with action=pickup
                router.push(
                  `/reserve-confirmation?shopId=${shop.id}&productName=${encodeURIComponent(
                    productName
                  )}&price=${price}&stock=${stock}&action=pickup`
                );
              }}
              className="w-full flex-1 py-2 px-3 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Reserve for Pickup
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Navigate to reserve confirmation with action=delivery
                router.push(
                  `/reserve-confirmation?shopId=${shop.id}&productName=${encodeURIComponent(
                    productName
                  )}&price=${price}&stock=${stock}&action=delivery`
                );
              }}
              className="w-full flex-1 py-2 px-3 rounded-lg text-[11px] font-semibold bg-border hover:bg-muted/50 text-muted-foreground border border-border"
            >
              Get it Delivered
            </button>
          </div>
        )}

        {/* Show message if out of stock */}
        {stock === 0 && (
          <div className="text-[10px] text-muted-foreground italic mt-4">
            Currently unavailable
          </div>
        )}
      </div>
    </Link>
  );
}