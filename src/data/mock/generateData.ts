import {
  Trip,
  Driver,
  Vehicle,
  FleetEvent,
  Location,
  TripState,
  EventType,
  Checkpoint,
} from '../types';

// Sample locations for realistic routes
const SAMPLE_LOCATIONS = {
  delhi: { lat: 28.7041, lng: 77.1025 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  mumbai: { lat: 19.076, lng: 72.8776 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  pune: { lat: 18.5204, lng: 73.8567 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
};

const generateLocation = (base: Location, offset = 0.1): Location => ({
  lat: base.lat + (Math.random() - 0.5) * offset,
  lng: base.lng + (Math.random() - 0.5) * offset,
});

export const generateDrivers = (count: number): Driver[] => {
  const drivers: Driver[] = [];
  const names = ['Rajesh Kumar', 'Priya Singh', 'Amit Patel', 'Sunita Verma', 'Vikram Sharma'];

  for (let i = 0; i < count; i++) {
    drivers.push({
      id: `drv_${i + 1}`,
      name: names[i % names.length],
      phone: `+91${Math.random().toString().slice(2, 12)}`,
      licenseNumber: `DL${Math.random().toString().slice(2, 10).toUpperCase()}`,
      safetyRating: Math.floor(Math.random() * 40 + 60), // 60-100
      violations: Math.floor(Math.random() * 5),
      totalTrips: Math.floor(Math.random() * 200 + 50),
    });
  }
  return drivers;
};

export const generateVehicles = (count: number): Vehicle[] => {
  const vehicles: Vehicle[] = [];
  const types: Vehicle['type'][] = ['truck', 'van', 'sedan', 'bike'];

  for (let i = 0; i < count; i++) {
    vehicles.push({
      id: `veh_${i + 1}`,
      registrationNumber: `MH${Math.floor(Math.random() * 9000 + 1000)}`,
      type: types[i % types.length],
      status: 'active',
      fuelCapacity: Math.random() > 0.5 ? 60 : 40,
      batteryCapacity: 100,
      lastMaintenance: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    });
  }
  return vehicles;
};

export const generateTrips = (
  count: number,
  drivers: Driver[],
  vehicles: Vehicle[]
): Trip[] => {
  const trips: Trip[] = [];
  const states: TripState[] = ['Planned', 'In-Progress', 'Completed', 'Cancelled'];
  const locationPairs = [
    { start: SAMPLE_LOCATIONS.delhi, end: SAMPLE_LOCATIONS.bangalore },
    { start: SAMPLE_LOCATIONS.mumbai, end: SAMPLE_LOCATIONS.pune },
    { start: SAMPLE_LOCATIONS.gurgaon, end: SAMPLE_LOCATIONS.hyderabad },
    { start: SAMPLE_LOCATIONS.bangalore, end: SAMPLE_LOCATIONS.hyderabad },
  ];

  for (let i = 0; i < count; i++) {
    const pair = locationPairs[i % locationPairs.length];
    const status = states[i % states.length];
    const startedAt = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000;
    const plannedDistance = 500 + Math.random() * 1000;
    const progressPercent = status === 'Completed' ? 100 : Math.floor(Math.random() * 80);

    const checkpoints: Checkpoint[] = [
      {
        id: `cp_${i}_1`,
        location: pair.start,
        name: 'Start Point',
        plannedTime: startedAt,
        reachedAt: startedAt,
      },
      {
        id: `cp_${i}_2`,
        location: generateLocation(
          {
            lat: (pair.start.lat + pair.end.lat) / 2,
            lng: (pair.start.lng + pair.end.lng) / 2,
          },
          0.2
        ),
        name: 'Midpoint',
        plannedTime: startedAt + 12 * 60 * 60 * 1000,
      },
      {
        id: `cp_${i}_3`,
        location: pair.end,
        name: 'Destination',
        plannedTime: startedAt + 24 * 60 * 60 * 1000,
        reachedAt: status === 'Completed' ? startedAt + 22 * 60 * 60 * 1000 : undefined,
      },
    ];

    trips.push({
      id: `trip_${i + 1}`,
      vehicleId: vehicles[i % vehicles.length].id,
      driverId: drivers[i % drivers.length].id,
      startLocation: pair.start,
      endLocation: pair.end,
      currentLocation:
        status === 'In-Progress'
          ? generateLocation(pair.start, 0.1)
          : status === 'Completed'
            ? pair.end
            : pair.start,
      plannedRoute: [
        pair.start,
        generateLocation(
          {
            lat: (pair.start.lat + pair.end.lat) / 2,
            lng: (pair.start.lng + pair.end.lng) / 2,
          },
          0.15
        ),
        pair.end,
      ],
      status,
      metrics: {
        progressPercent,
        distanceTravelled: (plannedDistance * progressPercent) / 100,
        plannedDistance,
        eta: startedAt + 24 * 60 * 60 * 1000,
        avgSpeed: 60 + Math.random() * 30,
        maxSpeed: 90 + Math.random() * 20,
        fuelUsed: (plannedDistance * 0.1) * (progressPercent / 100),
        fuelLevel: Math.max(10, 100 - (plannedDistance * 0.15) * (progressPercent / 100)),
        batteryLevel: Math.max(15, 100 - Math.random() * 40),
        safetyScore: Math.floor(Math.random() * 30 + 70),
        signalHealth: Math.floor(Math.random() * 15 + 85),
        dwellTime: Math.floor(Math.random() * 60 * 60 * 1000),
        violations: Math.floor(Math.random() * 3),
        refuels: Math.floor(Math.random() * 2),
      },
      startedAt,
      expectedEndTime: startedAt + 24 * 60 * 60 * 1000,
      actualEndTime: status === 'Completed' ? startedAt + 22 * 60 * 60 * 1000 : undefined,
      events: [],
      alerts: [],
      checkpoints,
    });
  }

  return trips;
};

export const generateEvent = (tripId: string, index: number): FleetEvent => {
  const eventTypes: EventType[] = [
    'location_updated',
    'eta_updated',
    'fuel_level_change',
    'speeding_detected',
    'signal_lost',
  ];

  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const severities = ['info', 'warning', 'critical'] as const;

  return {
    id: `evt_${tripId}_${index}`,
    tripId,
    type: eventType,
    timestamp: Date.now() - Math.random() * 60 * 60 * 1000,
    data: {
      details: `Event data for ${eventType}`,
      value: Math.floor(Math.random() * 100),
    },
    metadata: {
      severity: severities[Math.floor(Math.random() * severities.length)],
      source: 'device',
    },
  };
};
