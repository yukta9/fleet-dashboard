import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Trip, FleetEvent } from '@/data/types';

interface TripsState {
  data: Record<string, Trip>;
  allIds: string[];
  loading: boolean;
}

const initialState: TripsState = {
  data: {},
  allIds: [],
  loading: false,
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setTrips: (state, action: PayloadAction<Trip[]>) => {
      state.data = {};
      state.allIds = [];
      action.payload.forEach((trip) => {
        state.data[trip.id] = trip;
        state.allIds.push(trip.id);
      });
      state.loading = false;
    },
    updateTrip: (state, action: PayloadAction<Trip>) => {
      const trip = action.payload;
      state.data[trip.id] = trip;
      if (!state.allIds.includes(trip.id)) {
        state.allIds.push(trip.id);
      }
    },
    applyTripEvent: (state, action: PayloadAction<{ tripId: string; event: FleetEvent }>) => {
      const { tripId, event } = action.payload;
      const trip = state.data[tripId];
      if (trip) {
        if (!trip.events.find((e) => e.id === event.id)) {
          trip.events.push(event);
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setTrips, updateTrip, applyTripEvent, setLoading } = tripsSlice.actions;
export default tripsSlice.reducer;
