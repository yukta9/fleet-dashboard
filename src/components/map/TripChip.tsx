import React from 'react';
import { TripTrackingState } from '@/data/mock/realtimeTrackingEngine';

interface Trip {
  id: string;
  name: string;
  color: string;
}

interface TripChipProps {
  trip: Trip;
  state?: TripTrackingState;
  onClick: () => void;
}

export default function TripChip({ trip, state, onClick }: TripChipProps) {
  const progressPercent = state
    ? ((state.metrics.distanceTraveled / state.metrics.totalDistance) * 100).toFixed(0)
    : '0';

  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 min-w-[240px] hover:shadow-xl transition-shadow cursor-pointer border-l-4"
      style={{ borderLeftColor: trip.color }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm text-gray-900 dark:text-white">{trip.name}</h3>
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: trip.color }}
        />
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-bold text-gray-900 dark:text-white">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: trip.color,
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      {state && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Distance</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {state.metrics.distanceTraveled.toFixed(1)} / {state.metrics.totalDistance.toFixed(1)} km
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Speed</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {state.metrics.speed.toFixed(0)} km/h
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Signal</span>
            <span className="font-semibold text-gray-900 dark:text-white capitalize">
              {state.metrics.signalQuality}
            </span>
          </div>
          {state.metrics.overspeed && (
            <div className="flex justify-between text-red-600 dark:text-red-400">
              <span>⚠️ Overspeed</span>
              <span className="font-semibold">Detected</span>
            </div>
          )}
        </div>
      )}
    </button>
  );
}
