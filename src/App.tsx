import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTrips, setLoading } from '@/features/trips/tripsSlice';
import { generateTrips, generateDrivers, generateVehicles } from '@/data/mock/generateData';
import { RootState, AppDispatch } from '@/app/store';
import { useTheme } from '@/hooks/useTheme';
import Layout from '@/components/layout/Layout';
import '@/styles/globals.css';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize mock data 
    if (!isInitialized) {
      dispatch(setLoading(true));

      const drivers = generateDrivers(5);
      const vehicles = generateVehicles(5);
      const trips = generateTrips(5, drivers, vehicles);

      dispatch(setTrips(trips));
      
      setIsInitialized(true);
    }
  }, [dispatch, isInitialized]);

  return (
    <div className="w-full h-full bg-light dark:bg-dark text-primary dark:text-textPrimaryDark ">
      <Layout />
    </div>
  );
}
