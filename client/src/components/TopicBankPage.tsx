import { useState, useEffect, type FormEvent } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  X,
  FolderPlus,
  Copy,
  Check,
} from 'lucide-react';
import { Topic, CategoryType, DifficultyType } from '../types';
import { fetchTopics, createTopic } from '../lib/api';
import { getCategoryBadgeClasses, getDifficultyBadgeClasses } from './TopicCard';

export const TopicBankPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryType>('Anatomy');
  const [newDifficulty, setNewDifficulty] = useState<DifficultyType>('medium');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCopy = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const loadTopics = async () => {
    setIsLoading(true);
    try {
      const res = await fetchTopics(selectedCategory, selectedDifficulty, searchTerm);
      setTopics(res.topics);
      setCategoryCounts(res.categoryCounts);
    } catch (e) {
      console.error('Failed to load topics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, [selectedCategory, selectedDifficulty, searchTerm]);

  const handleCreateTopic = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await createTopic({
        title: newTitle.trim(),
        category: newCategory,
        difficulty: newDifficulty,
        description: newDescription.trim() || undefined,
      });

      setSuccessMessage(`Topic "${newTitle}" added to the active bank!`);
      setNewTitle('');
      setNewDescription('');
      setIsAddModalOpen(false);
      loadTopics();

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to create topic');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. Header & Add Action */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Curated Topic Bank</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore 180+ high-yield medical topics or add custom topics directly to your study pool.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 active:scale-95 min-h-[42px]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Custom Topic</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. Filter Bar & Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          {/* Search Field */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic title or key terms..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center space-x-1 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all active:scale-95 ${
                  selectedDifficulty === diff
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff === 'all' ? 'All Levels' : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-800">
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
          ].map((cat) => {
            const count = cat === 'all' ? topics.length : categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{cat === 'all' ? 'All Disciplines' : cat}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat
                        ? 'bg-slate-950 text-teal-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Topics Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-white text-xs sm:text-sm">
            Catalog Pool ({topics.length} topics)
          </span>
          <span className="text-[11px] sm:text-xs text-slate-400">Data-driven • Stored in SQLite</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading topics bank...
          </div>
        ) : topics.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No topics found matching your query.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {topics.map((t) => (
              <div
                key={t.id}
                className="p-4 sm:p-5 sm:px-6 hover:bg-slate-800/40 transition-colors space-y-1.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">{t.title}</h4>
                    <button
                      onClick={() => handleCopy(t.id, t.title)}
                      title="Copy topic title"
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                    >
                      {copiedId === t.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 self-start sm:self-auto">
                    <span
                      className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded border ${getCategoryBadgeClasses(
                        t.category
                      )}`}
                    >
                      {t.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded border ${getDifficultyBadgeClasses(
                        t.difficulty
                      )}`}
                    >
                      {t.difficulty}
                    </span>
                  </div>
                </div>

                {t.description && (
                  <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                    <span className="text-teal-400 font-medium mr-1">Focus:</span>
                    {t.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Add Custom Topic Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white">Add New Medical Topic</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Topic Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Guillain-Barré Syndrome Pathogenesis"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as CategoryType)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  >
                    <option value="Anatomy">Anatomy (تشريح)</option>
                    <option value="Physiology">Physiology (وظائف الأعضاء)</option>
                    <option value="Pathology">Pathology (علم الأمراض)</option>
                    <option value="Pharmacology">Pharmacology (علم الأدوية)</option>
                    <option value="Microbiology">Microbiology (أحياء دقيقة)</option>
                    <option value="Clinical Cases">Clinical Cases (حالات سريرية)</option>
                    <option value="Clinical Nutrition">Clinical Nutrition (تغذية علاجية)</option>
                    <option value="Public Health">Public Health (صحة عامة)</option>
                    <option value="Research & EBM">Research & EBM (منهجية البحث الطبي)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Difficulty *
                  </label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as DifficultyType)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Clinical Focus / Guidance Hints (Optional)
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Key mechanisms to cover, diagnostic criteria, differential diagnoses..."
                  className="w-full h-24 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Adding Topic...' : 'Add Topic to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
