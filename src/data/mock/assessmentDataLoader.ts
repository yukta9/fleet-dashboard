/**
 * Assessment Data Loader
 * Handles loading and parsing real trip data from the assessment directory
 * Supports 5 different trip scenarios:
 * 1. Cross-country long haul
 * 2. Urban dense delivery
 * 3. Mountain cancelled trip
 * 4. Southern technical issues
 * 5. Regional logistics
 */

import { Trip, FleetEvent, Location } from '../types';

interface RawEvent {
  event_id: string;
  event_type: string;
  timestamp: string;
  vehicle_id: string;
  trip_id: string;
  location?: { lat: number; lng: number; accuracy_meters?: number; altitude_meters?: number };
  movement?: { speed_kmh: number; heading_degrees: number; moving: boolean };
  device?: { battery_level: number; charging: boolean };
  planned_distance_km?: number;
  estimated_duration_hours?: number;
  distance_travelled_km?: number;
  signal_quality?: string;
  overspeed?: boolean;
  [key: string]: any;
}

/**
 * Transform raw event data into Trip entity
 */
export function transformRawEventsToTrip(rawEvents: RawEvent[]): Trip {
  if (!rawEvents || rawEvents.length === 0) {
    throw new Error('No events provided');
  }

  const firstEvent = rawEvents[0];
  const lastEvent = rawEvents[rawEvents.length - 1];

  const tripId = firstEvent.trip_id;
  const vehicleId = firstEvent.vehicle_id;
  const startTimestamp = new Date(firstEvent.timestamp).getTime();

  // Extract location events
  const locationEvents = rawEvents.filter((e) => e.location);

  if (locationEvents.length === 0) {
    throw new Error('No location data in events');
  }

  const startLocation = locationEvents[0].location!;
  const endLocation = locationEvents[locationEvents.length - 1].location!;
  const currentLocation = locationEvents[locationEvents.length - 1].location!;

  // Build route (sample for performance)
  const routeSampleRate = Math.max(1, Math.floor(locationEvents.length / 100));
  const plannedRoute: Location[] = [];

  for (let i = 0; i < locationEvents.length; i += routeSampleRate) {
    const event = locationEvents[i];
    if (event.location) {
      plannedRoute.push({
        lat: event.location.lat,
        lng: event.location.lng,
        accuracy: event.location.accuracy_meters,
      });
    }
  }

  // Ensure start and end are in route
  if (!plannedRoute.some((loc) => loc.lat === startLocation.lat)) {
    plannedRoute.unshift({ lat: startLocation.lat, lng: startLocation.lng });
  }
  if (!plannedRoute.some((loc) => loc.lat === endLocation.lat)) {
    plannedRoute.push({ lat: endLocation.lat, lng: endLocation.lng });
  }

  // Calculate metrics
  const distanceTravelled = lastEvent.distance_travelled_km || 0;
  const plannedDistance = firstEvent.planned_distance_km || 1000;
  const progressPercent = Math.min(100, Math.round((distanceTravelled / plannedDistance) * 100));

  // Get latest movement and device data
  const lastMovement = [...rawEvents].reverse().find((e) => e.movement)?.movement;
  const avgSpeed = lastMovement?.speed_kmh || 0;

  const lastDevice = [...rawEvents].reverse().find((e) => e.device)?.device;
  const batteryLevel = lastDevice?.battery_level || 80;

  // Determine trip status
  let status: 'Planned' | 'In-Progress' | 'Paused' | 'Refueling' | 'Completed' | 'Cancelled' | 'Error' =
    'In-Progress';

  const hasCompleted = rawEvents.some((e) => e.event_type === 'trip_completed');
  const hasCancelled = rawEvents.some((e) => e.event_type === 'trip_cancelled');
  const hasError = rawEvents.some((e) => e.event_type === 'device_error');
  const hasRefueling = rawEvents.some((e) => e.event_type === 'refueling_started');
  const hasStopped = rawEvents.some((e) => e.event_type === 'vehicle_stopped');

  if (hasCompleted) status = 'Completed';
  else if (hasCancelled) status = 'Cancelled';
  else if (hasError) status = 'Error';
  else if (hasRefueling) status = 'Refueling';
  else if (hasStopped && progressPercent < 50) status = 'Paused';

  // Build events
  const events: FleetEvent[] = rawEvents.map((rawEvent) => ({
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
      severity: rawEvent.overspeed ? 'warning' : rawEvent.signal_quality === 'poor' ? 'warning' : 'info',
      source: 'device',
    },
  }));

  // Calculate ETA
  const estimatedDuration = firstEvent.estimated_duration_hours || 24;
  const expectedEndTime = startTimestamp + estimatedDuration * 60 * 60 * 1000;

  // Estimate fuel consumption
  const speedFactors = rawEvents.filter((e) => e.movement);
  const avgSpeedEstimate = speedFactors.length > 0
    ? speedFactors.reduce((sum, e) => sum + (e.movement?.speed_kmh || 0), 0) / speedFactors.length
    : 60;

  const fuelUsed = (distanceTravelled * 0.08) || 0; // 8L per 100km estimate
  const fuelLevel = Math.max(5, 100 - (distanceTravelled * 0.15));

  // Calculate safety score (based on violations)
  const violations = rawEvents.filter((e) => e.overspeed).length;
  const safetyScore = Math.max(40, 100 - (violations * 5));

  // Calculate signal health
  const signalQualityEvents = rawEvents.filter((e) => e.signal_quality);
  const goodSignalCount = signalQualityEvents.filter(
    (e) => e.signal_quality === 'excellent' || e.signal_quality === 'good'
  ).length;
  const signalHealth = signalQualityEvents.length > 0
    ? Math.round((goodSignalCount / signalQualityEvents.length) * 100)
    : 85;

  const trip: Trip = {
    id: tripId,
    vehicleId,
    driverId: `drv_${vehicleId.split('_')[1] || '001'}`,
    startLocation: { lat: startLocation.lat, lng: startLocation.lng },
    endLocation: { lat: endLocation.lat, lng: endLocation.lng },
    currentLocation: { lat: currentLocation.lat, lng: currentLocation.lng },
    plannedRoute,
    status,
    metrics: {
      progressPercent,
      distanceTravelled,
      plannedDistance,
      eta: expectedEndTime,
      avgSpeed: Math.round(avgSpeedEstimate),
      maxSpeed: Math.round(avgSpeedEstimate * 1.4),
      fuelUsed,
      fuelLevel,
      batteryLevel,
      safetyScore,
      signalHealth,
      dwellTime: 0,
      violations,
      refuels: rawEvents.filter((e) => e.event_type === 'refueling_completed').length,
    },
    startedAt: startTimestamp,
    expectedEndTime,
    actualEndTime: hasCompleted ? new Date(lastEvent.timestamp).getTime() : undefined,
    events,
    alerts: [],
    checkpoints: [
      {
        id: `cp_${tripId}_start`,
        location: { lat: startLocation.lat, lng: startLocation.lng },
        name: 'Start Point',
        plannedTime: startTimestamp,
        reachedAt: startTimestamp,
      },
      {
        id: `cp_${tripId}_end`,
        location: { lat: endLocation.lat, lng: endLocation.lng },
        name: 'Destination',
        plannedTime: expectedEndTime,
        reachedAt: hasCompleted ? new Date(lastEvent.timestamp).getTime() : undefined,
      },
    ],
  };

  return trip;
}

/**
 * Batch process multiple trip event arrays
 */
export function transformMultipleTrips(tripEventsList: RawEvent[][]): Trip[] {
  return tripEventsList
    .map((events) => {
      try {
        return transformRawEventsToTrip(events);
      } catch (error) {
        console.error('Error transforming trip:', error);
        return null;
      }
    })
    .filter((trip) => trip !== null) as Trip[];
}

/**
 * Sample trip data from 5 assessment scenarios
 * In production, this would load from actual JSON files
 */
export const SAMPLE_TRIP_SCENARIOS = {
  'cross-country': 'Trip 1: Cross-country long haul (4490 km)',
  'urban-dense': 'Trip 2: Urban dense delivery network',
  'mountain-cancelled': 'Trip 3: Mountain route (cancelled)',
  'southern-technical': 'Trip 4: Southern region (technical issues)',
  'regional-logistics': 'Trip 5: Regional logistics hub',
};
