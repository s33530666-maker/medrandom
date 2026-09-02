import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudyStudio } from './components/StudyStudio';
import { HistoryPage } from './components/HistoryPage';
import { TopicBankPage } from './components/TopicBankPage';
import { StreakStats } from './types';
import { fetchStreakStats } from './lib/api';
import { Instagram } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'history' | 'bank'>('studio');
  const [streakStats, setStreakStats] = useState<StreakStats | null>(null);

  const refreshStreak = async () => {
    try {
      const stats = await fetchStreakStats();
      setStreakStats(stats);
    } catch (e) {
      console.warn('Failed to load streak stats:', e);
    }
  };

  useEffect(() => {
    refreshStreak();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakStats={streakStats}
        onRefreshStreak={refreshStreak}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'studio' && (
          <StudyStudio onSessionCompleted={refreshStreak} />
        )}

        {activeTab === 'history' && (
          <HistoryPage onStartStudy={() => setActiveTab('studio')} />
        )}

        {activeTab === 'bank' && <TopicBankPage />}
      </main>

      {/* Simple & Clean Footer with Mostafa Mostafa Instagram Link */}
      <footer className="border-t border-slate-900/80 py-5 bg-slate-950/60 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-slate-400">
            <span>🩺 MedRandom</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Medical Active Recall</span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400">Developed with ❤️ by</span>
            <a
              href="https://www.instagram.com/m.o.s.9.a.f.a?igsi=MTBlbHgzdWIyc214ag=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-teal-400 hover:text-teal-300 font-bold hover:underline transition-colors active:scale-95"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>Mostafa Mostafa</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
