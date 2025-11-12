import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from '@/data/types';

interface AlertsState {
  data: Record<string, Alert>;
  allIds: string[];
}

const initialState: AlertsState = {
  data: {},
  allIds: [],
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<Alert>) => {
      const alert = action.payload;
      state.data[alert.id] = alert;
      if (!state.allIds.includes(alert.id)) {
        state.allIds.unshift(alert.id);
      }
    },
    removeAlert: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.data[id];
      state.allIds = state.allIds.filter((id_) => id_ !== id);
    },
    resolveAlert: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.data[id]) {
        state.data[id].resolved = true;
        state.data[id].resolvedAt = Date.now();
      }
    },
    clearResolved: (state) => {
      state.allIds = state.allIds.filter((id) => !state.data[id].resolved);
      Object.keys(state.data).forEach((id) => {
        if (state.data[id].resolved) {
          delete state.data[id];
        }
      });
    },
  },
});

export const { addAlert, removeAlert, resolveAlert, clearResolved } = alertsSlice.actions;
export default alertsSlice.reducer;
