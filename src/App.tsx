import { useState, useEffect } from 'react';
import { Home, BookOpen, Brain, BarChart3, Menu, X } from 'lucide-react';
import { getModules, getQuizResults } from './api';
import type { Module, QuizResult } from './db';
import { seedDatabase } from './seed';
import Dashboard from './pages/Dashboard';
import ModulesList from './pages/ModulesList';
import ModuleDetail from './pages/ModuleDetail';
import QuizMode from './pages/QuizMode';
import StatsPage from './pages/StatsPage';

type Page = 'dashboard' | 'modules' | 'module' | 'quiz' | 'stats';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [quizMode, setQuizMode] = useState<'training' | 'exam' | 'mini'>('training');
  const [results, setResults] = useState<QuizResult[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDatabase()
      .then(() => {
        return Promise.all([
          getModules().then(setModules),
          getQuizResults().then(setResults),
        ]);
      })
      .then(() => setReady(true))
      .catch(err => {
        console.error('Init error:', err);
        setReady(true);
      });
  }, []);

  const refreshResults = () => getQuizResults().then(setResults);

  const navigate = (p: Page) => {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const openModule = (m: Module) => {
    setSelectedModule(m);
    setPage('module');
    setMenuOpen(false);
  };

  const startQuiz = (mode: 'training' | 'exam' | 'mini', module?: Module) => {
    setQuizMode(mode);
    if (module) setSelectedModule(module);
    setPage('quiz');
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur border-b border-dark-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-accent" />
          <h1 className="text-lg font-bold">CCA-F Prep</h1>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-dark-card rounded-lg">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-dark-bg/95 pt-16">
          <nav className="flex flex-col p-4 gap-2">
            {[
              { id: 'dashboard' as Page, label: 'Dashboard', icon: Home },
              { id: 'modules' as Page, label: 'Courses', icon: BookOpen },
              { id: 'stats' as Page, label: 'Statistics', icon: BarChart3 },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center gap-3 p-4 rounded-xl text-left ${page === item.id ? 'bg-accent/20 text-accent' : 'hover:bg-dark-card'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-lg">{item.label}</span>
              </button>
            ))}
            <div className="border-t border-dark-border my-2" />
            <p className="text-text-secondary text-sm px-4 mb-2">Quick Actions</p>
            <button onClick={() => startQuiz('training')} className="flex items-center gap-3 p-4 rounded-xl text-left hover:bg-dark-card">
              <Brain className="w-5 h-5 text-accent" />
              <span>Training Mode</span>
            </button>
            <button onClick={() => startQuiz('exam')} className="flex items-center gap-3 p-4 rounded-xl text-left hover:bg-dark-card">
              <Brain className="w-5 h-5 text-warning" />
              <span>Exam Simulation</span>
            </button>
          </nav>
        </div>
      )}

      {/* Content */}
      <main className="p-4 max-w-2xl mx-auto">
        {!ready ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-text-secondary">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {page === 'dashboard' && (
              <Dashboard modules={modules} results={results} onNavigate={navigate} onStartQuiz={startQuiz} />
            )}
            {page === 'modules' && (
              <ModulesList modules={modules} onSelect={openModule} onStartQuiz={startQuiz} />
            )}
            {page === 'module' && selectedModule && (
              <ModuleDetail module={selectedModule} onStartQuiz={startQuiz} onBack={() => navigate('modules')} />
            )}
            {page === 'quiz' && (
              <QuizMode
                mode={quizMode}
                module={selectedModule}
                onComplete={refreshResults}
                onBack={() => navigate('dashboard')}
              />
            )}
            {page === 'stats' && (
              <StatsPage results={results} modules={modules} />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border px-2 py-2 flex justify-around">
        {[
          { id: 'dashboard' as Page, icon: Home, label: 'Home' },
          { id: 'modules' as Page, icon: BookOpen, label: 'Courses' },
          { id: 'stats' as Page, icon: BarChart3, label: 'Stats' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg ${page === item.id ? 'text-accent' : 'text-text-secondary'}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
