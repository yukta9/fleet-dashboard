import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trip } from '@/data/types';
import { calculateHeading, getPositionAtProgress } from '@/data/mock/assessmentDataTransformer';
import TripDetailPopup from './TripDetailPopup';

interface RealtimeFleetMapProps {
  trips: Trip[];
}

interface VehicleMarker {
  marker: L.Marker;
  polyline: L.Polyline;
  animationFrame: number;
  currentProgress: number;
}

export default function RealtimeFleetMap({ trips }: RealtimeFleetMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<string, VehicleMarker>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedTripLocation, setSelectedTripLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Create animated vehicle marker
  const createVehicleMarker = (trip: Trip, heading: number, isSelected: boolean) => {
    const size = isSelected ? 56 : 40;
    const html = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, ${getStatusColor(trip.status)} 0%, ${getStatusColorDark(trip.status)} 100%);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(${heading}deg);
        box-shadow:
          0 0 0 3px rgba(255,255,255,0.3),
          0 8px 16px rgba(0,0,0,0.2),
          0 0 20px ${getStatusGlow(trip.status)};
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          box-shadow: inset 0 0 3px rgba(0,0,0,0.2);
        "></div>
        <div style="
          position: absolute;
          width: 2px;
          height: 14px;
          background: white;
          top: 3px;
        "></div>
      </div>
    `;

    return L.divIcon({
      html,
      iconSize: [size, size],
      className: 'vehicle-marker-animated',
      popupAnchor: [0, -(size / 2 + 20)],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In-Progress':
        return '#3b82f6';
      case 'Completed':
        return '#10b981';
      case 'Cancelled':
        return '#ef4444';
      case 'Error':
        return '#f97316';
      default:
        return '#6b7280';
    }
  };

  const getStatusColorDark = (status: string) => {
    switch (status) {
      case 'In-Progress':
        return '#1f6feb';
      case 'Completed':
        return '#059669';
      case 'Cancelled':
        return '#dc2626';
      case 'Error':
        return '#ea580c';
      default:
        return '#4b5563';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'In-Progress':
        return 'rgba(59, 130, 246, 0.5)';
      case 'Completed':
        return 'rgba(16, 185, 129, 0.5)';
      case 'Cancelled':
        return 'rgba(239, 68, 68, 0.5)';
      default:
        return 'rgba(100, 100, 100, 0.3)';
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !trips.length) return;

    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Clear existing markers
    vehicleMarkersRef.current.forEach(({ marker, polyline }) => {
      map.current?.removeLayer(marker);
      map.current?.removeLayer(polyline);
    });
    vehicleMarkersRef.current.clear();

    // Add trip routes and initialize markers
    trips.forEach((trip) => {
      if (!map.current) return;

      // Draw route line
      if (trip.plannedRoute.length > 1) {
        const latlngs = trip.plannedRoute.map((loc) => [loc.lat, loc.lng] as [number, number]);
        const polyline = L.polyline(latlngs, {
          color: getStatusColor(trip.status),
          weight: 2,
          opacity: 0.5,
          dashArray: trip.status === 'In-Progress' ? '5, 5' : undefined,
        }).addTo(map.current);

        // Add start marker (green)
        L.circleMarker([trip.startLocation.lat, trip.startLocation.lng], {
          radius: 6,
          fillColor: '#10b981',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .bindPopup('Trip Start')
          .addTo(map.current);

        // Add end marker (red)
        L.circleMarker([trip.endLocation.lat, trip.endLocation.lng], {
          radius: 6,
          fillColor: '#ef4444',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .bindPopup('Trip End')
          .addTo(map.current);

        // Create vehicle marker
        const initialPos = getPositionAtProgress(trip.plannedRoute, trip.metrics.progressPercent);
        const heading = trip.plannedRoute.length > 1
          ? calculateHeading(trip.plannedRoute[0], trip.plannedRoute[1])
          : 0;

        const marker = L.marker(
          [initialPos.lat, initialPos.lng],
          { icon: createVehicleMarker(trip, heading, false), interactive: true }
        )
          .on('click', () => {
            setSelectedTrip(trip);
            setSelectedTripLocation({ lat: initialPos.lat, lng: initialPos.lng });
          })
          .addTo(map.current);

        vehicleMarkersRef.current.set(trip.id, {
          marker,
          polyline,
          animationFrame: 0,
          currentProgress: trip.metrics.progressPercent,
        });
      }
    });

    // Fit bounds
    if (trips.length > 0) {
      const allPoints: [number, number][] = [];
      trips.forEach((trip) => {
        trip.plannedRoute.forEach((loc) => {
          allPoints.push([loc.lat, loc.lng]);
        });
      });
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        map.current?.fitBounds(bounds.pad(0.1));
      }
    }
  }, [trips]);

  // Animate vehicle markers
  useEffect(() => {
    const animate = () => {
      vehicleMarkersRef.current.forEach((vehicleData, tripId) => {
        const trip = trips.find((t) => t.id === tripId);
        if (!trip) return;

        // Increment progress slowly for continuous animation
        vehicleData.currentProgress += 0.001; // Adjust speed here
        if (vehicleData.currentProgress > 100) {
          vehicleData.currentProgress = trip.metrics.progressPercent;
        }

        // Get position at current progress
        const newPos = getPositionAtProgress(trip.plannedRoute, vehicleData.currentProgress);

        // Calculate heading
        let heading = 0;
        if (trip.plannedRoute.length > 1) {
          const nextProgress = Math.min(vehicleData.currentProgress + 0.5, 100);
          const nextPos = getPositionAtProgress(trip.plannedRoute, nextProgress);
          heading = calculateHeading(
            { lat: newPos.lat, lng: newPos.lng },
            { lat: nextPos.lat, lng: nextPos.lng }
          );
        }

        // Update marker
        vehicleData.marker.setLatLng([newPos.lat, newPos.lng]);
        vehicleData.marker.setIcon(
          createVehicleMarker(trip, heading, selectedTrip?.id === trip.id)
        );
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [trips, selectedTrip]);

  return (
    <>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Trip Detail Popup */}
      {selectedTrip && selectedTripLocation && (
        <TripDetailPopup
          trip={selectedTrip}
          location={selectedTripLocation}
          onClose={() => {
            setSelectedTrip(null);
            setSelectedTripLocation(null);
          }}
        />
      )}
    </>
  );
}
