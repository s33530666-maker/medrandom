import { Play, Pause, RotateCcw, Plus, Volume2 } from 'lucide-react';

interface TimerCircleProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  phase: 'research' | 'explain';
  onToggle: () => void;
  onReset: () => void;
  onAddMinute: () => void;
}

export const TimerCircle = ({
  secondsLeft,
  totalSeconds,
  isRunning,
  phase,
  onToggle,
  onReset,
  onAddMinute,
}: TimerCircleProps) => {
  const size = 240;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 6;
  const circumference = 2 * Math.PI * radius;

  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;
  const strokeDashoffset = circumference - progress * circumference;

  // Format MM:SS
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Color dynamics based on phase and remaining percentage
  const isExplain = phase === 'explain';
  let strokeColor = isExplain ? 'text-indigo-400' : 'text-teal-400';
  let glowClass = isExplain ? 'glow-indigo' : 'glow-teal';

  if (progress <= 0.15 && secondsLeft > 0) {
    strokeColor = 'text-rose-400';
  } else if (progress <= 0.35 && secondsLeft > 0) {
    strokeColor = 'text-amber-400';
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-500 max-w-[240px] sm:max-w-[260px] w-full aspect-square ${isRunning ? glowClass : ''}`}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full transform -rotate-90"
        >
          {/* Background track circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-800/80"
          />

          {/* Animated active progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className={`${strokeColor} transition-all duration-500 ease-out`}
          />
        </svg>

        {/* Center Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none p-2">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5 sm:mb-1 flex items-center gap-1">
            {isExplain ? '🗣️ Verbal Recall' : '🔬 Deep Research'}
          </span>
          <span className="text-3xl sm:text-5xl font-extrabold font-mono tracking-tight text-white drop-shadow-sm">
            {formattedTime}
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium">
            {secondsLeft === 0 ? (
              <span className="text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" /> Time Expired!
              </span>
            ) : isRunning ? (
              <span className="text-teal-400 font-medium">Timer Active</span>
            ) : (
              'Paused'
            )}
          </span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center space-x-3 mt-4 w-full justify-center">
        <button
          onClick={onReset}
          title="Reset timer to start"
          className="p-3 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60 active:scale-95 shadow-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggle}
          className={`flex items-center justify-center space-x-2 px-6 sm:px-7 py-3 sm:py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95 min-h-[44px] ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : isExplain
              ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/25'
              : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/25'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>{secondsLeft === 0 ? 'Restart' : 'Start Timer'}</span>
            </>
          )}
        </button>

        <button
          onClick={onAddMinute}
          title="Add +1 Minute"
          className="flex items-center justify-center space-x-1 px-3.5 sm:px-3 py-3 sm:py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60 active:scale-95 shadow-sm text-xs font-semibold min-w-[44px] min-h-[44px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>1m</span>
        </button>
      </div>
    </div>
  );
};
