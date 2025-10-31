export interface Activity {
  id: string;
  name: string;
  duration: number;
  color: 'green' | 'orange' | 'neutral';
  order: number;
}

export interface Profile {
  id: string;
  name: string;
  activities: Activity[];
  repeatCount: number;
  created_at: string;
  updated_at: string;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentActivityIndex: number;
  currentCycle: number;
  remainingTime: number;
  startTimestamp: number | null;
}

export interface Settings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  longPressAcceleration: boolean;
  keepScreenAwake: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface CounterState {
  value: number;
  label: string;
}
