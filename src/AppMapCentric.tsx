import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrips } from '@/features/trips/tripsSlice';
import { RootState, AppDispatch } from '@/app/store';
import { useTheme } from '@/hooks/useTheme';
import RealtimeFleetMap from '@/components/map/RealtimeFleetMap';
import MapControlsBar from '@/components/map/MapControlsBar';
import '@/styles/globals.css';

import { transformAssessmentDataToTrip } from '@/data/mock/assessmentDataTransformer';

const TRIP_FILES = [
  '/data/trip_1_cross_country.json',
  '/data/trip_2_urban_dense.json',
  '/data/trip_3_mountain_cancelled.json',
  '/data/trip_4_southern_technical.json',
  '/data/trip_5_regional_logistics.json',
];

export default function AppMapCentric() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const trips = useSelector((state: RootState) => state.trips.data);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load and transform assessment data
    const loadTrips = async () => {
      try {
        const tripsData = await Promise.all(
          TRIP_FILES.map(async (file) => {
            const response = await fetch(file);
            if (!response.ok) {
              throw new Error(`Failed to load ${file}`);
            }
            return response.json();
          })
        );

        const transformedTrips = tripsData
          .map((data, index) => {
            try {
              return transformAssessmentDataToTrip(data as any);
            } catch (err) {
              console.error(`Error transforming trip ${index + 1}:`, err);
              return null;
            }
          })
          .filter((trip) => trip !== null) as any[];

        if (transformedTrips.length > 0) {
          dispatch(setTrips(transformedTrips));
          setIsLoading(false);
        } else {
          setError('No valid trip data found');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading assessment data:', err);
        setError(`Failed to load assessment data: ${err}`);
        setIsLoading(false);
      }
    };

    loadTrips();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-light dark:bg-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading fleet tracking data...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Processing 5 US trips...</p>
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
            className="mt-4 px-4 py-2 bg-brand text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-light dark:bg-dark overflow-hidden">
      {/* Full-screen Map */}
      <div className="flex-1 relative">
        <RealtimeFleetMap trips={Object.values(trips)} />
      </div>

      {/* Bottom Control Bar */}
      <MapControlsBar trips={Object.values(trips)} />
    </div>
  );
}
