import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { selectTrip } from '@/features/dashboard/uiSlice';
import TripDetails from '@/components/dashboard/TripDetails';

export default function RightPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTripId } = useSelector((state: RootState) => state.ui);
  const trips = useSelector((state: RootState) => state.trips.data);

  const selectedTrip = selectedTripId ? trips[selectedTripId] : null;

  return (
    <aside className="w-80 bg-white dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 overflow-y-auto flex flex-col">
      {selectedTrip ? (
        <TripDetails trip={selectedTrip} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Select a trip to view details
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
