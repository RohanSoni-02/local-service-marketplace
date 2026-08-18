"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shop } from '@/lib/mock-data';
import { shops as allShops } from '@/lib/mock-data';

const categoryColors: Record<string, string> = {
  plumber: '#0F5B4C',
  electrician: '#F97316',
  carpenter: '#8B5CF6',
  'ac-repair': '#EF4444',
  hardware: '#10B981',
  'tool-rental': '#6366F1',
  painter: '#EC4899',
  appliance: '#F59E0B',
};

function createDotIcon(color: string, size: number) {
  return L.divIcon({
    className: '',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function clearLeafletContainer(container: HTMLDivElement) {
  const el = container as HTMLDivElement & { _leaflet_id?: number };
  if (el._leaflet_id != null) {
    delete el._leaflet_id;
  }
}

export default function MapView({ shops: shopsProp }: { shops?: Shop[] } = {}) {
  const { id: categoryId } = useParams<{ id?: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const shops = useMemo(() => {
    if (shopsProp !== undefined) return shopsProp;
    return allShops.filter(
      (shop) => !categoryId || categoryId === '' || shop.categoryId === categoryId
    );
  }, [categoryId, shopsProp]);

  const { center, zoom } = useMemo(() => {
    if (shops.length > 0) {
      const totalLat = shops.reduce((sum, shop) => sum + shop.latitude, 0);
      const totalLng = shops.reduce((sum, shop) => sum + shop.longitude, 0);
      if (!isNaN(totalLat) && !isNaN(totalLng)) {
        return {
          center: [totalLat / shops.length, totalLng / shops.length] as [number, number],
          zoom: 13,
        };
      }
    }
    return { center: [28.6139, 77.2090] as [number, number], zoom: 12 };
  }, [shops]);

  const shopsKey = useMemo(
    () => shops.map((s) => s.id).sort().join(','),
    [shops]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    clearLeafletContainer(container);

    const map = L.map(container, { scrollWheelZoom: false }).setView(center, zoom);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    if (!categoryId || categoryId === 'tool-rental') {
      L.marker([28.6139, 77.2090], { icon: createDotIcon('#0F5B4C', 16) })
        .addTo(map)
        .bindPopup('<div class="text-center"><h3 class="font-semibold">Your Location</h3><p class="text-sm">Search center</p></div>');
    }

    shops.forEach((shop) => {
      const color = categoryColors[shop.categoryId] || '#6B7280';
      const marker = L.marker([shop.latitude, shop.longitude], {
        icon: createDotIcon(color, 12),
      }).addTo(map);

      marker.bindPopup(`
        <div class="w-48">
          <img src="${shop.photo}" alt="${shop.name}" class="w-full h-24 object-cover rounded-t" />
          <div class="px-3 py-2">
            <h3 class="font-semibold">${shop.name}</h3>
            <p class="text-sm text-muted-foreground">${shop.categoryId.replace('-', ' ')}</p>
            <p class="mt-1 text-sm">${shop.rating} ⭐ (${shop.jobsCompleted} jobs)</p>
          </div>
        </div>
      `);

      marker.on('popupopen', () => setSelectedShop(shop));
    });

    return () => {
      map.remove();
      mapRef.current = null;
      clearLeafletContainer(container);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- shopsKey tracks shop identity; shops read from closure
  }, [shopsKey, center, zoom, categoryId]);

  return (
    <div className="relative h-[400px] w-full">
      <div ref={containerRef} className="h-full w-full" />

      {selectedShop && (
        <div className="absolute bottom-0 left-0 right-0 h-[70%] bg-card shadow-xl border-t-2 border-border">
          <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-background/50">
            <h2 className="font-heading text-[19px] font-bold text-foreground">{selectedShop.name}</h2>
            <button
              onClick={() => setSelectedShop(null)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/20 rounded p-1"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedShop.photo}
                  alt={selectedShop.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{selectedShop.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedShop.categoryId.replace('-', ' ')} • {selectedShop.distanceKm}km away
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>⭐ {selectedShop.rating}</span>
                <span>•</span>
                <span>{selectedShop.jobsCompleted} jobs</span>
                <span>•</span>
                <span>{selectedShop.tier}</span>
              </div>

              <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                {selectedShop.bio}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <span>⏰</span>
                  <span>{selectedShop.hours}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span>📍</span>
                  <span>Serves within {selectedShop.serviceRadiusKm}km</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    console.log('View shop details for:', selectedShop.id);
                  }}
                  className="w-full rounded-2xl bg-primary px-4 py-3 font-heading text-[14px] font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  View Shop Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
