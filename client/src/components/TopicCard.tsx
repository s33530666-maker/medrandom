import { useState } from 'react';
import { Topic, CategoryType, DifficultyType } from '../types';
import { RefreshCw, HelpCircle, ChevronDown, ChevronUp, Sparkles, Tag, Copy, Check } from 'lucide-react';

interface TopicCardProps {
  topic: Topic | null;
  onRedraw: () => void;
  isDrawing: boolean;
  remainingInPool: number;
  totalInFilter: number;
  cycleReset: boolean;
}

export function getCategoryBadgeClasses(category: CategoryType): string {
  switch (category) {
    case 'Anatomy':
      return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    case 'Physiology':
      return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
    case 'Pathology':
      return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    case 'Pharmacology':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    case 'Microbiology':
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    case 'Clinical Cases':
      return 'bg-teal-500/10 text-teal-300 border-teal-500/30';
    case 'Clinical Nutrition':
      return 'bg-lime-500/10 text-lime-300 border-lime-500/30';
    case 'Public Health':
      return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    case 'Research & EBM':
      return 'bg-violet-500/10 text-violet-300 border-violet-500/30';
    default:
      return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
  }
}

export function getDifficultyBadgeClasses(difficulty: DifficultyType): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'medium':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'hard':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export const TopicCard = ({
  topic,
  onRedraw,
  isDrawing,
  remainingInPool,
  totalInFilter,
  cycleReset,
}: TopicCardProps) => {
  const [showHint, setShowHint] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyTitle = async () => {
    if (!topic) return;
    try {
      await navigator.clipboard.writeText(topic.title);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  if (!topic) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-12 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-teal-400 mb-3 sm:mb-4 shadow-inner">
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-slate-200 mb-2">Ready for today's draw?</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-4 sm:mb-6">
          Pick your preferred category and difficulty filter, then draw a random topic to start your timed research and verbal recall.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-7 shadow-xl relative overflow-hidden backdrop-blur-sm animate-scale-in">
      {/* Background ambient accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          {/* Category Pill */}
          <span
            className={`px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider rounded-lg border ${getCategoryBadgeClasses(
              topic.category
            )}`}
          >
            {topic.category}
          </span>

          {/* Difficulty Badge */}
          <span
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider rounded-lg border ${getDifficultyBadgeClasses(
              topic.difficulty
            )}`}
          >
            {topic.difficulty}
          </span>
        </div>

        {/* Pool Counter & Redraw Action */}
        <div className="flex items-center space-x-2">
          <span
            title="Remaining unseen topics in this filter cycle before repeating"
            className="text-[10px] sm:text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-slate-700/50"
          >
            {remainingInPool} left ({totalInFilter} total)
          </span>

          <button
            onClick={onRedraw}
            disabled={isDrawing}
            title="Redraw another topic"
            className="flex items-center space-x-1 px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDrawing ? 'animate-spin text-teal-400' : ''}`} />
            <span className="hidden xs:inline">Pass / Redraw</span>
            <span className="xs:hidden">Pass</span>
          </button>
        </div>
      </div>

      {cycleReset && (
        <div className="mb-3.5 text-xs font-medium text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
          🎉 You have seen all topics in this filter! A fresh cycle has started.
        </div>
      )}

      {/* Topic Title with Copy Button */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug flex-1">
          {topic.title}
        </h2>

        {/* Copy Button */}
        <button
          onClick={handleCopyTitle}
          title="Copy topic name to clipboard"
          aria-label="Copy topic title"
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-90 ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-teal-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Focus Prompts / Clinical Context Toggle */}
      {topic.description && (
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center space-x-2 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors py-1"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showHint ? 'Hide Study Focus & Prompts' : 'Show Study Focus & Prompts'}</span>
            {showHint ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showHint && (
            <div className="mt-2.5 p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-teal-500/20 text-slate-300 text-xs sm:text-sm leading-relaxed animate-fade-in">
              <div className="flex items-center space-x-1.5 text-teal-400 font-semibold mb-1 text-xs">
                <Tag className="w-3.5 h-3.5" />
                <span>High-Yield Checklist / Key Questions:</span>
              </div>
              <p className="text-slate-300">{topic.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

