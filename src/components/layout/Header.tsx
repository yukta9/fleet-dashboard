import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Moon, Sun } from 'lucide-react';
import { RootState, AppDispatch } from '@/app/store';
import { toggleTheme, setSearchQuery } from '@/features/dashboard/uiSlice';

export default function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, searchQuery } = useSelector((state: RootState) => state.ui);
  const { speed } = useSelector((state: RootState) => state.simulation);

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 flex items-center justify-between shadow-soft">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search trips, vehicles, drivers..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 ml-6">
        {/* Speed Indicator */}
        <div className="px-3 py-1 bg-brand/10 text-brand rounded-lg text-sm font-medium">
          {speed}x
        </div>

        {/* Time Display */}
        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-gray-600" />
          ) : (
            <Sun className="w-4 h-4 text-yellow-400" />
          )}
        </button>
      </div>
    </header>
  );
}
