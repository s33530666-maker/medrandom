import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Dices,
  BookOpen,
  Mic,
  FileEdit,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Clock,
  X,
} from 'lucide-react';
import { Topic, CategoryType, DifficultyType } from '../types';
import { fetchRandomTopic, recordAttempt } from '../lib/api';
import { playTimerFinishSound, playCelebrationSound } from '../lib/audio';
import { TopicCard } from './TopicCard';
import { TimerCircle } from './TimerCircle';

interface StudyStudioProps {
  onSessionCompleted: () => void;
}

const CATEGORIES: { label: string; value: CategoryType | 'all' }[] = [
  { label: 'All Disciplines (الكل)', value: 'all' },
  { label: 'Anatomy (تشريح)', value: 'Anatomy' },
  { label: 'Physiology (وظائف الأعضاء)', value: 'Physiology' },
  { label: 'Pathology (علم الأمراض)', value: 'Pathology' },
  { label: 'Pharmacology (علم الأدوية)', value: 'Pharmacology' },
  { label: 'Microbiology (أحياء دقيقة)', value: 'Microbiology' },
  { label: 'Clinical Cases (حالات سريرية)', value: 'Clinical Cases' },
  { label: 'Clinical Nutrition (تغذية علاجية)', value: 'Clinical Nutrition' },
  { label: 'Public Health (صحة عامة)', value: 'Public Health' },
  { label: 'Research & EBM (بحث علمي و EBM)', value: 'Research & EBM' },
];

const DIFFICULTIES: { label: string; value: DifficultyType | 'all' }[] = [
  { label: 'All Levels (كل المستويات)', value: 'all' },
  { label: 'Easy (سهل)', value: 'easy' },
  { label: 'Medium (متوسط)', value: 'medium' },
  { label: 'Hard (متقدم)', value: 'hard' },
];

const RESEARCH_PRESETS = [
  { label: '10 min', seconds: 10 * 60 },
  { label: '20 min', seconds: 20 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: '60 min', seconds: 60 * 60 },
];

const EXPLAIN_PRESETS = [
  { label: '1 min', seconds: 1 * 60 },
  { label: '2 min', seconds: 2 * 60 },
  { label: '3 min', seconds: 3 * 60 },
  { label: '5 min', seconds: 5 * 60 },
];

export const StudyStudio = ({ onSessionCompleted }: StudyStudioProps) => {
  // Filter Modal / Panel state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Active Topic & Session
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [excludeIds, setExcludeIds] = useState<number[]>([]);
  const [remainingInPool, setRemainingInPool] = useState<number>(0);
  const [totalInFilter, setTotalInFilter] = useState<number>(0);
  const [cycleReset, setCycleReset] = useState<boolean>(false);

  // Collapsible Secondary Tools
  const [showTimer, setShowTimer] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Timer & Phases
  const [phase, setPhase] = useState<'research' | 'explain'>('research');
  const [researchTotalSeconds, setResearchTotalSeconds] = useState<number>(20 * 60);
  const [explainTotalSeconds, setExplainTotalSeconds] = useState<number>(2 * 60);
  const [secondsLeft, setSecondsLeft] = useState<number>(20 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Tracking duration spent
  const [researchSecsElapsed, setResearchSecsElapsed] = useState<number>(0);
  const [explainSecsElapsed, setExplainSecsElapsed] = useState<number>(0);

  // Study Notes
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // Interval reference
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load excluded IDs from localStorage on mount
  useEffect(() => {
    try {
      const savedExcludes = localStorage.getItem('medrandom_seen_ids');
      if (savedExcludes) {
        setExcludeIds(JSON.parse(savedExcludes));
      }
    } catch (e) {
      console.warn('Failed to parse saved topic session IDs:', e);
    }
  }, []);

  // Timer interval tick handler
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            playTimerFinishSound();
            return 0;
          }
          return prev - 1;
        });

        if (phase === 'research') {
          setResearchSecsElapsed((s) => s + 1);
        } else {
          setExplainSecsElapsed((s) => s + 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase]);

  // Handle Draw Topic
  const handleDrawTopic = async () => {
    setIsDrawing(true);
    try {
      const res = await fetchRandomTopic(selectedCategory, selectedDifficulty, excludeIds);
      setCurrentTopic(res.topic);
      setRemainingInPool(res.remainingInPool);
      setTotalInFilter(res.totalInFilter);
      setCycleReset(res.cycleReset);

      // Update exclusion list
      const updatedExcludes = res.cycleReset ? [res.topic.id] : [...excludeIds, res.topic.id];
      setExcludeIds(updatedExcludes);
      try {
        localStorage.setItem('medrandom_seen_ids', JSON.stringify(updatedExcludes));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }

      // Reset timer & session state
      setPhase('research');
      setSecondsLeft(researchTotalSeconds);
      setIsRunning(false);
      setResearchSecsElapsed(0);
      setExplainSecsElapsed(0);
      setNotes('');
      setSessionCompleted(false);
    } catch (err: any) {
      alert(err.message || 'Error drawing topic. Please verify server is running.');
    } finally {
      setIsDrawing(false);
    }
  };

  // Timer controls
  const handleToggleTimer = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(phase === 'research' ? researchTotalSeconds : explainTotalSeconds);
    }
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(phase === 'research' ? researchTotalSeconds : explainTotalSeconds);
  };

  const handleAddMinute = () => {
    setSecondsLeft((prev) => prev + 60);
  };

  const handleSetResearchPreset = (secs: number) => {
    setResearchTotalSeconds(secs);
    if (phase === 'research') {
      setIsRunning(false);
      setSecondsLeft(secs);
    }
  };

  const handleSetExplainPreset = (secs: number) => {
    setExplainTotalSeconds(secs);
    if (phase === 'explain') {
      setIsRunning(false);
      setSecondsLeft(secs);
    }
  };

  const handleSwitchToExplain = () => {
    setIsRunning(false);
    setPhase('explain');
    setSecondsLeft(explainTotalSeconds);
  };

  const handleSwitchToResearch = () => {
    setIsRunning(false);
    setPhase('research');
    setSecondsLeft(researchTotalSeconds);
  };

  // Save Attempt
  const handleSaveAttempt = async () => {
    if (!currentTopic) return;
    setIsSaving(true);

    try {
      await recordAttempt({
        topicId: currentTopic.id,
        researchSecs: researchSecsElapsed,
        explainSecs: explainSecsElapsed,
        notes: notes.trim() || undefined,
        completed: true,
      });

      setSessionCompleted(true);
      setIsRunning(false);
      playCelebrationSound();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#06b6d4', '#f59e0b', '#ec4899'],
      });

      onSessionCompleted();
    } catch (err: any) {
      alert(err.message || 'Failed to save study attempt.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get active filter readable label
  const activeCategoryLabel =
    CATEGORIES.find((c) => c.value === selectedCategory)?.label || 'All';
  const activeDifficultyLabel =
    DIFFICULTIES.find((d) => d.value === selectedDifficulty)?.label || 'All';
  const hasActiveFilter = selectedCategory !== 'all' || selectedDifficulty !== 'all';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* 1. Ultra-Clean Top Bar with Filter Toggle */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Active Filter:
          </span>
          <span className="text-xs font-semibold text-slate-300 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
            {activeCategoryLabel.split(' ')[0]} • {activeDifficultyLabel.split(' ')[0]}
          </span>
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-sm active:scale-95 ${
            showFilters || hasActiveFilter
              ? 'bg-teal-500/15 text-teal-300 border-teal-500/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
          <span>{showFilters ? 'Hide Filters' : 'Filters & Categories'}</span>
          {hasActiveFilter && (
            <span className="w-2 h-2 rounded-full bg-teal-400 ml-1"></span>
          )}
        </button>
      </div>

      {/* 2. Collapsible Filter Settings Panel (Only shown when toggled) */}
      {showFilters && (
        <div className="bg-slate-900/95 border border-teal-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 animate-scale-in backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Customize Filter</h3>
            </div>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Medical Discipline
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                      selectedCategory === cat.value
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Difficulty Level
              </label>
              <div className="flex flex-wrap gap-1.5 p-1">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setSelectedDifficulty(diff.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                      selectedDifficulty === diff.value
                        ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow transition-all"
            >
              Done / Apply
            </button>
          </div>
        </div>
      )}

      {/* 3. Hero Draw Topic Action */}
      <div className="flex justify-center">
        <button
          onClick={handleDrawTopic}
          disabled={isDrawing}
          className="w-full max-w-lg flex items-center justify-center space-x-3 py-4 px-8 rounded-2xl font-extrabold text-base sm:text-lg text-slate-950 bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-300 hover:from-teal-300 hover:to-cyan-200 shadow-xl shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-60 min-h-[56px]"
        >
          <Dices className={`w-6 h-6 ${isDrawing ? 'animate-spin text-slate-950' : ''}`} />
          <span>{currentTopic ? 'Draw Next Random Topic 🎲' : 'Draw Random Topic 🎲'}</span>
        </button>
      </div>

      {/* 4. Active Topic Presentation Card (Title & Big Copy Button) */}
      <TopicCard
        topic={currentTopic}
        onRedraw={handleDrawTopic}
        isDrawing={isDrawing}
        remainingInPool={remainingInPool}
        totalInFilter={totalInFilter}
        cycleReset={cycleReset}
      />

      {/* 5. Optional Secondary Tools (Timer & Notes) - Clean & Expandable */}
      {currentTopic && (
        <div className="space-y-4 pt-2">
          {/* Secondary Tools Toggle Buttons Bar */}
          <div className="flex items-center justify-center space-x-3 text-xs">
            <button
              onClick={() => setShowTimer(!showTimer)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold transition-all border ${
                showTimer
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{showTimer ? 'Hide Study Timer' : 'Open Study Timer (اختياري)'}</span>
              {showTimer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-semibold transition-all border ${
                showNotes
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>{showNotes ? 'Hide Notes' : 'Open Notes & Log (اختياري)'}</span>
              {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Expanded Timer Section */}
          {showTimer && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl max-w-md mx-auto animate-fade-in">
              <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
                <button
                  onClick={handleSwitchToResearch}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    phase === 'research'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Phase 1: Research</span>
                </button>

                <button
                  onClick={handleSwitchToExplain}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    phase === 'explain'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Phase 2: Explain</span>
                </button>
              </div>

              <TimerCircle
                secondsLeft={secondsLeft}
                totalSeconds={phase === 'research' ? researchTotalSeconds : explainTotalSeconds}
                isRunning={isRunning}
                phase={phase}
                onToggle={handleToggleTimer}
                onReset={handleResetTimer}
                onAddMinute={handleAddMinute}
              />

              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Presets:</span>
                  <span className="font-mono text-slate-400 text-xs">
                    Elapsed: {Math.floor((phase === 'research' ? researchSecsElapsed : explainSecsElapsed) / 60)}m{' '}
                    {(phase === 'research' ? researchSecsElapsed : explainSecsElapsed) % 60}s
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(phase === 'research' ? RESEARCH_PRESETS : EXPLAIN_PRESETS).map((p) => {
                    const activePreset =
                      (phase === 'research' ? researchTotalSeconds : explainTotalSeconds) === p.seconds;
                    return (
                      <button
                        key={p.label}
                        onClick={() =>
                          phase === 'research'
                            ? handleSetResearchPreset(p.seconds)
                            : handleSetExplainPreset(p.seconds)
                        }
                        className={`py-1.5 px-1 sm:px-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                          activePreset
                            ? phase === 'research'
                              ? 'bg-teal-500 text-slate-950 shadow-sm'
                              : 'bg-indigo-500 text-white shadow-sm'
                            : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Expanded Notes & Mark as Done Section */}
          {showNotes && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl animate-fade-in max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <FileEdit className="w-4 h-4 text-teal-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">Study Notes & Summary</h3>
                </div>
                <span className="text-[10px] sm:text-[11px] text-slate-400">Autosaved upon completion</span>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down key clinical mechanisms, diagnostic pearls, or oral recall points..."
                className="w-full h-36 sm:h-44 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none leading-relaxed"
              />

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                {sessionCompleted ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Topic Logged to History & Streak!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSaveAttempt}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md active:scale-95 transition-all disabled:opacity-60"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Log Attempt & Boost Streak 🔥'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
