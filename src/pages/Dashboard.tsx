import { Brain, Target, Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import type { Module, QuizResult } from '../db';

interface Props {
  modules: Module[];
  results: QuizResult[];
  onNavigate: (page: 'dashboard' | 'modules' | 'stats') => void;
  onStartQuiz: (mode: 'training' | 'exam' | 'mini', module?: Module) => void;
}

export default function Dashboard({ modules, results, onNavigate, onStartQuiz }: Props) {
  const totalModules = modules.length;
  const studiedModules = new Set(results.filter(r => r.mode === 'mini').map(r => r.moduleId)).size;
  const avgScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / results.length)
    : 0;
  const examResults = results.filter(r => r.mode === 'exam');
  const bestExamScore = examResults.length > 0
    ? Math.max(...examResults.map(r => Math.round((r.score / r.total) * 100)))
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl p-6 border border-accent/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Claude Certified Architect</h2>
            <p className="text-text-secondary text-sm">Foundations (CCA-F) Preparation</p>
          </div>
        </div>
        <p className="text-text-secondary text-sm mb-4">
          13 courses, 156+ practice questions, and exam simulations to help you pass the CCA-F certification.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => onStartQuiz('training')}
            className="flex-1 bg-accent hover:bg-accent-light text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Target className="w-4 h-4" />
            Training
          </button>
          <button
            onClick={() => onStartQuiz('exam')}
            className="flex-1 bg-warning/20 hover:bg-warning/30 text-warning font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            Exam Mode
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
            <Brain className="w-4 h-4" />
            Modules Studied
          </div>
          <p className="text-2xl font-bold">{studiedModules}<span className="text-text-secondary text-lg">/{totalModules}</span></p>
        </div>
        <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Average Score
          </div>
          <p className="text-2xl font-bold">{avgScore}<span className="text-text-secondary text-lg">%</span></p>
        </div>
        <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
            <Target className="w-4 h-4" />
            Quizzes Taken
          </div>
          <p className="text-2xl font-bold">{results.length}</p>
        </div>
        <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
            <Trophy className="w-4 h-4" />
            Best Exam Score
          </div>
          <p className="text-2xl font-bold">{bestExamScore}<span className="text-text-secondary text-lg">%</span></p>
        </div>
      </div>

      {/* Quick Access */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Continue Learning</h3>
          <button onClick={() => onNavigate('modules')} className="text-accent text-sm flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {modules.slice(0, 5).map(m => (
            <button
              key={m.id}
              onClick={() => onStartQuiz('mini', m)}
              className="w-full bg-dark-card hover:bg-dark-border rounded-xl p-4 border border-dark-border text-left flex items-center gap-3 transition-colors"
            >
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center text-accent font-bold text-sm">
                {m.order}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{m.title}</p>
                <p className="text-text-secondary text-xs truncate">{m.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-text-secondary flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Exam Info */}
      <div className="bg-dark-card rounded-xl p-4 border border-warning/20">
        <h3 className="font-semibold text-warning mb-2">Exam Format</h3>
        <ul className="text-text-secondary text-sm space-y-1">
          <li>60 multiple-choice questions</li>
          <li>120 minutes time limit</li>
          <li>Proctored exam (no external resources)</li>
          <li>99 USD per attempt</li>
          <li>Passing score: ~70% (42/60)</li>
        </ul>
      </div>
    </div>
  );
}
