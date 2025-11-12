import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trip } from '@/data/types';
import {
  initializeTripFromGPSEvents,
  updateSimulationWithNextEvent,
  calculateBearing,
  getJourneySummary,
  SimulationState,
  GPSEvent,
} from '@/data/mock/tripSimulationEngine';
import JourneyDetailsModal from './JourneyDetailsModal';

interface AdvancedRealtimeMapProps {
  trips: Trip[];
  gpsEventsData: GPSEvent[][];
}

interface TripSimulation {
  tripId: string;
  events: GPSEvent[];
  simulation: SimulationState;
  marker: L.Marker;
  traveledPolyline: L.Polyline;
  plannedPolyline: L.Polyline;
  animationIntervalId: number | null;
}

export default function AdvancedRealtimeMap({
  trips,
  gpsEventsData,
}: AdvancedRealtimeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tripSimulationsRef = useRef<Map<string, TripSimulation>>(new Map());
  const [selectedTrip, setSelectedTrip] = useState<{
    trip: Trip;
    summary: ReturnType<typeof getJourneySummary>;
  } | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [selectedSpeed, setSelectedSpeed] = useState<1 | 5 | 10>(1);

  // Create vehicle marker with direction indicator
  const createVehicleMarker = (
    trip: Trip,
    heading: number,
    isSelected: boolean
  ) => {
    const size = isSelected ? 56 : 40;
    const statusColor =
      trip.status === 'In-Progress'
        ? '#3b82f6'
        : trip.status === 'Completed'
          ? '#10b981'
          : '#ef4444';

    const html = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%);
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(${heading}deg);
        box-shadow:
          0 0 0 3px rgba(255,255,255,0.3),
          0 8px 16px rgba(0,0,0,0.2),
          0 0 25px ${statusColor}80;
        cursor: pointer;
        position: relative;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
        "></div>
        <div style="
          position: absolute;
          width: 2px;
          height: 14px;
          background: white;
          top: 2px;
        "></div>
      </div>
    `;

    return L.divIcon({
      html,
      iconSize: [size, size],
      className: 'vehicle-marker-icon',
      popupAnchor: [0, -(size / 2 + 20)],
    });
  };

  // Initialize map and trips
  useEffect(() => {
    if (!mapContainer.current || trips.length === 0 || gpsEventsData.length === 0) return;

    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Initialize trip simulations
    trips.forEach((trip, tripIndex) => {
      const gpsEvents = gpsEventsData[tripIndex];
      if (!gpsEvents || gpsEvents.length < 2) return;

      const { simulation } = initializeTripFromGPSEvents(gpsEvents);

      // Create start marker (green)
      L.circleMarker([trip.startLocation.lat, trip.startLocation.lng], {
        radius: 6,
        fillColor: '#10b981',
        color: '#fff',
        weight: 2,
        fillOpacity: 1,
      })
        .bindPopup('🟢 Trip Start')
        .addTo(map.current!);

      // Create end marker (red)
      L.circleMarker([trip.endLocation.lat, trip.endLocation.lng], {
        radius: 6,
        fillColor: '#ef4444',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8,
      })
        .bindPopup('🔴 Trip End')
        .addTo(map.current!);

      // Create planned route polyline (light gray, dashed)
      const plannedLatlngs = trip.plannedRoute.map(
        (loc) => [loc.lat, loc.lng] as [number, number]
      );
      const plannedPolyline = L.polyline(plannedLatlngs, {
        color: '#0066ffff',
        weight: 5,
        opacity: 1,
        dashArray: '5, 5',
      }).addTo(map.current!);

      // Create traveled route polyline (bold red)
      const traveledLatlngs = simulation.traveledPath.map(
        (loc) => [loc.lat, loc.lng] as [number, number]
      );
      const traveledPolyline = L.polyline(traveledLatlngs, {
        color: '#dc2626', // Bold red
        weight: 10, // Thicker line
        opacity: 1,
        className: 'traveled-route',
      }).addTo(map.current!);

      // Create vehicle marker
      const marker = L.marker(
        [simulation.currentLocation.lat, simulation.currentLocation.lng],
        {
          icon: createVehicleMarker(trip, 0, false),
          interactive: true,
        }
      )
        .on('click', () => {
          const summary = getJourneySummary(gpsEvents, simulation.currentEventIndex);
          setSelectedTrip({ trip, summary });
        })
        .addTo(map.current!);

      tripSimulationsRef.current.set(trip.id, {
        tripId: trip.id,
        events: gpsEvents,
        simulation,
        marker,
        traveledPolyline,
        plannedPolyline,
        animationIntervalId: null,
      });
    });

    // Fit bounds
    const allPoints: [number, number][] = [];
    trips.forEach((trip) => {
      trip.plannedRoute.forEach((loc) => {
        allPoints.push([loc.lat, loc.lng]);
      });
    });
    if (allPoints.length > 0 && map.current) {
      const bounds = L.latLngBounds(allPoints);
      map.current.fitBounds(bounds.pad(0.1));
    }

    return () => {
      tripSimulationsRef.current.forEach(({ animationIntervalId }) => {
        if (animationIntervalId) clearInterval(animationIntervalId);
      });
    };
  }, [trips, gpsEventsData]);

  // Play/Pause simulation
  const toggleSimulation = useCallback(() => {
    if (isSimulationRunning) {
      // Stop simulation
      tripSimulationsRef.current.forEach(({ animationIntervalId }) => {
        if (animationIntervalId) clearInterval(animationIntervalId);
      });
      setIsSimulationRunning(false);
    } else {
      // Start simulation
      tripSimulationsRef.current.forEach((tripSim) => {
        if (tripSim.animationIntervalId) clearInterval(tripSim.animationIntervalId);

        const intervalId = setInterval(() => {
          const currentSim = tripSimulationsRef.current.get(tripSim.tripId);
          if (!currentSim) return;

          if (currentSim.simulation.currentEventIndex >= currentSim.events.length - 1) {
            clearInterval(intervalId);
            setIsSimulationRunning(false);
            return;
          }

          // Update simulation
          const updatedSim = updateSimulationWithNextEvent(
            currentSim.simulation,
            currentSim.events
          );

          // Update marker position
          currentSim.marker.setLatLng([
            updatedSim.currentLocation.lat,
            updatedSim.currentLocation.lng,
          ]);

          // Calculate bearing for direction
          let heading = 0;
          if (
            updatedSim.currentEventIndex < currentSim.events.length - 1
          ) {
            const current = updatedSim.currentLocation;
            const next = {
              lat: currentSim.events[updatedSim.currentEventIndex + 1].location.lat,
              lng: currentSim.events[updatedSim.currentEventIndex + 1].location.lng,
            };
            heading = calculateBearing(current, next);
          }

          const trip = trips.find((t) => t.id === tripSim.tripId);
          if (trip) {
            currentSim.marker.setIcon(
              createVehicleMarker(trip, heading, false)
            );
          }

          // Update traveled polyline
          const traveledLatlngs = updatedSim.traveledPath.map(
            (loc) => [loc.lat, loc.lng] as [number, number]
          );
          currentSim.traveledPolyline.setLatLngs(traveledLatlngs);

          // Update simulation state in ref
          tripSimulationsRef.current.set(tripSim.tripId, {
            ...currentSim,
            simulation: updatedSim,
          });
        }, 1000 / selectedSpeed); // Adjust interval based on speed

        tripSim.animationIntervalId = intervalId;
      });

      setIsSimulationRunning(true);
    }
  }, [isSimulationRunning, selectedSpeed, trips]);

  return (
    <>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 z-10 max-w-xs">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          🚗 Fleet Simulation
        </h3>

        {/* Play/Pause */}
        <button
          onClick={toggleSimulation}
          className={`w-full px-4 py-2 rounded-lg font-medium text-white transition-colors mb-3 ${
            isSimulationRunning
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-brand hover:bg-blue-600'
          }`}
        >
          {isSimulationRunning ? '⏸ Pause' : '▶ Play'}
        </button>

        {/* Speed Controls */}
        <div className="space-y-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Speed:</p>
          <div className="flex gap-2">
            {[1, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSpeed(s as 1 | 5 | 10)}
                disabled={isSimulationRunning}
                className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedSpeed === s
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            🔴 Bold Red = Traveled Distance
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            ⚪ Dashed = Planned Route
          </p>
        </div>
      </div>

      {/* Journey Details Modal */}
      {selectedTrip && (
        <JourneyDetailsModal
          trip={selectedTrip.trip}
          summary={selectedTrip.summary}
          onClose={() => setSelectedTrip(null)}
        />
      )}
    </>
  );
}
