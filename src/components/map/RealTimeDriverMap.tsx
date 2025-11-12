import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  initializeTripTracking,
  advanceToNextEvent,
  calculateBearing,
  getTripSummary,
  TripTrackingState,
  GPSEvent,
} from '@/data/mock/realtimeTrackingEngine';
import TripChip from './TripChip';
import TripDetailModal from './TripDetailModal';

interface Trip {
  id: string;
  name: string;
  color: string;
  events: GPSEvent[];
}

interface RealTimeDriverMapProps {
  trips: Trip[];
}

export default function RealTimeDriverMap({ trips }: RealTimeDriverMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, { marker: L.Marker; traveledPolyline: L.Polyline; remainingPolyline: L.Polyline }>>(new Map());
  const intervalsRef = useRef<Map<string, number>>(new Map());
  const stateRef = useRef<Map<string, TripTrackingState>>(new Map());
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripStates, setTripStates] = useState<Map<string, TripTrackingState>>(new Map());

  // Create vehicle marker using driver icon
  const createVehicleMarker = (heading: number) => {
    return L.icon({
      iconUrl: '/assets/driver.png',
      iconSize: [48, 36],
      iconAnchor: [24, 18],
      popupAnchor: [0, -18],
      className: `vehicle-marker rotate-[${heading}deg]`,
    });
  };

  // Create location marker icon for end point
  const createLocationMarker = () => {
    return L.icon({
      iconUrl: '/assets/location.png',
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -48],
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Initialize tracking for each trip
    trips.forEach((trip) => {
      if (trip.events.length < 2) return;

      const firstEvent = trip.events[0];
      const lastEvent = trip.events[trip.events.length - 1];
      const totalDistance = lastEvent.distance_travelled_km || 1000;

      // Initialize state
      const state = initializeTripTracking(trip.id, firstEvent, totalDistance);
      stateRef.current.set(trip.id, state);

      // Create start marker (green circle)
      L.circleMarker([firstEvent.location.lat, firstEvent.location.lng], {
        radius: 6,
        fillColor: '#10b981',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8,
      })
        .bindPopup(`🟢 ${trip.name} Start`)
        .addTo(map.current!);

      // Create end marker using location icon (red pin)
      L.marker([lastEvent.location.lat, lastEvent.location.lng], {
        icon: createLocationMarker(),
        interactive: true,
      })
        .bindPopup(`📍 ${trip.name} End`)
        .addTo(map.current!);

      // Create vehicle marker using driver icon
      const marker = L.marker(
        [state.currentLocation.lat, state.currentLocation.lng],
        {
          icon: createVehicleMarker(0),
          interactive: true,
        }
      )
        .on('click', () => setSelectedTrip(trip))
        .addTo(map.current!);

      // Create polyline for traveled route (dark gray #575757)
      const traveledPolyline = L.polyline(
        [[state.currentLocation.lat, state.currentLocation.lng]],
        {
          color: '#575757', // Dark gray for traveled
          weight: 5,
          opacity: 0.9,
          className: 'traveled-route',
        }
      ).addTo(map.current!);

      // Create polyline for remaining route (blue #0066ff)
      const remainingRoute = trip.events.slice(0);
      const remainingPolyline = L.polyline(
        remainingRoute.map((e) => [e.location.lat, e.location.lng]),
        {
          color: '#0066ff', // Blue for remaining
          weight: 3,
          opacity: 0.6,
          dashArray: '5, 5',
          className: 'remaining-route',
        }
      ).addTo(map.current!);

      // Create planned route (light gray dashed reference)
      L.polyline(
        trip.events.map((e) => [e.location.lat, e.location.lng]),
        {
          color: '#d1d5db',
          weight: 2,
          opacity: 0.2,
          dashArray: '10, 5',
        }
      ).addTo(map.current!);

      markersRef.current.set(trip.id, { marker, traveledPolyline, remainingPolyline });
    });

    // Fit bounds
    if (trips.length > 0) {
      const allPoints: [number, number][] = [];
      trips.forEach((trip) => {
        trip.events.forEach((e) => {
          allPoints.push([e.location.lat, e.location.lng]);
        });
      });
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        map.current?.fitBounds(bounds.pad(0.1));
      }
    }
  }, [trips]);

  // Start real-time tracking with setInterval(3000)
  useEffect(() => {
    trips.forEach((trip) => {
      if (trip.events.length < 2) return;

      const intervalId = window.setInterval(() => {
        const currentState = stateRef.current.get(trip.id);
        if (!currentState) return;

        // Advance to next event
        const newState = advanceToNextEvent(currentState, trip.events, currentState.metrics.totalDistance);
        stateRef.current.set(trip.id, newState);

        // Update React state for modal
        setTripStates((prev) => new Map(prev).set(trip.id, newState));

        // Get marker and polylines
        const markerData = markersRef.current.get(trip.id);
        if (!markerData || !map.current) return;

        // Update marker position
        markerData.marker.setLatLng([newState.currentLocation.lat, newState.currentLocation.lng]);

        // Calculate heading
        let heading = 0;
        if (newState.currentIndex < trip.events.length - 1) {
          const next = trip.events[newState.currentIndex + 1];
          heading = calculateBearing(newState.currentLocation, next.location);
        }

        // Update marker icon with heading (rotate CSS)
        markerData.marker.setIcon(createVehicleMarker(heading));

        // Update traveled polyline (dark gray)
        const traveledLatlngs = newState.traveledPath.map(
          (loc) => [loc.lat, loc.lng] as [number, number]
        );
        markerData.traveledPolyline.setLatLngs(traveledLatlngs);

        // Update remaining polyline (blue)
        const remainingLatlngs = trip.events
          .slice(newState.currentIndex)
          .map((e) => [e.location.lat, e.location.lng] as [number, number]);
        markerData.remainingPolyline.setLatLngs(remainingLatlngs);
      }, 3000); // 3 second interval as required

      intervalsRef.current.set(trip.id, intervalId);
    });

    return () => {
      intervalsRef.current.forEach((interval) => clearInterval(interval));
    };
  }, [trips]);

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Left Side Trip Chips */}
      <div className="absolute left-4 top-4 flex flex-col gap-3 z-10 max-h-[calc(100vh-32px)] overflow-y-auto">
        {trips.map((trip) => (
          <TripChip
            key={trip.id}
            trip={trip}
            state={tripStates.get(trip.id)}
            onClick={() => setSelectedTrip(trip)}
          />
        ))}
      </div>

      {/* Trip Detail Modal */}
      {selectedTrip && tripStates.get(selectedTrip.id) && (
        <TripDetailModal
          trip={selectedTrip}
          state={tripStates.get(selectedTrip.id)!}
          onClose={() => setSelectedTrip(null)}
        />
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 text-sm z-10">
        <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: '#575757' }}></div>
            <span className="text-gray-700 dark:text-gray-300">Traveled Distance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: '#0066ff' }}></div>
            <span className="text-gray-700 dark:text-gray-300">Remaining Distance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
