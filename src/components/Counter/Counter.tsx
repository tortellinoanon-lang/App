import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { CounterState } from '../../types';
import { loadCounter, saveCounter } from '../../utils/storage';
import { triggerHaptic } from '../../utils/audio';
import { useSettings } from '../../contexts/SettingsContext';

export function Counter() {
  const { settings } = useSettings();
  const [counter, setCounter] = useState<CounterState>(loadCounter());
  const longPressTimer = useRef<number | null>(null);
  const longPressInterval = useRef<number | null>(null);

  useEffect(() => {
    saveCounter(counter);
  }, [counter]);

  const increment = () => {
    setCounter(prev => ({ ...prev, value: prev.value + 1 }));
    if (settings.hapticsEnabled) triggerHaptic(30);
  };

  const decrement = () => {
    setCounter(prev => ({ ...prev, value: Math.max(0, prev.value - 1) }));
    if (settings.hapticsEnabled) triggerHaptic(30);
  };

  const reset = () => {
    setCounter(prev => ({ ...prev, value: 0 }));
    if (settings.hapticsEnabled) triggerHaptic([50, 30, 50]);
  };

  const startLongPress = (action: () => void) => {
    if (!settings.longPressAcceleration) return;

    longPressTimer.current = window.setTimeout(() => {
      let delay = 100;
      longPressInterval.current = window.setInterval(() => {
        action();
        delay = Math.max(30, delay - 10);
      }, delay);
    }, 500);
  };

  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (longPressInterval.current) {
      clearInterval(longPressInterval.current);
      longPressInterval.current = null;
    }
  };

  return (
    <div className="bg-white dark:bg-[#121316] rounded-2xl shadow-lg p-8 flex flex-col items-center">
      <div className="text-8xl font-bold text-gray-900 dark:text-white mb-4 tabular-nums">
        {counter.value}
      </div>

      <input
        type="text"
        value={counter.label}
        onChange={(e) => setCounter(prev => ({ ...prev, label: e.target.value }))}
        className="text-center text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none mb-8 px-4 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        placeholder="Label"
      />

      <div className="flex items-center gap-6">
        <button
          onMouseDown={() => {
            decrement();
            startLongPress(decrement);
          }}
          onMouseUp={endLongPress}
          onMouseLeave={endLongPress}
          onTouchStart={() => {
            decrement();
            startLongPress(decrement);
          }}
          onTouchEnd={endLongPress}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center group relative overflow-hidden"
          aria-label="Decrement"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 rounded-full transition-opacity" />
          <Minus size={32} strokeWidth={3} />
        </button>

        <button
          onClick={reset}
          className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all flex items-center justify-center"
          aria-label="Reset"
        >
          <RotateCcw size={24} />
        </button>

        <button
          onMouseDown={() => {
            increment();
            startLongPress(increment);
          }}
          onMouseUp={endLongPress}
          onMouseLeave={endLongPress}
          onTouchStart={() => {
            increment();
            startLongPress(increment);
          }}
          onTouchEnd={endLongPress}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center group relative overflow-hidden"
          aria-label="Increment"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 rounded-full transition-opacity" />
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
