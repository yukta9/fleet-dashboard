import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Play, Pause } from 'lucide-react';
import { RootState, AppDispatch } from '@/app/store';
import { play, pause, setSpeed } from '@/features/dashboard/simulationSlice';

export default function PlaybackBar() {
  const dispatch = useDispatch<AppDispatch>();
  const { isPlaying, speed } = useSelector((state: RootState) => state.simulation);

  return (
    <div className="h-16 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-6 flex items-center justify-center gap-6 shadow-soft">
      {/* Playback Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => (isPlaying ? dispatch(pause()) : dispatch(play()))}
          className="p-2 bg-brand hover:bg-blue-600 text-white rounded-lg transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 min-w-96">
          <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all"
              style={{ width: `${Math.random() * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Speed Controls */}
      <div className="flex items-center gap-2">
        {[1, 5, 10].map((s) => (
          <button
            key={s}
            onClick={() => dispatch(setSpeed(s as 1 | 5 | 10))}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              speed === s
                ? 'bg-brand text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
