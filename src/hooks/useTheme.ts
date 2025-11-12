import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { setTheme } from '@/features/dashboard/uiSlice';

export function useTheme() {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.ui.theme);

  useEffect(() => {
    // Check localStorage for saved theme preference
    const saved = localStorage.getItem('fleet-dashboard-theme') as 'light' | 'dark' | null;
    if (saved) {
      dispatch(setTheme(saved));
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dispatch(setTheme(prefersDark ? 'dark' : 'light'));
    }
  }, [dispatch]);

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('fleet-dashboard-theme', theme);

    // Apply to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return theme;
}
