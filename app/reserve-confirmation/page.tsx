"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getShop } from "@/lib/mock-data";
import Link from "next/link";

export default function ReserveConfirmationPage() {
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId") || "";
  const productName = searchParams.get("productName") || "";
  const price = parseFloat(searchParams.get("price") || "0");
  const stock = parseInt(searchParams.get("stock") || "0");
  const action = searchParams.get("action") || "pickup"; // pickup or delivery

  const shop = getShop(shopId);

  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60); // 2 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!shop) {
    return (
      <div className="flex flex-col items-center py-12">
        <h2 className="text-[20px] font-semibold text-foreground mb-4">
          Shop not found
        </h2>
        <p className="text-[14px] text-muted-foreground mb-6">
          Please try again.
        </p>
        <Link href="/" className="rounded-2xl border border-border bg-card px-4 py-3 text-muted-foreground shadow-sm">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6 pt-3">
      <div className="flex flex-col gap-1 px-4">
        <h1 className="font-heading text-[22px] font-bold leading-tight text-foreground">
          Reservation Confirmed
        </h1>
        <p className="text-[13px] text-muted-foreground">
          Your {productName} has been reserved
        </p>
      </div>

      <div className="px-4">
        <div className="space-y-4">
          {/* Reservation Details */}
          <div className="bg-primary/5 rounded-xl p-4">
            <h2 className="font-heading text-[18px] font-semibold text-primary">
              Reserved at {shop.name}
            </h2>
            <p className="text-[13px] text-primary/80 mb-2">
              hold for 2 hours
            </p>
            <div className="text-[12px] text-primary/80 space-y-1">
              <div>
                <span className="font-medium">Product:</span> {productName}
              </div>
              <div>
                <span className="font-medium">Price:</span> ₹{price}
              </div>
              <div>
                <span className="font-medium">Shop:</span> {shop.name}
              </div>
              <div>
                <span className="font-medium">Address:</span> {shop.pincode}, {shop.city || "Local Area"}
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="text-center">
            <h2 className="font-heading text-[20px] font-semibold text-foreground">
              Time Left: {formatTime(timeLeft)}
            </h2>
            {timeLeft <= 0 && (
              <p className="text-[13px] text-destructive mt-2">
                Reservation expired
              </p>
            )}
          </div>

          {/* Get Directions Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                // In a real app, this would open maps
                alert("Opening directions to " + shop.name);
              }}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-muted-foreground shadow-sm"
            >
              Get Directions
            </button>
          </div>

          {/* Action-specific content */}
          {action === "delivery" && (
            <div className="mt-6">
              <h2 className="text-[18px] font-semibold text-foreground mb-2">
                Delivery Option Selected
              </h2>
              <p className="text-[14px] text-muted-foreground">
                Your {productName} will be delivered to your location. Standard delivery charges apply.
              </p>
              <div className="mt-4">
                <Link
                  href="/"
                  className="w-full flex-1 py-2 px-3 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Continue to Home
                </Link>
              </div>
            </div>
          )}

          {action === "pickup" && (
            <div className="mt-6">
              <h2 className="text-[18px] font-semibold text-foreground mb-2">
                Pickup Instructions
              </h2>
              <p className="text-[14px] text-muted-foreground">
                Please visit the shop within the reservation period to collect your item.
                Bring this confirmation and a valid ID.
              </p>
              <div className="mt-4">
                <Link
                  href="/"
                  className="w-full flex-1 py-2 px-3 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Done
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}