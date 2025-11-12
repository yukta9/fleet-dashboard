import React from 'react';
import { Trip } from '@/data/types';
import { X, MapPin, Clock, Gauge, Zap, TrendingUp, AlertCircle, Battery } from 'lucide-react';

interface TripDetailPopupProps {
  trip: Trip;
  location: { lat: number; lng: number };
  onClose: () => void;
}

export default function TripDetailPopup({ trip, onClose }: TripDetailPopupProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In-Progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'Cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'Error':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{trip.id}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {trip.vehicleId} • {trip.driverId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{trip.status}</p>
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(trip.status)}`}>
              {trip.status}
            </span>
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{trip.metrics.progressPercent}%</p>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                style={{ width: `${trip.metrics.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Trip Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Distance */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Distance</span>
              </div>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {trip.metrics.distanceTravelled.toFixed(0)} / {trip.metrics.plannedDistance.toFixed(0)} km
              </p>
            </div>

            {/* Average Speed */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Avg Speed</span>
              </div>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {trip.metrics.avgSpeed} km/h
              </p>
            </div>

            {/* Fuel Level */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Fuel Level</span>
              </div>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {trip.metrics.fuelLevel.toFixed(1)}%
              </p>
            </div>

            {/* Battery Level */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <Battery className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Battery</span>
              </div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {trip.metrics.batteryLevel.toFixed(0)}%
              </p>
            </div>

            {/* Safety Score */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Safety Score</span>
              </div>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {trip.metrics.safetyScore}/100
              </p>
            </div>

            {/* Violations */}
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Violations</span>
              </div>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {trip.metrics.violations}
              </p>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Journey</p>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">Start Point</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white">
                  {trip.startLocation.lat.toFixed(6)}, {trip.startLocation.lng.toFixed(6)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">End Point</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white">
                  {trip.endLocation.lat.toFixed(6)}, {trip.endLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Timeline</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Started</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {formatDate(trip.startedAt)} {formatTime(trip.startedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Expected End</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {formatDate(trip.expectedEndTime)} {formatTime(trip.expectedEndTime)}
                </span>
              </div>
              {trip.actualEndTime && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Actual End</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {formatDate(trip.actualEndTime)} {formatTime(trip.actualEndTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Events */}
          {trip.events.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Recent Events</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {trip.events.slice(-10).map((event) => (
                  <div key={event.id} className="text-xs p-2 bg-gray-50 dark:bg-slate-700 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">{event.type}</span>
                      <span className="text-gray-500 dark:text-gray-400">{formatTime(event.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
