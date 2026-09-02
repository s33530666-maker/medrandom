import { useState, useEffect } from 'react';
import {
  History,
  Flame,
  Trophy,
  BookOpen,
  Clock,
  Search,
  FileText,
  X,
  ChevronRight,
  Calendar,
  Copy,
  Check,
} from 'lucide-react';
import { Attempt, StreakStats } from '../types';
import { fetchAttempts, fetchStreakStats } from '../lib/api';
import { getCategoryBadgeClasses, getDifficultyBadgeClasses } from './TopicCard';

interface HistoryPageProps {
  onStartStudy: () => void;
}

export const HistoryPage = ({ onStartStudy }: HistoryPageProps) => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [stats, setStats] = useState<StreakStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeNotesAttempt, setActiveNotesAttempt] = useState<Attempt | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [attemptsData, statsData] = await Promise.all([
        fetchAttempts(),
        fetchStreakStats(),
      ]);
      setAttempts(attemptsData);
      setStats(statsData);
    } catch (e) {
      console.error('Failed to load history data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesCategory =
      selectedCategory === 'all' || attempt.topic.category === selectedCategory;
    const matchesSearch =
      searchTerm.trim() === '' ||
      attempt.topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attempt.notes && attempt.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Current Streak */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex items-center space-x-3 sm:space-x-4 shadow-lg">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">
              {stats?.currentStreak ?? 0}{' '}
              <span className="text-xs sm:text-sm font-normal text-slate-400">days</span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Current Streak</div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex items-center space-x-3 sm:space-x-4 shadow-lg">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">
              {stats?.longestStreak ?? 0}{' '}
              <span className="text-xs sm:text-sm font-normal text-slate-400">days</span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Best Streak</div>
          </div>
        </div>

        {/* Total Topics Completed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex items-center space-x-3 sm:space-x-4 shadow-lg">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">{stats?.totalCompleted ?? 0}</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Topics Mastered</div>
          </div>
        </div>

        {/* Total Time Researched */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex items-center space-x-3 sm:space-x-4 shadow-lg">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">
              {stats?.totalResearchMinutes ?? 0}{' '}
              <span className="text-xs sm:text-sm font-normal text-slate-400">min</span>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Total Study Time</div>
          </div>
        </div>
      </div>

      {/* 2. History Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past topics or notes..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            'all',
            'Anatomy',
            'Physiology',
            'Pathology',
            'Pharmacology',
            'Microbiology',
            'Clinical Cases',
            'Clinical Nutrition',
            'Public Health',
            'Research & EBM',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Attempts Timeline / List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">Study History Log</h3>
          </div>
          <span className="text-xs text-slate-400">
            {filteredAttempts.length} of {attempts.length} attempts
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading your study logs...
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
              <History className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-200 mb-1">No Study Attempts Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              Draw your first random topic in the Study Room to start tracking your daily medical recall streak!
            </p>
            <button
              onClick={onStartStudy}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all inline-flex items-center space-x-1.5"
            >
              <span>Start Drawing Topics</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredAttempts.map((attempt) => {
              const date = new Date(attempt.startedAt);
              const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={attempt.id}
                  className="p-4 sm:p-5 sm:px-6 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded border ${getCategoryBadgeClasses(
                          attempt.topic.category
                        )}`}
                      >
                        {attempt.topic.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded border ${getDifficultyBadgeClasses(
                          attempt.topic.difficulty
                        )}`}
                      >
                        {attempt.topic.difficulty}
                      </span>
                      <div className="flex items-center space-x-1 text-slate-400 text-[11px] sm:text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {formattedDate} • {formattedTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {attempt.topic.title}
                      </h4>
                      <button
                        onClick={() => handleCopy(attempt.id, attempt.topic.title)}
                        title="Copy topic name"
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                      >
                        {copiedId === attempt.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {attempt.notes && (
                      <p className="text-xs text-slate-400 line-clamp-2 italic">
                        "{attempt.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions & Durations */}
                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <div className="text-left sm:text-right text-xs">
                      <div className="text-slate-200 font-semibold">
                        {Math.floor(((attempt.researchSecs || 0) + (attempt.explainSecs || 0)) / 60)}m{' '}
                        {((attempt.researchSecs || 0) + (attempt.explainSecs || 0)) % 60}s
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {attempt.researchSecs ? `${Math.floor(attempt.researchSecs / 60)}m res` : ''}{' '}
                        {attempt.explainSecs ? `• ${Math.floor(attempt.explainSecs / 60)}m exp` : ''}
                      </div>
                    </div>

                    {attempt.notes && (
                      <button
                        onClick={() => setActiveNotesAttempt(attempt)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700/60 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-400" />
                        <span>View Notes</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Notes Viewer Modal */}
      {activeNotesAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${getCategoryBadgeClasses(
                    activeNotesAttempt.topic.category
                  )}`}
                >
                  {activeNotesAttempt.topic.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {activeNotesAttempt.topic.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveNotesAttempt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Study Notes Taken During Session
              </label>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {activeNotesAttempt.notes}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveNotesAttempt(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
