/**
 * Real-Time Tracking Engine
 * Uses setInterval(3000) to move drivers on map
 * Traverses JSON arrays in real-time
 * Stores position in localStorage
 */

export interface GPSLocation {
  lat: number;
  lng: number;
  accuracy_meters?: number;
  altitude_meters?: number;
}

export interface GPSEvent {
  event_id: string;
  event_type: string;
  timestamp: string;
  vehicle_id: string;
  trip_id: string;
  location: GPSLocation;
  movement?: {
    speed_kmh: number;
    heading_degrees: number;
    moving: boolean;
  };
  device?: {
    battery_level: number;
    charging: boolean;
  };
  distance_travelled_km?: number;
  signal_quality?: string;
  overspeed?: boolean;
  planned_distance_km?: number;
  estimated_duration_hours?: number;
  [key: string]: any;
}

export interface TripTrackingState {
  tripId: string;
  currentIndex: number;
  currentLocation: GPSLocation;
  currentEvent: GPSEvent | null;
  traveledPath: GPSLocation[];
  metrics: {
    distanceTraveled: number;
    totalDistance: number;
    speed: number;
    signalQuality: string;
    overspeed: boolean;
    battery: number;
  };
  isActive: boolean;
}

const STORAGE_KEY_PREFIX = 'fleet_trip_';

/**
 * Initialize trip tracking state
 */
export function initializeTripTracking(
  tripId: string,
  firstEvent: GPSEvent,
  totalDistance: number
): TripTrackingState {
  // Try to load from localStorage
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tripId}`);

  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed;
  }

  // Create new state
  return {
    tripId,
    currentIndex: 0,
    currentLocation: firstEvent.location,
    currentEvent: firstEvent,
    traveledPath: [firstEvent.location],
    metrics: {
      distanceTraveled: 0,
      totalDistance,
      speed: 0,
      signalQuality: 'good',
      overspeed: false,
      battery: 100,
    },
    isActive: true,
  };
}

/**
 * Advance to next event and return updated state
 */
export function advanceToNextEvent(
  currentState: TripTrackingState,
  events: GPSEvent[],
  totalDistance: number
): TripTrackingState {
  // Check if we've reached the end
  if (currentState.currentIndex >= events.length - 1) {
    // Trip completed - restart from beginning
    const newState = initializeTripTracking(
      currentState.tripId,
      events[0],
      totalDistance
    );
    newState.currentIndex = 0;
    newState.traveledPath = [events[0].location];
    localStorage.setItem(`${STORAGE_KEY_PREFIX}currentState.tripId}`, JSON.stringify(newState));
    return newState;
  }

  // Move to next event
  const nextIndex = currentState.currentIndex + 1;
  const nextEvent = events[nextIndex];
  const previousEvent = events[currentState.currentIndex];

  // Calculate distance traveled
  let distanceTraveled = currentState.metrics.distanceTraveled;
  if (previousEvent.distance_travelled_km !== undefined) {
    distanceTraveled = nextEvent.distance_travelled_km || distanceTraveled;
  }

  // Update traveled path
  const newTraveledPath = [...currentState.traveledPath, nextEvent.location];

  // Extract metrics
  const speed = nextEvent.movement?.speed_kmh || 0;
  const signalQuality = nextEvent.signal_quality || 'good';
  const overspeed = nextEvent.overspeed || false;
  const battery = nextEvent.device?.battery_level || currentState.metrics.battery;

  const newState: TripTrackingState = {
    tripId: currentState.tripId,
    currentIndex: nextIndex,
    currentLocation: nextEvent.location,
    currentEvent: nextEvent,
    traveledPath: newTraveledPath,
    metrics: {
      distanceTraveled,
      totalDistance,
      speed,
      signalQuality,
      overspeed,
      battery,
    },
    isActive: true,
  };

  // Save to localStorage
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${currentState.tripId}`, JSON.stringify(newState));

  return newState;
}

/**
 * Calculate bearing between two points
 */
export function calculateBearing(from: GPSLocation, to: GPSLocation): number {
  const dLon = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/**
 * Calculate distance between two GPS points (Haversine)
 */
export function calculateDistance(from: GPSLocation, to: GPSLocation): number {
  const R = 6371; // Earth radius in km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get trip summary
 */
export function getTripSummary(state: TripTrackingState) {
  return {
    tripId: state.tripId,
    distanceCovered: state.metrics.distanceTraveled.toFixed(2),
    totalDistance: state.metrics.totalDistance.toFixed(2),
    progressPercent: ((state.metrics.distanceTraveled / state.metrics.totalDistance) * 100).toFixed(1),
    speed: state.metrics.speed.toFixed(1),
    signalQuality: state.metrics.signalQuality,
    overspeed: state.metrics.overspeed,
    battery: state.metrics.battery.toFixed(1),
    currentEvent: state.currentEvent,
  };
}
