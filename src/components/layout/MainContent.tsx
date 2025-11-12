import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { selectTrip } from '@/features/dashboard/uiSlice';
import MapWithCursor from '@/components/map/MapWithCursor';
import KPIGrid from '@/components/dashboard/KPIGrid';

export default function MainContent() {
  const dispatch = useDispatch<AppDispatch>();
  const trips = useSelector((state: RootState) => state.trips.data);
  const { selectedTripId } = useSelector((state: RootState) => state.ui);

  return (
    <main className="flex-1 flex flex-col gap-4 p-4 bg-light dark:bg-dark overflow-y-auto">
      {/* Map Section with Visible Moving Cursor */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-card overflow-hidden relative">
        <MapWithCursor
          trips={Object.values(trips)}
          selectedTripId={selectedTripId}
          onSelectTrip={(id) => dispatch(selectTrip(id))}
        />
      </div>

      {/* KPI Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fleet KPI Grid</h2>
        <KPIGrid trips={Object.values(trips)} />
      </div>
    </main>
  );
}
