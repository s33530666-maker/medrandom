import { Flame, BookOpen, Activity, History, Stethoscope } from 'lucide-react';
import { StreakStats } from '../types';

interface HeaderProps {
  activeTab: 'studio' | 'history' | 'bank';
  setActiveTab: (tab: 'studio' | 'history' | 'bank') => void;
  streakStats: StreakStats | null;
  onRefreshStreak?: () => void;
}

export const Header = ({
  activeTab,
  setActiveTab,
  streakStats,
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none active:scale-95 transition-transform"
            onClick={() => setActiveTab('studio')}
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-sm">
              <Stethoscope className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                MedRandom
              </span>
            </div>
          </div>

          {/* Center Navigation (Desktop) */}
          <nav className="hidden sm:flex items-center space-x-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'studio'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Study</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bank'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Topics</span>
            </button>
          </nav>

          {/* Right Streak Badge */}
          <div
            title={`Current streak: ${streakStats?.currentStreak ?? 0} days`}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-bold"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{streakStats?.currentStreak ?? 0}</span>
            <span className="text-slate-400 font-normal text-[11px]">
              {(streakStats?.currentStreak ?? 0) === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex sm:hidden items-center justify-around py-2 border-t border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'studio' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Study</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'history' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-lg font-semibold transition-all ${
              activeTab === 'bank' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Topics</span>
          </button>
        </div>
      </div>
    </header>
  );
};
