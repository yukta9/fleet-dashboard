import { configureStore } from '@reduxjs/toolkit';
import tripsReducer from '@/features/trips/tripsSlice';
import uiReducer from '@/features/dashboard/uiSlice';
import simulationReducer from '@/features/dashboard/simulationSlice';
import alertsReducer from '@/features/dashboard/alertsSlice';

export const store = configureStore({
  reducer: {
    trips: tripsReducer,
    ui: uiReducer,
    simulation: simulationReducer,
    alerts: alertsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
