import React from 'react';
import { useSelector } from 'react-redux';
import { AlertTriangle, TrendingUp, Zap, MapPin } from 'lucide-react';
import { RootState } from '@/app/store';

export default function Sidebar() {
  const { allIds: alertIds } = useSelector((state: RootState) => state.alerts);
  const trips = useSelector((state: RootState) => state.trips.data);

  const activeTrips = Object.values(trips).filter((t) => t.status === 'In-Progress').length;
  const completedTrips = Object.values(trips).filter((t) => t.status === 'Completed').length;
  const avgSafety =
    Object.values(trips).length > 0
      ? Math.round(
          Object.values(trips).reduce((sum, t) => sum + t.metrics.safetyScore, 0) /
            Object.values(trips).length
        )
      : 0;

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 overflow-y-auto flex flex-col">
      {/* Filters Section */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
        <div className="space-y-3">
          <select className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
            <option>In-Progress</option>
            <option>Completed</option>
            <option>Planned</option>
          </select>
          <select className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Severity</option>
            <option>Critical</option>
            <option>Warning</option>
            <option>Info</option>
          </select>
          <select className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Vehicles</option>
            <option>Truck</option>
            <option>Van</option>
            <option>Sedan</option>
          </select>
        </div>
      </div>

      {/* Exceptions/Alerts Section */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Exceptions ({alertIds.length})
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {alertIds.length > 0 ? (
            alertIds.slice(0, 5).map((id) => (
              <div
                key={id}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs"
              >
                <p className="text-red-900 dark:text-red-200 font-medium">Alert #{id}</p>
                <p className="text-red-700 dark:text-red-300 text-xs mt-1">Device error detected</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No active alerts</p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6 flex-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Active Trips</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeTrips}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTrips}</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Avg Safety</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{avgSafety}%</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
