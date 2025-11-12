import React from 'react';
import { Trip } from '@/data/types';
import { TrendingUp, Fuel, AlertCircle, Clock } from 'lucide-react';

interface KPIGridProps {
  trips: Trip[];
}

export default function KPIGrid({ trips }: KPIGridProps) {
  const calculateMetrics = () => {
    if (trips.length === 0) {
      return { completion: 0, fuelEff: 0, safety: 0, onTime: 0 };
    }

    const completedTrips = trips.filter((t) => t.status === 'Completed');
    const completionRate = (completedTrips.length / trips.length) * 100;

    const avgFuel =
      trips.reduce((sum, t) => sum + (t.metrics.plannedDistance / t.metrics.fuelUsed), 0) /
      trips.length;

    const avgSafety = trips.reduce((sum, t) => sum + t.metrics.safetyScore, 0) / trips.length;

    const onTimeCount = completedTrips.filter((t) => (t.actualEndTime || 0) <= t.expectedEndTime)
      .length;
    const onTimeRate = (onTimeCount / Math.max(completedTrips.length, 1)) * 100;

    return {
      completion: Math.round(completionRate),
      fuelEff: Math.round(avgFuel * 10) / 10,
      safety: Math.round(avgSafety),
      onTime: Math.round(onTimeRate),
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Trip Completion */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Trip Completion
          </span>
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{metrics.completion}%</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{trips.length} total trips</p>
      </div>

      {/* Fuel Efficiency */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Avg Fuel Efficiency
          </span>
          <Fuel className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{metrics.fuelEff}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">km/l</p>
      </div>

      {/* Safety Score */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Avg Safety Score
          </span>
          <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{metrics.safety}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">out of 100</p>
      </div>

      {/* On-Time Rate */}
      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">On-Time Rate</span>
          <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        </div>
        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{metrics.onTime}%</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">completed on time</p>
      </div>
    </div>
  );
}
