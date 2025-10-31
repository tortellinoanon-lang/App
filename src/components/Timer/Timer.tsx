import { useState, useEffect, useRef } from 'react';
import { Activity, TimerState } from '../../types';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { ActivityEditor } from './ActivityEditor';
import { playBeep } from '../../utils/audio';
import { triggerHaptic } from '../../utils/audio';
import { useSettings } from '../../contexts/SettingsContext';

interface TimerProps {
  activities: Activity[];
  repeatCount: number;
  onActivitiesChange: (activities: Activity[]) => void;
  onRepeatCountChange: (count: number) => void;
  onSave: () => void;
}

export function Timer({ activities, repeatCount, onActivitiesChange, onRepeatCountChange, onSave }: TimerProps) {
  const { settings } = useSettings();
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    currentActivityIndex: 0,
    currentCycle: 1,
    remainingTime: 0,
    startTimestamp: null
  });

  const workerRef = useRef<Worker | null>(null);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (activities.length > 0 && !timerState.isRunning) {
      setTimerState(prev => ({
        ...prev,
        remainingTime: activities[0].duration
      }));
    }
  }, [activities]);

  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      const interval = setInterval(() => {
        setTimerState(prev => {
          if (prev.startTimestamp === null) return prev;

          const elapsed = Math.floor((Date.now() - prev.startTimestamp) / 1000);
          const currentActivity = activities[prev.currentActivityIndex];
          const newRemaining = currentActivity.duration - elapsed;

          if (newRemaining <= 0) {
            if (settings.soundEnabled) playBeep();
            if (settings.hapticsEnabled) triggerHaptic([100, 50, 100]);

            const nextIndex = prev.currentActivityIndex + 1;

            if (nextIndex >= activities.length) {
              if (prev.currentCycle < repeatCount) {
                return {
                  ...prev,
                  currentActivityIndex: 0,
                  currentCycle: prev.currentCycle + 1,
                  remainingTime: activities[0].duration,
                  startTimestamp: Date.now()
                };
              } else {
                return {
                  ...prev,
                  isRunning: false,
                  isPaused: false,
                  currentActivityIndex: 0,
                  currentCycle: 1,
                  remainingTime: activities[0].duration,
                  startTimestamp: null
                };
              }
            } else {
              return {
                ...prev,
                currentActivityIndex: nextIndex,
                remainingTime: activities[nextIndex].duration,
                startTimestamp: Date.now()
              };
            }
          }

          return { ...prev, remainingTime: newRemaining };
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [timerState.isRunning, timerState.isPaused, activities, repeatCount, settings]);

  useEffect(() => {
    if (settings.keepScreenAwake && timerState.isRunning && !timerState.isPaused) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => releaseWakeLock();
  }, [settings.keepScreenAwake, timerState.isRunning, timerState.isPaused]);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (error) {
        console.error('Wake lock error:', error);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const handlePlay = () => {
    if (activities.length === 0) return;

    if (timerState.isPaused) {
      const pausedTime = timerState.remainingTime;
      const activity = activities[timerState.currentActivityIndex];
      const elapsed = activity.duration - pausedTime;

      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false,
        startTimestamp: Date.now() - (elapsed * 1000)
      }));
    } else {
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false,
        startTimestamp: Date.now()
      }));
    }
  };

  const handlePause = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: true,
      startTimestamp: null
    }));
  };

  const handleStop = () => {
    setTimerState({
      isRunning: false,
      isPaused: false,
      currentActivityIndex: 0,
      currentCycle: 1,
      remainingTime: activities[0]?.duration || 0,
      startTimestamp: null
    });
  };

  const handleNext = () => {
    const nextIndex = (timerState.currentActivityIndex + 1) % activities.length;
    setTimerState(prev => ({
      ...prev,
      currentActivityIndex: nextIndex,
      remainingTime: activities[nextIndex].duration,
      startTimestamp: prev.isRunning && !prev.isPaused ? Date.now() : null
    }));
  };

  const handlePrev = () => {
    const prevIndex = timerState.currentActivityIndex === 0
      ? activities.length - 1
      : timerState.currentActivityIndex - 1;
    setTimerState(prev => ({
      ...prev,
      currentActivityIndex: prevIndex,
      remainingTime: activities[prevIndex].duration,
      startTimestamp: prev.isRunning && !prev.isPaused ? Date.now() : null
    }));
  };

  const handleSkipCycle = () => {
    if (timerState.currentCycle < repeatCount) {
      setTimerState(prev => ({
        ...prev,
        currentActivityIndex: 0,
        currentCycle: prev.currentCycle + 1,
        remainingTime: activities[0].duration,
        startTimestamp: prev.isRunning && !prev.isPaused ? Date.now() : null
      }));
    }
  };

  const currentActivity = activities[timerState.currentActivityIndex];
  const totalActivities = activities.length;
  const progress = currentActivity
    ? ((currentActivity.duration - timerState.remainingTime) / currentActivity.duration) * 100
    : 0;

  return (
    <div className="space-y-6">
      <ActivityEditor
        activities={activities}
        repeatCount={repeatCount}
        onActivitiesChange={onActivitiesChange}
        onRepeatCountChange={onRepeatCountChange}
        onSave={onSave}
      />

      {activities.length > 0 && (
        <>
          <TimerDisplay
            activity={currentActivity}
            remainingTime={timerState.remainingTime}
            progress={progress}
            currentActivityIndex={timerState.currentActivityIndex}
            totalActivities={totalActivities}
            currentCycle={timerState.currentCycle}
            totalCycles={repeatCount}
          />

          <TimerControls
            isRunning={timerState.isRunning}
            isPaused={timerState.isPaused}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkipCycle={handleSkipCycle}
            canSkipCycle={timerState.currentCycle < repeatCount}
          />
        </>
      )}
    </div>
  );
}
