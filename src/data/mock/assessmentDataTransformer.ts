/**
 * Assessment Data Transformer
 * Converts raw event data from trip JSON files into Trip entities
 * Extracts start (index 0) and end (index n-1) points for journey visualization
 */

import { Trip, FleetEvent, Location } from '../types';

interface RawLocationEvent {
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
  [key: string]: any;
}

interface TripRawData extends RawLocationEvent {
  planned_distance_km?: number;
  estimated_duration_hours?: number;
}

/**
 * Extract journey from raw events
 * Start: first location event
 * End: last location event
 * Route: all intermediate locations sampled for performance
 */
export function extractJourneyFromEvents(events: TripRawData[]): {
  startLocation: Location;
  endLocation: Location;
  route: Location[];
  allLocations: Location[];
} {
  const locationEvents = events.filter((e) => e.location) as RawLocationEvent[];

  if (locationEvents.length < 2) {
    throw new Error('Insufficient location data in events');
  }

  const startLocation: Location = {
    lat: locationEvents[0].location.lat,
    lng: locationEvents[0].location.lng,
    accuracy: locationEvents[0].location.accuracy_meters,
  };

  const endLocation: Location = {
    lat: locationEvents[locationEvents.length - 1].location.lat,
    lng: locationEvents[locationEvents.length - 1].location.lng,
    accuracy: locationEvents[locationEvents.length - 1].location.accuracy_meters,
  };

  // Create all locations array for animation
  const allLocations: Location[] = locationEvents.map((e) => ({
    lat: e.location.lat,
    lng: e.location.lng,
    accuracy: e.location.accuracy_meters,
  }));

  // Sample route for rendering (max 100 points)
  const sampleRate = Math.max(1, Math.floor(locationEvents.length / 100));
  const route: Location[] = [];

  for (let i = 0; i < locationEvents.length; i += sampleRate) {
    const event = locationEvents[i];
    route.push({
      lat: event.location.lat,
      lng: event.location.lng,
      accuracy: event.location.accuracy_meters,
    });
  }

  // Ensure endpoints are in route
  if (!route.some((loc) => loc.lat === startLocation.lat && loc.lng === startLocation.lng)) {
    route.unshift(startLocation);
  }
  if (!route.some((loc) => loc.lat === endLocation.lat && loc.lng === endLocation.lng)) {
    route.push(endLocation);
  }

  return { startLocation, endLocation, route, allLocations };
}

/**
 * Transform assessment JSON data into Trip entity
 */
export function transformAssessmentDataToTrip(rawData: TripRawData[]): Trip {
  if (!rawData || rawData.length === 0) {
    throw new Error('No data provided');
  }

  const firstEvent = rawData[0] as TripRawData;
  const lastEvent = rawData[rawData.length - 1] as TripRawData;

  // Extract journey
  const { startLocation, endLocation, route, allLocations } = extractJourneyFromEvents(rawData);

  const tripId = firstEvent.trip_id;
  const vehicleId = firstEvent.vehicle_id;
  const startTimestamp = new Date(firstEvent.timestamp).getTime();
  const endTimestamp = new Date(lastEvent.timestamp).getTime();

  // Current location is the last known location
  const currentLocation = allLocations[allLocations.length - 1] || endLocation;

  // Extract trip metadata
  const plannedDistance = firstEvent.planned_distance_km || 1000;
  const distanceTravelled = lastEvent.distance_travelled_km || 0;
  const progressPercent = Math.min(100, Math.round((distanceTravelled / plannedDistance) * 100));

  // Get latest metrics
  const speedEvents = rawData.filter((e) => e.movement);
  const avgSpeed = speedEvents.length > 0
    ? speedEvents.reduce((sum, e) => sum + (e.movement?.speed_kmh || 0), 0) / speedEvents.length
    : 0;
  const maxSpeed = Math.max(...speedEvents.map((e) => e.movement?.speed_kmh || 0), avgSpeed * 1.2);

  const deviceEvents = rawData.filter((e) => e.device);
  const avgBattery = deviceEvents.length > 0
    ? deviceEvents.reduce((sum, e) => sum + (e.device?.battery_level || 0), 0) / deviceEvents.length
    : 80;

  // Determine trip status
  let status: 'Planned' | 'In-Progress' | 'Completed' | 'Cancelled' | 'Error' = 'Completed';
  const hasCancelled = rawData.some((e) => e.event_type === 'trip_cancelled');
  const hasError = rawData.some((e) => e.event_type === 'device_error');
  const isOngoing = endTimestamp - startTimestamp < 24 * 60 * 60 * 1000; // Less than 24 hours

  if (hasCancelled) status = 'Cancelled';
  else if (hasError) status = 'Error';
  else if (isOngoing && progressPercent < 100) status = 'In-Progress';

  // Build events array
  const events: FleetEvent[] = rawData
    .filter((e) => e.event_id && e.event_type)
    .map((rawEvent) => ({
      id: rawEvent.event_id,
      tripId,
      type: rawEvent.event_type as any,
      timestamp: new Date(rawEvent.timestamp).getTime(),
      data: {
        location: rawEvent.location,
        movement: rawEvent.movement,
        device: rawEvent.device,
        signal_quality: rawEvent.signal_quality,
        distance_travelled_km: rawEvent.distance_travelled_km,
      },
      metadata: {
        severity: rawEvent.overspeed ? 'warning' : 'info',
        source: 'device',
      },
    }));

  // Calculate metrics
  const violations = rawData.filter((e) => e.overspeed).length;
  const safetyScore = Math.max(40, 100 - violations * 3);

  const signalQualityEvents = rawData.filter((e) => e.signal_quality);
  const goodSignalEvents = signalQualityEvents.filter(
    (e) => e.signal_quality === 'excellent' || e.signal_quality === 'good'
  ).length;
  const signalHealth =
    signalQualityEvents.length > 0
      ? Math.round((goodSignalEvents / signalQualityEvents.length) * 100)
      : 85;

  // Estimate duration
  const durationHours = (endTimestamp - startTimestamp) / (60 * 60 * 1000);
  const expectedEndTime = startTimestamp + Math.max(durationHours, firstEvent.estimated_duration_hours || 24) * 60 * 60 * 1000;

  const trip: Trip = {
    id: tripId,
    vehicleId,
    driverId: `drv_${vehicleId.split('_')[1] || '001'}`,
    startLocation,
    endLocation,
    currentLocation,
    plannedRoute: route,
    status,
    metrics: {
      progressPercent,
      distanceTravelled,
      plannedDistance,
      eta: expectedEndTime,
      avgSpeed: Math.round(avgSpeed),
      maxSpeed: Math.round(maxSpeed),
      fuelUsed: distanceTravelled * 0.08,
      fuelLevel: Math.max(5, 100 - distanceTravelled * 0.15),
      batteryLevel: Math.round(avgBattery),
      safetyScore,
      signalHealth,
      dwellTime: 0,
      violations,
      refuels: rawData.filter((e) => e.event_type === 'refueling_completed').length,
    },
    startedAt: startTimestamp,
    expectedEndTime,
    actualEndTime: status === 'Completed' ? endTimestamp : undefined,
    events,
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
        plannedTime: expectedEndTime,
        reachedAt: status === 'Completed' ? endTimestamp : undefined,
      },
    ],
  };

  return trip;
}

/**
 * Extract heading angle from two consecutive locations
 */
export function calculateHeading(from: Location, to: Location): number {
  const dLon = to.lng - from.lng;
  const y = Math.sin(dLon) * Math.cos(to.lat * (Math.PI / 180));
  const x =
    Math.cos(from.lat * (Math.PI / 180)) * Math.sin(to.lat * (Math.PI / 180)) -
    Math.sin(from.lat * (Math.PI / 180)) * Math.cos(to.lat * (Math.PI / 180)) * Math.cos(dLon);
  return Math.atan2(y, x) * (180 / Math.PI);
}

/**
 * Get current position in route based on progress percentage
 */
export function getPositionAtProgress(route: Location[], progressPercent: number): Location {
  if (route.length < 2) return route[0];

  const targetIndex = (progressPercent / 100) * (route.length - 1);
  const currentIndex = Math.floor(targetIndex);
  const nextIndex = Math.min(currentIndex + 1, route.length - 1);
  const fraction = targetIndex - currentIndex;

  const current = route[currentIndex];
  const next = route[nextIndex];

  return {
    lat: current.lat + (next.lat - current.lat) * fraction,
    lng: current.lng + (next.lng - current.lng) * fraction,
  };
}
