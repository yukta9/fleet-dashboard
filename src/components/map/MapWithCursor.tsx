import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trip } from '@/data/types';

interface MapWithCursorProps {
  trips: Trip[];
  selectedTripId?: string;
  onSelectTrip: (id: string) => void;
}

// Custom cursor icon for vehicle
const createVehicleMarker = (heading: number, isSelected: boolean) => {
  const size = isSelected ? 48 : 32;
  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, #1f6feb 0%, #0b2d61 100%);
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(${heading}deg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px rgba(31, 111, 235, 0.3);
      cursor: pointer;
      position: relative;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      "></div>
      <div style="
        position: absolute;
        width: 2px;
        height: 12px;
        background: white;
        top: 4px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    iconSize: [size, size],
    className: 'vehicle-marker',
    popupAnchor: [0, -size / 2],
  });
};

const createStatusIcon = (status: string) => {
  const colors: Record<string, string> = {
    'In-Progress': '#1f6feb',
    'Completed': '#17b26a',
    'Cancelled': '#f04438',
    'Planned': '#f79009',
    'Error': '#f04438',
  };

  return L.circleMarker([0, 0], {
    radius: 8,
    fillColor: colors[status] || '#1f6feb',
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8,
  });
};

export default function MapWithCursor({
  trips,
  selectedTripId,
  onSelectTrip,
}: MapWithCursorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<Map<string, L.Polyline>>(new Map());

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([40.7128, -74.006], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Clear existing markers and polylines
    markersRef.current.forEach((marker) => map.current?.removeLayer(marker));
    polylineRef.current.forEach((line) => map.current?.removeLayer(line));
    markersRef.current.clear();
    polylineRef.current.clear();

    // Add trip markers and routes
    trips.forEach((trip) => {
      if (!map.current) return;

      const isSelected = selectedTripId === trip.id;

      // Determine heading from route direction
      let heading = 0;
      if (trip.plannedRoute.length >= 2) {
        const lastLoc = trip.plannedRoute[trip.plannedRoute.length - 1];
        const prevLoc = trip.plannedRoute[trip.plannedRoute.length - 2];
        heading = Math.atan2(
          lastLoc.lng - prevLoc.lng,
          lastLoc.lat - prevLoc.lat
        ) * (180 / Math.PI);
      }

      // Create vehicle marker with directional arrow
      const marker = L.marker(
        [trip.currentLocation.lat, trip.currentLocation.lng],
        {
          icon: createVehicleMarker(heading, isSelected),
          draggable: false,
        }
      );

      const popupContent = `
        <div style="font-size: 12px; max-width: 200px;">
          <strong>${trip.id}</strong><br/>
          Status: <span style="color: ${trip.status === 'In-Progress' ? '#1f6feb' : trip.status === 'Completed' ? '#17b26a' : '#f04438'}">${trip.status}</span><br/>
          Progress: <strong>${trip.metrics.progressPercent}%</strong><br/>
          Speed: <strong>${trip.metrics.avgSpeed} km/h</strong><br/>
          Distance: <strong>${trip.metrics.distanceTravelled.toFixed(0)} / ${trip.metrics.plannedDistance.toFixed(0)} km</strong>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => onSelectTrip(trip.id));
      marker.addTo(map.current);

      markersRef.current.set(trip.id, marker);

      // Draw route with color based on status
      if (trip.plannedRoute.length > 0) {
        const color =
          trip.status === 'In-Progress'
            ? '#1f6feb'
            : trip.status === 'Completed'
              ? '#17b26a'
              : trip.status === 'Cancelled'
                ? '#f04438'
                : '#f79009';

        const latlngs = trip.plannedRoute.map((loc) => [loc.lat, loc.lng] as [number, number]);
        const polyline = L.polyline(latlngs, {
          color,
          weight: isSelected ? 3 : 2,
          opacity: isSelected ? 0.9 : 0.6,
          dashArray: trip.status === 'In-Progress' ? '5, 5' : undefined,
        });

        polyline.addTo(map.current);
        polylineRef.current.set(trip.id, polyline);
      }

      // Add start and end markers
      L.circleMarker([trip.startLocation.lat, trip.startLocation.lng], {
        radius: 5,
        fillColor: '#4ade80',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      })
        .bindPopup('Start Point')
        .addTo(map.current);

      L.circleMarker([trip.endLocation.lat, trip.endLocation.lng], {
        radius: 5,
        fillColor: '#ef4444',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      })
        .bindPopup('End Point')
        .addTo(map.current);
    });

    // Fit all markers in view if available
    if (trips.length > 0 && markersRef.current.size > 0) {
      const group = L.featureGroup(Array.from(markersRef.current.values()));
      map.current?.fitBounds(group.getBounds().pad(0.1));
    }
  }, [trips, selectedTripId, onSelectTrip]);

  return (
    <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden">
      {/* Cursor indicator overlay */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 400,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Fleet Tracking</div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          {trips.length} trips • {trips.filter((t) => t.status === 'In-Progress').length} active
        </div>
      </div>
    </div>
  );
}
