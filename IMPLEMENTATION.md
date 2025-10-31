# Vibe Training App - Implementation Guide

## Overview

A fully offline-first, single-page training app with timer sequences and a counter. All data persists locally on the device using IndexedDB with localStorage fallback. Works completely without network connection.

## Features Implemented

### Timer Section
- **Sequence Editor**: Build ordered sequences of named activities
  - Each activity has: name, duration (mm:ss or seconds), color hint (green/orange/neutral)
  - Drag-and-drop reordering with grip handles
  - Inline editing of name, duration, and color
  - Add/remove activities
  - Set repeat count (e.g., Repeat ×3)

- **Timer Runner**:
  - Large circular progress ring showing current activity progress
  - Displays activity name and remaining time prominently
  - Overall sequence progress indicator (e.g., "Activity 2 of 6 — Cycle 1 of 3")
  - Controls: Play, Pause, Stop, Next, Prev, Skip Cycle
  - Optional beep sound at end of each activity (toggle in editor)
  - Sound generated with Web Audio API (works offline)
  - Accurate timing using monotonic timestamps (survives backgrounding)

### Counter Section
- Large centered numeric display
- Editable label (defaults to "Reps")
- Large + and - buttons with tactile feedback
- Reset button
- Long-press acceleration for rapid increment/decrement
- Haptic feedback (configurable)

### Saved Profiles
- Save timer sequences as named profiles
- Profile cards show: name, activity count, total time, repeat count
- Actions: Load, Edit, Duplicate, Delete
- Preview of first 3 activities with color dots
- All profiles persist in IndexedDB

### Offline Storage
- **Primary**: IndexedDB (`vibe_profiles_db`) for reliable large storage
- **Fallback**: localStorage for simple builds
- **Persistence**: Requests persistent storage to avoid eviction
- **Service Worker**: Caches app shell and assets for offline boot
- **Export/Import**: Manual backup to JSON file

### Settings
- Sound toggle (enable/disable activity end beep)
- Haptics toggle (vibration feedback)
- Long-press acceleration toggle
- Keep screen awake (Wake Lock API)
- Export all profiles to JSON
- Import profiles from JSON
- Clear all data (with confirmation)

### Responsive Design
- **Mobile**: Bottom navigation tabs (Home, Profiles, Settings)
  - Compact layout: timer + counter fit on screen without scrolling
  - Tab-based navigation

- **Desktop/Tablet**: Two-column layout
  - Left: Timer + Counter (main area)
  - Right: Saved Profiles + Settings (sidebar)

### Accessibility
- Keyboard navigation support
- ARIA roles and labels
- Touch targets ≥44×44px
- High color contrast (WCAG compliant)
- Visible focus states
- Respects `prefers-reduced-motion`

### PWA Features
- Service worker for offline caching
- Web App Manifest
- Can be installed on home screen
- Works fully offline after first load

## Data Model

### Profile
```json
{
  "id": "uuid",
  "name": "Morning Workout",
  "activities": [
    {
      "id": "uuid",
      "name": "Warmup",
      "duration": 60,
      "color": "neutral",
      "order": 0
    },
    {
      "id": "uuid",
      "name": "Exercise",
      "duration": 120,
      "color": "green",
      "order": 1
    },
    {
      "id": "uuid",
      "name": "Rest",
      "duration": 30,
      "color": "orange",
      "order": 2
    }
  ],
  "repeatCount": 3,
  "created_at": "2025-10-31T12:00:00.000Z",
  "updated_at": "2025-10-31T12:00:00.000Z"
}
```

### Settings
```json
{
  "soundEnabled": true,
  "hapticsEnabled": false,
  "longPressAcceleration": true,
  "keepScreenAwake": false,
  "theme": "auto"
}
```

### Counter State
```json
{
  "value": 0,
  "label": "Reps"
}
```

## Storage Keys

- **IndexedDB**: `vibe_profiles_db` (database name)
  - Object store: `profiles`
  - Indexes: `created_at`, `updated_at`

- **localStorage**:
  - `vibe_profiles_v1` - Profile backup/fallback
  - `vibe_settings_v1` - User settings
  - `vibe_counter_v1` - Counter state

## User Flows

### Create & Save Profile
1. Build sequence in Timer editor (add activities, set durations, colors)
2. Set repeat count
3. Click "Save" button
4. Enter profile name in modal
5. Profile saved to IndexedDB and appears in Profiles list

### Load Profile
1. Go to Profiles (tab on mobile, sidebar on desktop)
2. Click "Load" on desired profile
3. Timer editor populates with profile's activities
4. Ready to run (click Play)

### Edit Profile
1. Go to Profiles
2. Click "Edit" on profile
3. Modify activities/settings in Timer editor
4. Click "Save" to update profile

### Run Timer
1. Build or load a sequence
2. Click Play button
3. Circular progress ring animates
4. Optional beep plays at end of each activity (if enabled)
5. Auto-advances through activities
6. Respects repeat count
7. Controls: Pause, Next, Prev, Skip Cycle, Stop

### Use Counter
1. View large number display
2. Tap + to increment, - to decrement
3. Long-press for rapid change (if enabled)
4. Edit label by clicking on it
5. Tap Reset to return to zero
6. State auto-saves

## Technical Implementation

### Offline Timer Accuracy
- Records monotonic `Date.now()` timestamp on activity start
- Computes remaining time from elapsed real time (not interval ticks)
- Re-syncs on page visibility change
- Survives device sleep and app backgrounding

### Audio (Offline)
- Web Audio API generates beep tone (two 800Hz sine pulses)
- No external audio files needed
- Works offline in all browsers

### Haptics (Offline)
- Uses Vibration API (`navigator.vibrate()`)
- Works without network
- User opt-in via Settings

### Background Behavior
- Wake Lock API keeps screen on during timer (optional)
- Timer continues accurately when app is foregrounded
- State persists across page refreshes

### Service Worker
- Caches app shell (HTML, CSS, JS)
- Caches all assets on first load
- Serves from cache when offline
- Updates opportunistically when online

## Design Tokens

```css
/* Colors */
--bg-light: #F6F7F9;
--bg-dark: #0F1113;
--card-light: #FFFFFF;
--card-dark: #121316;
--active: #4CAF50;
--rest: #FF9800;
--muted: #6B7280;

/* Radius */
--card-radius: 12px-16px;
--button-radius: 10px;

/* Shadow */
--shadow: 0 6px 18px rgba(10,15,30,0.06);
```

## Browser Compatibility

- IndexedDB: All modern browsers
- Service Worker: Chrome, Firefox, Safari, Edge
- Web Audio API: All modern browsers
- Vibration API: Chrome, Firefox, Edge (not Safari)
- Wake Lock API: Chrome, Edge (progressive enhancement)

## Setup for Developers

1. Clone repository
2. `npm install`
3. `npm run dev` - Start dev server
4. `npm run build` - Build for production
5. `npm run preview` - Preview production build

## Native Wrappers (Cordova/Capacitor)

For native apps:
- Replace IndexedDB with platform secure storage
- Bundle audio in app assets
- Use native storage APIs
- Use native vibration APIs

## Cloud Sync (Future Enhancement)

Structure is ready for optional cloud sync:
- Local storage operations abstract to GET/POST/PUT/DELETE
- Add API endpoints when needed
- Implement conflict resolution
- Queue sync operations when offline
- Two-way sync on user opt-in only

## Deployment Notes

- Deploy to any static host (Vercel, Netlify, GitHub Pages)
- Service worker requires HTTPS (or localhost)
- First load requires network, then fully offline
- Consider using CDN for faster initial load

## Accessibility Features

- All interactive elements keyboard accessible
- Screen reader friendly (ARIA labels)
- High contrast color scheme
- Reduced motion support
- Large touch targets (44px minimum)
- Focus indicators visible

## Performance

- Lazy loads components
- Efficient re-renders with React
- IndexedDB for large datasets
- Service worker caching reduces network requests
- Optimized bundle size (~185KB JS, ~19KB CSS)

## Testing Offline Mode

1. Load app once while online
2. Open DevTools > Application > Service Workers
3. Check "Offline" mode
4. Reload page - should load from cache
5. Create/edit/save profiles - all works offline
6. Export data still works (downloads locally)

## Support

All features work fully offline after initial page load. No server required for core functionality.
