import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrips } from '@/features/trips/tripsSlice';
import { RootState, AppDispatch } from '@/app/store';
import { useTheme } from '@/hooks/useTheme';
import AdvancedRealtimeMap from '@/components/map/AdvancedRealtimeMap';
import '@/styles/globals.css';

import { GPSEvent } from '@/data/mock/tripSimulationEngine';

const TRIP_FILES = [
  '/data/trip_1_cross_country.json',
  '/data/trip_2_urban_dense.json',
  '/data/trip_3_mountain_cancelled.json',
  '/data/trip_4_southern_technical.json',
  '/data/trip_5_regional_logistics.json',
];

export default function AppAdvanced() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const trips = useSelector((state: RootState) => state.trips.data);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gpsEventsData, setGpsEventsData] = useState<GPSEvent[][]>([]);

  useEffect(() => {
    const loadGPSData = async () => {
      try {
        const allGpsEvents = await Promise.all(
          TRIP_FILES.map(async (file) => {
            const response = await fetch(file);
            if (!response.ok) {
              throw new Error(`Failed to load ${file}`);
            }
            const data = await response.json();
            return data as GPSEvent[];
          })
        );

        setGpsEventsData(allGpsEvents);

        // Create trips from first event of each GPS array
        const createdTrips = allGpsEvents.map((gpsEvents) => {
          if (gpsEvents.length < 2) return null;

          const firstEvent = gpsEvents[0];
          const lastEvent = gpsEvents[gpsEvents.length - 1];

          const tripId = firstEvent.trip_id;
          const vehicleId = firstEvent.vehicle_id;
          const startTimestamp = new Date(firstEvent.timestamp).getTime();

          // Determine status
          let status: 'Planned' | 'In-Progress' | 'Completed' | 'Cancelled' | 'Error' =
            'Completed';
          if (gpsEvents.some((e) => e.event_type === 'trip_cancelled')) status = 'Cancelled';
          else if (gpsEvents.some((e) => e.event_type === 'device_error')) status = 'Error';

          const plannedDistance = firstEvent.planned_distance_km || 1000;

          return {
            id: tripId,
            vehicleId,
            driverId: `drv_${vehicleId.split('_')[1] || '001'}`,
            startLocation: {
              lat: firstEvent.location.lat,
              lng: firstEvent.location.lng,
            },
            endLocation: {
              lat: lastEvent.location.lat,
              lng: lastEvent.location.lng,
            },
            currentLocation: {
              lat: firstEvent.location.lat,
              lng: firstEvent.location.lng,
            },
            plannedRoute: gpsEvents.map((e) => ({
              lat: e.location.lat,
              lng: e.location.lng,
              accuracy: e.location.accuracy_meters,
            })),
            status,
            metrics: {
              progressPercent: 0,
              distanceTravelled: 0,
              plannedDistance,
              eta:
                startTimestamp +
                (firstEvent.estimated_duration_hours || 24) * 60 * 60 * 1000,
              avgSpeed: 0,
              maxSpeed: 0,
              fuelUsed: 0,
              fuelLevel: 100,
              batteryLevel: 100,
              safetyScore: 100,
              signalHealth: 100,
              dwellTime: 0,
              violations: 0,
              refuels: 0,
            },
            startedAt: startTimestamp,
            expectedEndTime:
              startTimestamp + (firstEvent.estimated_duration_hours || 24) * 60 * 60 * 1000,
            actualEndTime: status === 'Completed' ? new Date(lastEvent.timestamp).getTime() : undefined,
            events: gpsEvents.map((e) => ({
              id: e.event_id,
              tripId,
              type: e.event_type as any,
              timestamp: new Date(e.timestamp).getTime(),
              data: {
                location: e.location,
                movement: e.movement,
                device: e.device,
                signal_quality: e.signal_quality,
                distance_travelled_km: e.distance_travelled_km,
              },
              metadata: {
                severity: e.overspeed ? 'warning' : 'info',
                source: 'device',
              },
            })),
            alerts: [],
            checkpoints: [
              {
                id: `cp_${tripId}_start`,
                location: {
                  lat: firstEvent.location.lat,
                  lng: firstEvent.location.lng,
                },
                name: 'Start Point',
                plannedTime: startTimestamp,
                reachedAt: startTimestamp,
              },
              {
                id: `cp_${tripId}_end`,
                location: {
                  lat: lastEvent.location.lat,
                  lng: lastEvent.location.lng,
                },
                name: 'Destination',
                plannedTime:
                  startTimestamp + (firstEvent.estimated_duration_hours || 24) * 60 * 60 * 1000,
                reachedAt: status === 'Completed' ? new Date(lastEvent.timestamp).getTime() : undefined,
              },
            ],
          };
        });

        const validTrips = createdTrips.filter((t) => t !== null) as any[];
        if (validTrips.length > 0) {
          dispatch(setTrips(validTrips));
          setIsLoading(false);
        } else {
          setError('No valid trip data found');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading GPS data:', err);
        setError(`Failed to load GPS data: ${err}`);
        setIsLoading(false);
      }
    };

    loadGPSData();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-light dark:bg-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading GPS tracking data...
          </p>
          <p className="text-sm text-gray-500 mt-2">Processing 5 US regional trips</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-light dark:bg-dark">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-light dark:bg-dark overflow-hidden">
      <AdvancedRealtimeMap trips={Object.values(trips)} gpsEventsData={gpsEventsData} />
    </div>
  );
}
