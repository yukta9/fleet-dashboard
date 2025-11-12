import React from 'react';
import { Trip } from '@/data/types';
import { MapPin, Clock, Zap, Gauge, AlertCircle } from 'lucide-react';

interface TripDetailsProps {
  trip: Trip;
}

export default function TripDetails({ trip }: TripDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In-Progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'Cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{trip.id}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
            {trip.status}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Vehicle: {trip.vehicleId} • Driver: {trip.driverId}
        </p>
      </div>

      {/* Progress */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {trip.metrics.progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all"
              style={{ width: `${trip.metrics.progressPercent}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Distance</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {trip.metrics.distanceTravelled.toFixed(0)} km
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">ETA</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {new Date(trip.metrics.eta).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Trip Metrics</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Avg Speed</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {trip.metrics.avgSpeed.toFixed(1)} km/h
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Fuel Level</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {trip.metrics.fuelLevel.toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Safety Score</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {trip.metrics.safetyScore}/100
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-600 dark:text-gray-400">Violations</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {trip.metrics.violations}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="p-6 border-t border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Events</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {trip.events.slice(0, 5).map((event) => (
            <div
              key={event.id}
              className="text-xs p-2 bg-gray-50 dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600"
            >
              <p className="font-medium text-gray-900 dark:text-white">{event.type}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(event.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
          {trip.events.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">No events recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}
