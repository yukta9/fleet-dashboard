import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardUIState, TripState, Alert } from '@/data/types';

const initialState: DashboardUIState = {
  selectedTripId: undefined,
  selectedVehicleId: undefined,
  showAlertDetails: false,
  sidebarCollapsed: false,
  theme: 'light',
  searchQuery: '',
  activeFilters: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectTrip: (state, action: PayloadAction<string>) => {
      state.selectedTripId = action.payload;
    },
    selectVehicle: (state, action: PayloadAction<string>) => {
      state.selectedVehicleId = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<TripState[]>) => {
      state.activeFilters.status = action.payload;
    },
    setSeverityFilter: (state, action: PayloadAction<Alert['severity'][]>) => {
      state.activeFilters.severity = action.payload;
    },
    clearFilters: (state) => {
      state.activeFilters = {};
    },
    setShowAlertDetails: (state, action: PayloadAction<boolean>) => {
      state.showAlertDetails = action.payload;
    },
  },
});

export const {
  selectTrip,
  selectVehicle,
  toggleSidebar,
  toggleTheme,
  setTheme,
  setSearchQuery,
  setStatusFilter,
  setSeverityFilter,
  clearFilters,
  setShowAlertDetails,
} = uiSlice.actions;

export default uiSlice.reducer;
