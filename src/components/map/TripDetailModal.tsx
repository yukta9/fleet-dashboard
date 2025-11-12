import React from 'react';
import { X, MapPin, Gauge, Zap, Signal, AlertCircle, Battery } from 'lucide-react';
import { TripTrackingState } from '@/data/mock/realtimeTrackingEngine';

interface Trip {
  id: string;
  name: string;
  color: string;
}

interface TripDetailModalProps {
  trip: Trip;
  state: TripTrackingState;
  onClose: () => void;
}

export default function TripDetailModal({ trip, state, onClose }: TripDetailModalProps) {
  const progressPercent = ((state.metrics.distanceTraveled / state.metrics.totalDistance) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b-2"
          style={{ borderBottomColor: trip.color }}
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{trip.name}</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">{trip.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Journey Progress
              </span>
              <span className="text-lg font-bold" style={{ color: trip.color }}>
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: trip.color,
                }}
              />
            </div>
          </div>

          {/* Distance Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Distance Covered */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Covered</span>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {state.metrics.distanceTraveled.toFixed(1)} km
              </p>
            </div>

            {/* Total Distance */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Total</span>
              </div>
              <p className="text-lg font-bold text-purple-600">
                {state.metrics.totalDistance.toFixed(1)} km
              </p>
            </div>

            {/* Speed */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Speed</span>
              </div>
              <p className="text-lg font-bold text-orange-600">
                {state.metrics.speed.toFixed(0)} km/h
              </p>
            </div>

            {/* Signal Quality */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <Signal className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Signal</span>
              </div>
              <p className="text-lg font-bold text-green-600 capitalize">
                {state.metrics.signalQuality}
              </p>
            </div>

            {/* Battery */}
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
              <div className="flex items-center gap-2 mb-1">
                <Battery className="w-4 h-4 text-cyan-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Battery</span>
              </div>
              <p className="text-lg font-bold text-cyan-600">
                {state.metrics.battery.toFixed(0)}%
              </p>
            </div>

            {/* Overspeed Status */}
            <div
              className={`p-4 rounded-lg border ${
                state.metrics.overspeed
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle
                  className={`w-4 h-4 ${
                    state.metrics.overspeed ? 'text-red-600' : 'text-emerald-600'
                  }`}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">Overspeed</span>
              </div>
              <p
                className={`text-lg font-bold ${
                  state.metrics.overspeed
                    ? 'text-red-600'
                    : 'text-emerald-600'
                }`}
              >
                {state.metrics.overspeed ? 'Detected' : 'Safe'}
              </p>
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">📍 Locations</p>

            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Starting Point</p>
              <p className="text-xs font-mono text-gray-900 dark:text-white">
                {state.traveledPath[0].lat.toFixed(6)}, {state.traveledPath[0].lng.toFixed(6)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ending Point</p>
              <p className="text-xs font-mono text-gray-900 dark:text-white">
                {state.traveledPath[state.traveledPath.length - 1].lat.toFixed(6)}, {state.traveledPath[state.traveledPath.length - 1].lng.toFixed(6)}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Location</p>
              <p className="text-xs font-mono text-gray-900 dark:text-white">
                {state.currentLocation.lat.toFixed(6)}, {state.currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
