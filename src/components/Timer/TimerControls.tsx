import { Play, Pause, Square, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSkipCycle: () => void;
  canSkipCycle: boolean;
}

export function TimerControls({
  isRunning,
  isPaused,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrev,
  onSkipCycle,
  canSkipCycle
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={onPrev}
        className="w-12 h-12 rounded-full bg-white dark:bg-[#121316] shadow-md hover:shadow-lg transition-all flex items-center justify-center text-gray-700 dark:text-gray-300"
        aria-label="Previous activity"
      >
        <ChevronLeft size={24} />
      </button>

      {isRunning && !isPaused ? (
        <button
          onClick={onPause}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
          aria-label="Pause"
        >
          <Pause size={28} />
        </button>
      ) : (
        <button
          onClick={onPlay}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
          aria-label="Play"
        >
          <Play size={28} className="ml-1" />
        </button>
      )}

      <button
        onClick={onNext}
        className="w-12 h-12 rounded-full bg-white dark:bg-[#121316] shadow-md hover:shadow-lg transition-all flex items-center justify-center text-gray-700 dark:text-gray-300"
        aria-label="Next activity"
      >
        <ChevronRight size={24} />
      </button>

      {isRunning && (
        <>
          <button
            onClick={onStop}
            className="w-12 h-12 rounded-full bg-white dark:bg-[#121316] shadow-md hover:shadow-lg transition-all flex items-center justify-center text-red-600 dark:text-red-400 ml-2"
            aria-label="Stop"
          >
            <Square size={20} fill="currentColor" />
          </button>

          {canSkipCycle && (
            <button
              onClick={onSkipCycle}
              className="w-12 h-12 rounded-full bg-white dark:bg-[#121316] shadow-md hover:shadow-lg transition-all flex items-center justify-center text-gray-700 dark:text-gray-300"
              aria-label="Skip cycle"
            >
              <SkipForward size={20} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
