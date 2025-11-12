import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trip } from '@/data/types';

interface MapComponentProps {
  trips: Trip[];
  selectedTripId?: string;
  onSelectTrip: (id: string) => void;
}

export default function MapComponent({ trips, selectedTripId, onSelectTrip }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([28.7041, 77.1025], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Clear existing markers
    map.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.current?.removeLayer(layer);
      }
    });

    // Add markers for each trip
    trips.forEach((trip) => {
      if (map.current) {
        const color =
          trip.status === 'In-Progress'
            ? '#1f6feb'
            : trip.status === 'Completed'
              ? '#17b26a'
              : '#f79009';

        const icon = L.circleMarker(
          [trip.currentLocation.lat, trip.currentLocation.lng],
          {
            radius: selectedTripId === trip.id ? 12 : 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }
        );

        icon.bindPopup(`
          <div class="p-2">
            <p class="font-semibold">${trip.id}</p>
            <p class="text-xs">${trip.status}</p>
            <p class="text-xs">${trip.metrics.progressPercent}% complete</p>
          </div>
        `);

        icon.on('click', () => onSelectTrip(trip.id));
        icon.addTo(map.current);

        // Draw route
        if (trip.plannedRoute.length > 0) {
          const latlngs = trip.plannedRoute.map((loc) => [loc.lat, loc.lng] as [number, number]);
          L.polyline(latlngs, {
            color: color,
            weight: 2,
            opacity: 0.6,
            dashArray: trip.status === 'In-Progress' ? '5, 5' : undefined,
          }).addTo(map.current);
        }
      }
    });
  }, [trips, selectedTripId, onSelectTrip]);

  return (
    <div ref={mapContainer} className="w-full h-full" />
  );
}
