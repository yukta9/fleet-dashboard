/**
 * Core Type Definitions for Fleet Tracking Dashboard
 * Aligned with Business Logic & Requirements
 */

// Trip States
export type TripState = 'Planned' | 'In-Progress' | 'Paused' | 'Refueling' | 'Completed' | 'Cancelled' | 'Error';

// Event Types (27+ event types from simulator)
export type EventType =
  | 'trip_started'
  | 'vehicle_stopped'
  | 'refueling_started'
  | 'refueling_completed'
  | 'trip_completed'
  | 'trip_cancelled'
  | 'device_error'
  | 'signal_lost'
  | 'signal_recovered'
  | 'speeding_detected'
  | 'harsh_acceleration'
  | 'harsh_braking'
  | 'fuel_level_change'
  | 'battery_low'
  | 'battery_critical'
  | 'location_updated'
  | 'eta_updated'
  | 'delay_detected'
  | 'delay_resolved'
  | 'excessive_idling'
  | 'route_deviation'
  | 'geofence_violation'
  | 'maintenance_alert'
  | 'driver_fatigue'
  | 'collision_risk'
  | 'vehicle_diagnostic'
  | 'checkpoint_reached';

// Core Event Structure
export interface FleetEvent {
  id: string;
  tripId: string;
  type: EventType;
  timestamp: number; // Unix timestamp in ms
  data: Record<string, any>;
  metadata?: {
    severity?: 'info' | 'warning' | 'critical';
    source?: string;
  };
}

// Location Data
export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
}

// Trip Metrics
export interface TripMetrics {
  progressPercent: number;
  distanceTravelled: number;
  plannedDistance: number;
  eta: number; // Unix timestamp
  avgSpeed: number;
  maxSpeed: number;
  fuelUsed: number;
  fuelLevel: number; // Percentage 0-100
  batteryLevel: number; // Percentage 0-100
  safetyScore: number; // 0-100
  signalHealth: number; // Percentage 0-100 (uptime)
  dwellTime: number; // ms spent stopped
  violations: number;
  refuels: number;
}

// Alert/Exception
export interface Alert {
  id: string;
  tripId: string;
  type: 'sla_breach' | 'speeding' | 'signal_lost' | 'fuel_low' | 'battery_low' | 'device_error' | 'violation' | 'custom';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
  actionRequired?: boolean;
}

// Driver Info
export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  safetyRating: number; // 0-100
  violations: number;
  totalTrips: number;
}

// Vehicle Info
export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: 'truck' | 'van' | 'sedan' | 'bike';
  status: 'active' | 'maintenance' | 'inactive';
  fuelCapacity: number; // Liters
  batteryCapacity: number; // kWh
  lastMaintenance?: number;
}

// Trip (Main Entity)
export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  startLocation: Location;
  endLocation: Location;
  currentLocation: Location;
  plannedRoute: Location[];
  status: TripState;
  metrics: TripMetrics;
  startedAt: number;
  expectedEndTime: number;
  actualEndTime?: number;
  events: FleetEvent[];
  alerts: Alert[];
  checkpoints: Checkpoint[];
}

// Checkpoint for trip timeline
export interface Checkpoint {
  id: string;
  location: Location;
  name: string;
  reachedAt?: number;
  plannedTime: number;
}

// Fleet Summary
export interface FleetSummary {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  onTimeRate: number; // Percentage
  avgFuelEfficiency: number; // km/l
  avgSafetyScore: number;
  totalViolations: number;
  activeAlerts: number;
}

// Dashboard UI State
export interface DashboardUIState {
  selectedTripId?: string;
  selectedVehicleId?: string;
  showAlertDetails: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  searchQuery: string;
  activeFilters: {
    status?: TripState[];
    severity?: Alert['severity'][];
    vehicleType?: Vehicle['type'][];
  };
}

// Simulation State
export interface SimulationState {
  speed: 1 | 5 | 10;
  isPlaying: boolean;
  currentTime: number;
  playbackStartTime: number;
  playbackSpeed: number;
}

// Redux Store Shape
export interface RootState {
  trips: {
    data: Record<string, Trip>;
    allIds: string[];
  };
  ui: DashboardUIState;
  simulation: SimulationState;
  alerts: {
    data: Record<string, Alert>;
    allIds: string[];
  };
}
