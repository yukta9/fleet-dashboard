/**
 * Trip Simulation Engine
 * Simulates real-time GPS signals from JSON event arrays
 * Each JSON element = GPS timestamp event
 * First element = trip start
 * Last element = trip end
 */

import { Trip, FleetEvent, Location } from '../types';

export interface GPSEvent {
  event_id: string;
  event_type: string;
  timestamp: string;
  vehicle_id: string;
  trip_id: string;
  location: { lat: number; lng: number; accuracy_meters?: number; altitude_meters?: number };
  movement?: { speed_kmh: number; heading_degrees: number; moving: boolean };
  device?: { battery_level: number; charging: boolean };
  distance_travelled_km?: number;
  signal_quality?: string;
  overspeed?: boolean;
  planned_distance_km?: number;
  estimated_duration_hours?: number;
  [key: string]: any;
}

export interface SimulationState {
  currentEventIndex: number;
  isPlaying: boolean;
  speed: 1 | 5 | 10;
  currentTime: number;
  traveledPath: Location[];
  plannedRoute: Location[];
  currentLocation: Location;
  currentEvent: GPSEvent | null;
  metrics: {
    distanceTraveled: number;
    plannedDistance: number;
    progressPercent: number;
    speed: number;
    battery: number;
    violations: number;
  };
}

/**
 * Initialize trip from GPS event array
 */
export function initializeTripFromGPSEvents(
  events: GPSEvent[]
): { trip: Trip; simulation: SimulationState } {
  if (events.length < 2) {
    throw new Error('Trip must have at least start and end events');
  }

  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];

  const startLocation: Location = {
    lat: firstEvent.location.lat,
    lng: firstEvent.location.lng,
  };

  const endLocation: Location = {
    lat: lastEvent.location.lat,
    lng: lastEvent.location.lng,
  };

  // Extract all locations for planned route
  const plannedRoute: Location[] = events.map((e) => ({
    lat: e.location.lat,
    lng: e.location.lng,
    accuracy: e.location.accuracy_meters,
  }));

  const tripId = firstEvent.trip_id;
  const vehicleId = firstEvent.vehicle_id;
  const startTimestamp = new Date(firstEvent.timestamp).getTime();

  // Determine status
  let status: 'Planned' | 'In-Progress' | 'Completed' | 'Cancelled' | 'Error' = 'In-Progress';
  if (events.some((e) => e.event_type === 'trip_completed')) status = 'Completed';
  else if (events.some((e) => e.event_type === 'trip_cancelled')) status = 'Cancelled';
  else if (events.some((e) => e.event_type === 'device_error')) status = 'Error';

  const plannedDistance = firstEvent.planned_distance_km || 1000;

  // Build events array
  const tripEvents: FleetEvent[] = events.map((gpsEvent) => ({
    id: gpsEvent.event_id,
    tripId,
    type: gpsEvent.event_type as any,
    timestamp: new Date(gpsEvent.timestamp).getTime(),
    data: {
      location: gpsEvent.location,
      movement: gpsEvent.movement,
      device: gpsEvent.device,
      signal_quality: gpsEvent.signal_quality,
      distance_travelled_km: gpsEvent.distance_travelled_km,
    },
    metadata: {
      severity: gpsEvent.overspeed ? 'warning' : 'info',
      source: 'device',
    },
  }));

  const trip: Trip = {
    id: tripId,
    vehicleId,
    driverId: `drv_${vehicleId.split('_')[1] || '001'}`,
    startLocation,
    endLocation,
    currentLocation: startLocation,
    plannedRoute,
    status,
    metrics: {
      progressPercent: 0,
      distanceTravelled: 0,
      plannedDistance,
      eta: startTimestamp + (firstEvent.estimated_duration_hours || 24) * 60 * 60 * 1000,
      avgSpeed: 0,
      maxSpeed: 0,
      fuelUsed: 0,
      fuelLevel: 100,
      batteryLevel: 100,
      safetyScore: 100,
      signalHealth: 100,
      dwellTime: 0,
      violations: 0,
      refuels: 0,
    },
    startedAt: startTimestamp,
    expectedEndTime: startTimestamp + (firstEvent.estimated_duration_hours || 24) * 60 * 60 * 1000,
    events: tripEvents,
    alerts: [],
    checkpoints: [
      {
        id: `cp_${tripId}_start`,
        location: startLocation,
        name: 'Start Point',
        plannedTime: startTimestamp,
        reachedAt: startTimestamp,
      },
      {
        id: `cp_${tripId}_end`,
        location: endLocation,
        name: 'Destination',
        plannedTime: startTimestamp + (firstEvent.estimated_duration_hours || 24) * 60 * 60 * 1000,
      },
    ],
  };

  const simulation: SimulationState = {
    currentEventIndex: 0,
    isPlaying: false,
    speed: 1,
    currentTime: startTimestamp,
    traveledPath: [startLocation],
    plannedRoute,
    currentLocation: startLocation,
    currentEvent: firstEvent,
    metrics: {
      distanceTraveled: 0,
      plannedDistance,
      progressPercent: 0,
      speed: 0,
      battery: 100,
      violations: 0,
    },
  };

  return { trip, simulation };
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate bearing/heading between two points
 */
export function calculateBearing(point1: Location, point2: Location): number {
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const lat1 = (point1.lat * Math.PI) / 180;
  const lat2 = (point2.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/**
 * Update simulation state with next GPS event
 */
export function updateSimulationWithNextEvent(
  currentState: SimulationState,
  events: GPSEvent[]
): SimulationState {
  if (currentState.currentEventIndex >= events.length - 1) {
    return { ...currentState, isPlaying: false };
  }

  const nextIndex = currentState.currentEventIndex + 1;
  const nextEvent = events[nextIndex];
  const previousEvent = events[currentState.currentEventIndex];

  const nextLocation: Location = {
    lat: nextEvent.location.lat,
    lng: nextEvent.location.lng,
  };

  const previousLocation: Location = {
    lat: previousEvent.location.lat,
    lng: previousEvent.location.lng,
  };

  // Calculate distance traveled
  const segmentDistance = calculateDistance(previousLocation, nextLocation);
  const totalDistance = currentState.metrics.distanceTraveled + segmentDistance;
  const progressPercent = Math.min(
    100,
    (totalDistance / currentState.metrics.plannedDistance) * 100
  );

  // Update traveled path
  const newTraveledPath = [...currentState.traveledPath, nextLocation];

  // Extract metrics from event
  const speed = nextEvent.movement?.speed_kmh || 0;
  const battery = nextEvent.device?.battery_level || currentState.metrics.battery;
  const violations = nextEvent.overspeed
    ? currentState.metrics.violations + 1
    : currentState.metrics.violations;

  return {
    currentEventIndex: nextIndex,
    isPlaying: currentState.isPlaying,
    speed: currentState.speed,
    currentTime: new Date(nextEvent.timestamp).getTime(),
    traveledPath: newTraveledPath,
    plannedRoute: currentState.plannedRoute,
    currentLocation: nextLocation,
    currentEvent: nextEvent,
    metrics: {
      distanceTraveled: totalDistance,
      plannedDistance: currentState.metrics.plannedDistance,
      progressPercent,
      speed,
      battery,
      violations,
    },
  };
}

/**
 * Get journey summary
 */
export function getJourneySummary(
  events: GPSEvent[],
  currentIndex: number
): {
  eventsCovered: number;
  totalEvents: number;
  totalDistance: number;
  timeElapsed: string;
  avgSpeed: number;
} {
  let totalDistance = 0;

  for (let i = 1; i <= currentIndex; i++) {
    const point1: Location = {
      lat: events[i - 1].location.lat,
      lng: events[i - 1].location.lng,
    };
    const point2: Location = {
      lat: events[i].location.lat,
      lng: events[i].location.lng,
    };
    totalDistance += calculateDistance(point1, point2);
  }

  const startTime = new Date(events[0].timestamp).getTime();
  const endTime = new Date(events[currentIndex].timestamp).getTime();
  const timeElapsedMs = endTime - startTime;
  const hours = Math.floor(timeElapsedMs / (60 * 60 * 1000));
  const minutes = Math.floor((timeElapsedMs % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeElapsedMs % (60 * 1000)) / 1000);

  const avgSpeed = timeElapsedMs > 0 ? totalDistance / (timeElapsedMs / (60 * 60 * 1000)) : 0;

  return {
    eventsCovered: currentIndex + 1,
    totalEvents: events.length,
    totalDistance,
    timeElapsed: `${hours}h ${minutes}m ${seconds}s`,
    avgSpeed,
  };
}
