import React from 'react';
import { Trip } from '@/data/types';
import { X, MapPin, Clock, Gauge, Navigation } from 'lucide-react';
import { getJourneySummary } from '@/data/mock/tripSimulationEngine';

interface JourneyDetailsModalProps {
  trip: Trip;
  summary: ReturnType<typeof getJourneySummary>;
  onClose: () => void;
}

export default function JourneyDetailsModal({
  trip,
  summary,
  onClose,
}: JourneyDetailsModalProps) {
  const progressPercent = (summary.eventsCovered / summary.totalEvents) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
      <div className="bg-white dark:bg-slate-800 h-full w-full max-w-md shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {trip.id}
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {trip.vehicleId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trip Status */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  trip.status === 'Completed'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : trip.status === 'In-Progress'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {trip.status}
              </span>
            </div>
          </div>

          {/* Journey Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                GPS Events Progress
              </span>
              <span className="text-lg font-bold text-brand">
                {summary.eventsCovered} / {summary.totalEvents}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {progressPercent.toFixed(1)}% Complete
            </p>
          </div>

          {/* Distance Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Distance
                </span>
              </div>
              <p className="text-lg font-bold text-orange-600">
                {summary.totalDistance.toFixed(2)} km
              </p>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Time
                </span>
              </div>
              <p className="text-sm font-bold text-purple-600">
                {summary.timeElapsed}
              </p>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Avg Speed
                </span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {summary.avgSpeed.toFixed(1)} km/h
              </p>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="w-4 h-4 text-red-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Planned
                </span>
              </div>
              <p className="text-lg font-bold text-red-600">
                {trip.metrics.plannedDistance.toFixed(0)} km
              </p>
            </div>
          </div>

          {/* Location Info */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              📍 Journey Route
            </p>

            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Start Point
              </p>
              <p className="text-xs font-mono text-gray-900 dark:text-white">
                {trip.startLocation.lat.toFixed(6)}, {trip.startLocation.lng.toFixed(6)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                End Point
              </p>
              <p className="text-xs font-mono text-gray-900 dark:text-white">
                {trip.endLocation.lat.toFixed(6)}, {trip.endLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              📋 Legend
            </p>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Traveled Path (Bold Red)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Planned Route (Dashed)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Trip Start
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Trip End
              </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              📊 Trip Statistics
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-600 dark:text-gray-400">Total Events:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {trip.events.length}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-600 dark:text-gray-400">Violations:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {trip.metrics.violations}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200 dark:border-slate-700">
                <span className="text-gray-600 dark:text-gray-400">Safety Score:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {trip.metrics.safetyScore}/100
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600 dark:text-gray-400">Refuels:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {trip.metrics.refuels}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
