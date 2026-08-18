"use client";

import { notFound } from "next/navigation";
import { FlowHeader } from "@/components/flow-header";
import { ShopCard } from "@/components/shop-card";
import { CategoryIcon } from "@/components/category-icon"
import dynamic from "next/dynamic"
import { useState } from "react"

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false })

interface CategoryPageContentProps {
  category: {
    id: string;
    name: string;
    icon: string;
  };
  shopList: Array<{
    id: string;
    name: string;
    categoryId: string;
    rating: number;
    jobsCompleted: number;
    tier: "Gold Verified" | "Verified" | "New";
    distanceKm: number;
    photo: string;
    gallery: string[];
    bio: string;
    hours: string;
    serviceRadiusKm: number;
    pincode: string;
    reviews: Array<{
      id: string;
      author: string;
      rating: number;
      text: string;
      daysAgo: number;
    }>;
    latitude: number;
    longitude: number;
  }>;
}

export default function CategoryPageContent({ category, shopList }: CategoryPageContentProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <FlowHeader title={category.name} subtitle={`${shopList.length} shops near 110024`} />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {shopList.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <CategoryIcon icon={category.icon} className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">No shops found nearby for this category yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-4">
              <h2 className="font-heading text-[15px] font-semibold text-foreground">{category.name} shops</h2>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-medium text-primary">Sort by rating</span>
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
              <div className="flex flex-col gap-3">
                {shopList.map((shop, index) => (
                  <ShopCard key={shop.id} shop={shop} variant="list" priority={index === 0} />
                ))}
              </div>
            ) : (
              <MapView shops={shopList} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}