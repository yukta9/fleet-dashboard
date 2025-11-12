import { Trip, FleetEvent, Location, TripMetrics } from '../types';

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

export async function loadTripDataFromJson(jsonData: RawEvent[]): Promise<Trip> {
  if (!jsonData || jsonData.length === 0) {
    throw new Error('No trip data provided');
  }

  const firstEvent = jsonData[0];
  const tripId = firstEvent.trip_id;
  const vehicleId = firstEvent.vehicle_id;
  const startTimestamp = new Date(firstEvent.timestamp).getTime();

  const locationEvents = jsonData.filter((e) => e.location);
  const startLocation = locationEvents[0]?.location || { lat: 0, lng: 0 };
  const endLocation = locationEvents[locationEvents.length - 1]?.location || startLocation;

  const routeSampleRate = Math.max(1, Math.floor(locationEvents.length / 50));
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

  const currentLocation = locationEvents[locationEvents.length - 1]?.location || endLocation;

  const lastEvent = jsonData[jsonData.length - 1];
  const distanceTravelled = Number(lastEvent.distance_travelled_km) || 0;
  const plannedDistance = Number(firstEvent.planned_distance_km) || 1000;
  const progressPercent = Math.min(100, Math.round((distanceTravelled / plannedDistance) * 100));

  const lastMovement = jsonData.find((e) => e.movement)?.movement;
  const avgSpeed = Number(lastMovement?.speed_kmh) || 60;
  const lastDevice = jsonData.find((e) => e.device)?.device;
  const batteryLevel = Number(lastDevice?.battery_level) || 80;

  let status: 'Planned' | 'In-Progress' | 'Completed' | 'Cancelled' | 'Error' = 'In-Progress';
  const hasCompleted = jsonData.some((e) => e.event_type === 'trip_completed');
  const hasCancelled = jsonData.some((e) => e.event_type === 'trip_cancelled');
  const hasError = jsonData.some((e) => e.event_type === 'device_error');

  if (hasCompleted) status = 'Completed';
  else if (hasCancelled) status = 'Cancelled';
  else if (hasError) status = 'Error';

  const events: FleetEvent[] = jsonData.map((rawEvent) => ({
    id: rawEvent.event_id,
    tripId,
    type: rawEvent.event_type as any,
    timestamp: new Date(rawEvent.timestamp).getTime(),
    data: {
      location: rawEvent.location,
      movement: rawEvent.movement,
      device: rawEvent.device,
      signal_quality: rawEvent.signal_quality,
    },
    metadata: {
      severity: rawEvent.overspeed ? 'warning' : 'info',
      source: 'device',
    },
  }));

  const estimatedDuration = Number(firstEvent.estimated_duration_hours) || 24;
  const expectedEndTime = startTimestamp + estimatedDuration * 60 * 60 * 1000;

  const trip: Trip = {
    id: tripId,
    vehicleId,
    driverId: `drv_${vehicleId.split('_')[1] || '001'}`,
    startLocation,
    endLocation,
    currentLocation,
    plannedRoute,
    status,
    metrics: {
      progressPercent,
      distanceTravelled,
      plannedDistance,
      eta: expectedEndTime,
      avgSpeed: Math.round(avgSpeed),
      maxSpeed: Math.round(avgSpeed * 1.3),
      fuelUsed: distanceTravelled * 0.08,
      fuelLevel: Math.max(5, 100 - distanceTravelled * 0.15),
      batteryLevel,
      safetyScore: jsonData.some((e) => e.overspeed) ? 70 : 85,
      signalHealth:
        (jsonData.filter((e) => e.signal_quality).length / Math.max(jsonData.length, 1)) * 100,
      dwellTime: 0,
      violations: jsonData.filter((e) => e.overspeed).length,
      refuels: jsonData.filter((e) => e.event_type === 'refueling_completed').length,
    },
    startedAt: startTimestamp,
    expectedEndTime,
    actualEndTime: status === 'Completed' ? new Date(lastEvent.timestamp).getTime() : undefined,
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
        reachedAt: status === 'Completed' ? new Date(lastEvent.timestamp).getTime() : undefined,
      },
    ],
  };

  return trip;
}
