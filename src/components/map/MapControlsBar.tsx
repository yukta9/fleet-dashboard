import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { RootState, AppDispatch } from '@/app/store';
import { play, pause, setSpeed } from '@/features/dashboard/simulationSlice';

interface MapControlsBarProps {
  trips: any[];
}

export default function MapControlsBar({ trips }: MapControlsBarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { isPlaying, speed } = useSelector((state: RootState) => state.simulation);

  const activeTrips = trips.filter((t) => t.status === 'In-Progress').length;
  const completedTrips = trips.filter((t) => t.status === 'Completed').length;

  return (
    <div className="h-20 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-6 flex items-center justify-between shadow-lg">
      {/* Fleet Stats */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {activeTrips} <span className="text-gray-500">Active</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {completedTrips} <span className="text-gray-500">Completed</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {trips.length} <span className="text-gray-500">Total</span>
          </span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={() => (isPlaying ? dispatch(pause()) : dispatch(play()))}
          className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Play</span>
            </>
          )}
        </button>

        {/* Speed Controls */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
          {[1, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => dispatch(setSpeed(s as 1 | 5 | 10))}
              className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                speed === s
                  ? 'bg-brand text-white'
                  : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Reset */}
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Reset view"
        >
          <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Time Display */}
      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
    </div>
  );
}
