# Real-Time Fleet Tracking Dashboard - Implementation Guide

## Project Overview

A **scalable, real-time fleet tracking dashboard** built with React 18, TypeScript, Vite, Redux Toolkit, and TailwindCSS. Designed for fleet managers, dispatchers, and logistics analysts to monitor vehicle movements, trip progress, alerts, and performance metrics in real-time.

### Key Features
- Real-time interactive map with vehicle markers and routes
- Live trip progress tracking with ETA calculations
- Fleet KPI dashboard (completion rate, fuel efficiency, safety scores, on-time delivery)
- Exception/alert management system with severity levels
- Trip detail viewer with event timelines and metrics
- Simulation engine with playback controls (1x, 5x, 10x speeds)
- Dark/light theme toggle with localStorage persistence
- Responsive design (mobile-first approach)
- Type-safe development with full TypeScript support

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **UI Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 7.2 |
| **State Management** | Redux Toolkit + React-Redux |
| **Styling** | TailwindCSS + PostCSS |
| **Routing** | React Router DOM (future) |
| **Maps** | Leaflet + OpenStreetMap |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Testing** | Vitest + React Testing Library |
| **Linting** | ESLint |
| **Deployment** | GitHub Pages + GitHub Actions |

---

## Project Structure

```
fleet-dashboard/
├── src/
│   ├── app/
│   │   ├── store.ts                 # Redux store configuration
│   │   └── theme.ts                 # Theme tokens and design system
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx           # Main layout shell
│   │   │   ├── Header.tsx           # Search, theme toggle, time display
│   │   │   ├── Sidebar.tsx          # Filters, exceptions, quick stats
│   │   │   ├── MainContent.tsx      # Map + KPI grid
│   │   │   ├── RightPanel.tsx       # Trip details & metrics
│   │   │   └── PlaybackBar.tsx      # Simulation controls
│   │   ├── map/
│   │   │   └── MapComponent.tsx     # Leaflet map with markers & routes
│   │   ├── dashboard/
│   │   │   ├── KPIGrid.tsx          # Fleet metrics cards
│   │   │   └── TripDetails.tsx      # Trip info, progress, event log
│   │   └── ui/
│   │       ├── Badge.tsx            # Status badges
│   │       └── ProgressRing.tsx     # Circular progress indicator
│   │
│   ├── features/
│   │   ├── trips/
│   │   │   └── tripsSlice.ts        # Redux slice for trips state
│   │   ├── dashboard/
│   │   │   ├── uiSlice.ts           # UI state (theme, filters, selected trip)
│   │   │   ├── simulationSlice.ts   # Playback simulation state
│   │   │   └── alertsSlice.ts       # Alerts/exceptions state
│   │   └── map/
│   │       └── (future map features)
│   │
│   ├── data/
│   │   ├── types/
│   │   │   └── index.ts             # 27+ event types, Trip, Vehicle, Driver interfaces
│   │   └── mock/
│   │       └── generateData.ts      # Mock data generators for testing
│   │
│   ├── hooks/
│   │   └── useTheme.ts              # Theme persistence hook
│   │
│   ├── styles/
│   │   └── globals.css              # Global styles, animations, scrollbar styling
│   │
│   ├── App.tsx                      # Main app component
│   └── main.tsx                     # React 18 entry point with Redux provider
│
├── vite.config.ts                   # Vite configuration with @/ path alias
├── tailwind.config.js               # TailwindCSS design tokens
├── postcss.config.js                # PostCSS with autoprefixer
├── tsconfig.app.json                # TypeScript config with path aliases
├── tsconfig.json                    # Root TypeScript config
├── index.html                       # HTML entry point
├── package.json                     # Dependencies & scripts
└── dist/                            # Production build output (pre-built)
```

---

## Core Type System

Located in `src/data/types/index.ts`:

### Trip States
```typescript
'Planned' | 'In-Progress' | 'Paused' | 'Refueling' | 'Completed' | 'Cancelled' | 'Error'
```

### 27+ Event Types
- Trip events: `trip_started`, `trip_completed`, `trip_cancelled`
- Vehicle events: `vehicle_stopped`, `refueling_started`, `refueling_completed`
- Safety events: `speeding_detected`, `harsh_acceleration`, `harsh_braking`
- System events: `signal_lost`, `signal_recovered`, `device_error`
- And 15+ more...

### Key Entities
- **Trip**: Vehicle journey with location, status, metrics, checkpoints, events
- **FleetEvent**: Timestamped events emitted during trip execution
- **Alert**: Exception/alert with severity (info/warning/critical)
- **TripMetrics**: Progress %, distance, ETA, fuel, battery, safety score, violations
- **Vehicle & Driver**: Vehicle info and driver profiles with ratings

---

## Redux Store Architecture

### State Shape
```typescript
{
  trips: {
    data: { [tripId]: Trip },
    allIds: string[]
  },
  ui: {
    selectedTripId?: string,
    theme: 'light' | 'dark',
    searchQuery: string,
    activeFilters: { status?, severity?, vehicleType? }
  },
  simulation: {
    speed: 1 | 5 | 10,
    isPlaying: boolean,
    currentTime: number
  },
  alerts: {
    data: { [alertId]: Alert },
    allIds: string[]
  }
}
```

### Redux Slices

#### 1. **tripsSlice** - Trip data management
- `setTrips()` - Load all trips
- `updateTrip()` - Update individual trip
- `applyTripEvent()` - Add event to trip's event log

#### 2. **uiSlice** - Dashboard UI state
- `selectTrip()` - Select trip for detail view
- `toggleTheme()` / `setTheme()` - Dark/light mode
- `setSearchQuery()` - Update search filter
- `setStatusFilter()` - Filter by trip status
- `setSeverityFilter()` - Filter by alert severity

#### 3. **simulationSlice** - Playback simulation
- `play()` / `pause()` - Playback control
- `setSpeed()` - Change simulation speed (1x, 5x, 10x)
- `tick()` - Advance playback time
- `setPlaybackTime()` - Jump to specific time

#### 4. **alertsSlice** - Exception management
- `addAlert()` - Create new alert
- `removeAlert()` - Remove alert
- `resolveAlert()` - Mark as resolved
- `clearResolved()` - Clean up resolved alerts

---

## Component Architecture

### Layout Hierarchy
```
Layout (Main shell)
├── Header (Search, Theme, Time, Speed indicator)
├── Main Grid
│   ├── Sidebar (Filters, Exceptions, Quick Stats)
│   ├── MainContent
│   │   ├── MapComponent (Leaflet with trip markers)
│   │   └── KPIGrid (4 metric cards)
│   └── RightPanel (TripDetails - timeline & metrics)
└── PlaybackBar (Play/Pause, Speed controls 1x/5x/10x)
```

### Key Components

#### MapComponent
- Integrates Leaflet.js with OpenStreetMap
- Renders trip markers with status-based colors
- Draws route lines between waypoints
- Interactive markers with trip details popup
- Updates reactively when trips change

#### KPIGrid
- Displays 4 key fleet metrics:
  1. Trip Completion Rate (%)
  2. Average Fuel Efficiency (km/l)
  3. Average Safety Score (0-100)
  4. On-Time Delivery Rate (%)
- Color-coded cards (blue, green, purple, orange)
- Real-time calculation from trip data

#### TripDetails
- Header with trip ID, status badge, vehicle/driver info
- Progress ring with percentage
- Metrics panel (distance, ETA, speed, fuel, battery, safety, violations)
- Event log showing recent trip events
- Responsive scrollable layout

---

## Design System & Styling

### Color Palette (TailwindCSS)
- **Primary Brand**: `#1F6FEB` (blue-600)
- **Success**: `#17B26A` (green)
- **Warning**: `#F79009` (orange)
- **Danger**: `#F04438` (red)
- **Neutral**: `#E2E8F0` (gray)

### Typography
- **Display**: 28-32px, 700 weight (page titles)
- **Section**: 20-24px, 600 weight (headers)
- **Body**: 14-16px, 400 weight (content)
- **Label**: 12-13px, 500 weight (tags, captions)
- **Monospace**: JetBrains Mono for metrics

### Spacing System
- 8px grid: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)

### Shadows
- `soft`: 0 4px 12px rgba(0,0,0,0.05)
- `card`: 0 8px 24px rgba(0,0,0,0.06)

### Transitions
- Fast: 150ms cubic-bezier(0.22,1,0.36,1)
- Normal: 200ms cubic-bezier(0.22,1,0.36,1)
- Slow: 300ms cubic-bezier(0.22,1,0.36,1)

---

## Getting Started

### Installation
```bash
cd fleet-dashboard
npm install
```

### Development
```bash
npm run dev
# Opens http://localhost:5173
```

### Build for Production
```bash
npm run build
# Output: dist/
```

### Preview Build
```bash
npm run preview
```

### Run Tests
```bash
npm run test
```

---

## Mock Data Generator

Located in `src/data/mock/generateData.ts`:

### Available Functions
- `generateDrivers(count)` - Create drivers with ratings, violations, total trips
- `generateVehicles(count)` - Create vehicles with fuel/battery capacity
- `generateTrips(count, drivers, vehicles)` - Create trips with realistic routes, metrics, checkpoints
- `generateEvent(tripId, index)` - Create individual events for simulation

### Sample Data
- 5 real Indian cities (Delhi, Bangalore, Mumbai, Hyderabad, Pune, Gurgaon)
- Realistic trip distances (500-1500 km)
- Progress tracking, fuel consumption, safety scores
- Event timestamps for chronological replay

---

## Responsive Design

### Breakpoints
- **Mobile**: < 640px (stacked layout, bottom controls)
- **Tablet**: 640px - 1024px (two-column layout)
- **Desktop**: > 1024px (full dashboard grid)

### Responsive Features
- Sidebar collapsible on mobile
- Map full-width on smaller screens
- KPI cards stack to 2 columns on tablet
- Touch-friendly button sizes (44px minimum)

---

## Performance Optimizations

1. **Code Splitting**: Lazy-load heavy components via React.lazy()
2. **Virtualization**: Leaflet handles marker rendering efficiently
3. **Redux Selectors**: Memoized selectors to prevent unnecessary re-renders
4. **CSS-in-JS**: TailwindCSS purges unused styles in production
5. **Vite Optimizations**: Fast HMR, esbuild bundling
6. **Build Size**: ~120KB gzipped (CSS + JS combined)

---

## Theme System

### Dark Mode Implementation
- CSS class-based: `html.dark` selector
- Stored in localStorage: `fleet-dashboard-theme`
- Fallback to system preference (`prefers-color-scheme`)
- Hook: `useTheme()` for easy integration

### Color Variables
All colors support dark variants:
```css
/* Light mode */
bg-light text-primary
/* Dark mode */
dark:bg-dark dark:text-textPrimaryDark
```

---

## Business Logic Implementation

### Trip State Machine
```
Planned → In-Progress → Paused ↔ Refueling → Completed
    ↓                                            ↑
    └────────────── Cancelled/Error ───────────┘
```

### Key Calculations
- **Progress %** = (Distance Travelled / Planned Distance) × 100
- **ETA** = Remaining Distance / Avg Speed ± Delay Factors
- **Safety Score** = Weighted speed & violation penalties
- **Fuel Anomaly** = Unexpected fuel level increase without refuel event

### Alert Types
1. SLA breach (ETA delay)
2. Speeding or repeated violations
3. Signal lost > 2 minutes
4. Fuel below threshold (<15%)
5. Battery low (predicted failure)
6. Device malfunction

---

## Deployment (GitHub Pages)

### Configuration
```typescript
// vite.config.ts
export default defineConfig({
  base: '/fleet-dashboard/',
  // ...
});
```

### CI/CD Pipeline
GitHub Actions workflow automates:
1. Code checkout
2. Node.js setup (v20)
3. Dependency installation
4. Production build
5. GitHub Pages deployment

---

## Future Enhancements

1. **Real API Integration** - Replace mock data with live backend
2. **WebSocket Support** - Real-time event streaming from server
3. **Advanced Analytics** - Heatmaps, route optimization, driver analytics
4. **Mobile App** - React Native version for iOS/Android
5. **Notifications** - Push notifications for critical alerts
6. **Export Features** - PDF reports, CSV data export
7. **Advanced Filtering** - Multi-select filters, saved presets
8. **Route Planning** - Route optimization engine
9. **Video Integration** - Dashcam feed integration
10. **Geofencing** - Geofence alerts and boundary tracking

---

## Troubleshooting

### Map not rendering?
- Ensure Leaflet CSS is imported: `import 'leaflet/dist/leaflet.css'`
- Check browser console for errors
- Verify OpenStreetMap tiles are accessible

### Redux state not updating?
- Check Redux DevTools browser extension
- Verify actions are dispatched: `console.log(action)`
- Ensure reducers return new state objects

### Styling issues?
- Check TailwindCSS is properly configured
- Run `npm run build` to verify CSS generation
- Clear cache: `rm -rf node_modules/.vite`

---

## License

This project is built for demonstration purposes following industry best practices in fleet management software.

---

## Support & Documentation

- **Redux Docs**: https://redux-toolkit.js.org/
- **React Docs**: https://react.dev
- **TailwindCSS**: https://tailwindcss.com
- **Leaflet**: https://leafletjs.com
- **Vite**: https://vitejs.dev

---

**Built by**: Claude Code + Senior Frontend Architect
**Date**: November 2025
**Version**: 1.0.0 (MVP)
