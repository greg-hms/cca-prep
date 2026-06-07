import { useState } from 'react';
import { Trophy, Target, TrendingUp, Brain } from 'lucide-react';
import type { Module, QuizResult } from '../db';

interface Props {
  results: QuizResult[];
  modules: Module[];
}

export default function StatsPage({ results, modules }: Props) {
  const [filter, setFilter] = useState<'all' | 'training' | 'exam' | 'mini'>('all');

  const filtered = filter === 'all' ? results : results.filter(r => r.mode === filter);

  const totalQuizzes = filtered.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(filtered.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / totalQuizzes)
    : 0;
  const bestScore = totalQuizzes > 0
    ? Math.max(...filtered.map(r => Math.round((r.score / r.total) * 100)))
    : 0;
  const totalQuestions = filtered.reduce((sum, r) => sum + r.total, 0);
  const correctAnswers = filtered.reduce((sum, r) => sum + r.score, 0);

  // Module breakdown
  const moduleStats = modules.map(m => {
    const moduleResults = results.filter(r => r.moduleId === m.id && r.mode === 'mini');
    const avg = moduleResults.length > 0
      ? Math.round(moduleResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / moduleResults.length)
      : null;
    return { module: m, avg, count: moduleResults.length };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Statistics</h2>
        <p className="text-text-secondary">Track your progress and performance</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'training', 'exam', 'mini'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-accent text-white' : 'bg-dark-card border border-dark-border hover:border-accent/50'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
            <Target className="w-4 h-4" />
            Quizzes Taken
          </div>
          <p className="text-2xl font-bold">{totalQuizzes}</p>
        </div>
        <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Average Score
          </div>
          <p className="text-2xl font-bold">{avgScore}%</p>
        </div>
        <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
            <Trophy className="w-4 h-4" />
            Best Score
          </div>
          <p className="text-2xl font-bold">{bestScore}%</p>
        </div>
        <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
            <Brain className="w-4 h-4" />
            Questions Answered
          </div>
          <p className="text-2xl font-bold">{totalQuestions}</p>
        </div>
      </div>

      {/* Accuracy */}
      {totalQuestions > 0 && (
        <div className="bg-dark-card rounded-xl p-4 border border-dark-border">
          <h3 className="font-semibold mb-3">Overall Accuracy</h3>
          <div className="h-4 bg-dark-border rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${(correctAnswers / totalQuestions) * 100}%` }}
            />
          </div>
          <p className="text-text-secondary text-sm">
            {correctAnswers} correct out of {totalQuestions} questions ({Math.round((correctAnswers / totalQuestions) * 100)}%)
          </p>
        </div>
      )}

      {/* Module Breakdown */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Module Performance</h3>
        <div className="space-y-2">
          {moduleStats.map(({ module: m, avg, count }) => (
            <div key={m.id} className="bg-dark-card rounded-xl p-3 border border-dark-border flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center text-accent font-bold text-sm">
                {m.order}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{m.title}</p>
                <p className="text-text-secondary text-xs">{count} quizzes taken</p>
              </div>
              {avg !== null ? (
                <div className={`text-lg font-bold ${avg >= 70 ? 'text-success' : avg >= 50 ? 'text-warning' : 'text-danger'}`}>
                  {avg}%
                </div>
              ) : (
                <span className="text-text-secondary text-sm">Not taken</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Results */}
      {filtered.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Recent Results</h3>
          <div className="space-y-2">
            {filtered.slice(0, 10).map((r, idx) => {
              const pct = Math.round((r.score / r.total) * 100);
              const mod = modules.find(m => m.id === r.moduleId);
              return (
                <div key={idx} className="bg-dark-card rounded-xl p-3 border border-dark-border flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {r.mode === 'mini' ? mod?.title || 'Mini Quiz' : r.mode === 'exam' ? 'Exam Simulation' : 'Training'}
                    </p>
                    <p className="text-text-secondary text-xs">
                      {new Date(r.date).toLocaleDateString()} - {r.score}/{r.total}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${pct >= 70 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-danger'}`}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-10">
          <Brain className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No quiz results yet. Start a quiz to see your stats!</p>
        </div>
      )}
    </div>
  );
}
