import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import RealTimeDriverMap from '@/components/map/RealTimeDriverMap';
import '@/styles/globals.css';
import { GPSEvent } from '@/data/mock/realtimeTrackingEngine';

const TRIP_FILES = [
  {
    name: 'Trip 1: Cross-Country',
    id: 'trip_1',
    color: '#3b82f6',
    file: '/data/trip_1_cross_country.json',
  },
  {
    name: 'Trip 2: Urban Dense',
    id: 'trip_2',
    color: '#10b981',
    file: '/data/trip_2_urban_dense.json',
  },
  {
    name: 'Trip 3: Mountain Cancelled',
    id: 'trip_3',
    color: '#f97316',
    file: '/data/trip_3_mountain_cancelled.json',
  },
  {
    name: 'Trip 4: Southern Technical',
    id: 'trip_4',
    color: '#ef4438',
    file: '/data/trip_4_southern_technical.json',
  },
  {
    name: 'Trip 5: Regional Logistics',
    id: 'trip_5',
    color: '#8b5cf6',
    file: '/data/trip_5_regional_logistics.json',
  },
];

export default function AppRealTime() {
  const theme = useTheme();
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const loadedTrips = await Promise.all(
          TRIP_FILES.map(async (tripConfig) => {
            try {
              const response = await fetch(tripConfig.file);
              if (!response.ok) throw new Error(`Failed to load ${tripConfig.file}`);
              const events = await response.json();

              return {
                id: tripConfig.id,
                name: tripConfig.name,
                color: tripConfig.color,
                events: events as GPSEvent[],
              };
            } catch (err) {
              console.error(`Error loading ${tripConfig.name}:`, err);
              return null;
            }
          })
        );

        const validTrips = loadedTrips.filter((t) => t !== null);
        if (validTrips.length > 0) {
          setTrips(validTrips);
          setIsLoading(false);
        } else {
          setError('Failed to load any trip data');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading trips:', err);
        setError('Failed to load trip data');
        setIsLoading(false);
      }
    };

    loadTrips();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-light dark:bg-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading real-time tracking data...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Processing 5 US trips</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-light dark:bg-dark">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-light dark:bg-dark overflow-hidden">
      <RealTimeDriverMap trips={trips} />
    </div>
  );
}
