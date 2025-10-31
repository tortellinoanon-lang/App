import { Activity } from '../../types';

interface TimerDisplayProps {
  activity: Activity;
  remainingTime: number;
  progress: number;
  currentActivityIndex: number;
  totalActivities: number;
  currentCycle: number;
  totalCycles: number;
}

export function TimerDisplay({
  activity,
  remainingTime,
  progress,
  currentActivityIndex,
  totalActivities,
  currentCycle,
  totalCycles
}: TimerDisplayProps) {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  const colorMap = {
    green: '#4CAF50',
    orange: '#FF9800',
    neutral: '#6B7280'
  };

  const strokeColor = colorMap[activity.color];
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            {activity.name}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Activity {currentActivityIndex + 1} of {totalActivities} — Cycle {currentCycle} of {totalCycles}
      </div>

      <div className="w-full max-w-md">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{
              width: `${((currentActivityIndex + progress / 100) / totalActivities) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}
