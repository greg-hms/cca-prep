import { ArrowRight, BookOpen } from 'lucide-react';
import type { Module } from '../db';

interface Props {
  modules: Module[];
  onSelect: (m: Module) => void;
  onStartQuiz: (mode: 'mini', m: Module) => void;
}

export default function ModulesList({ modules, onSelect, onStartQuiz }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-1">13 Courses</h2>
        <p className="text-text-secondary">Complete all modules to prepare for the CCA-F exam</p>
      </div>

      <div className="space-y-3">
        {modules.map(m => (
          <div key={m.id} className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
            <button
              onClick={() => onSelect(m)}
              className="w-full p-4 text-left flex items-start gap-3 hover:bg-dark-border/50 transition-colors"
            >
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent font-bold flex-shrink-0">
                {m.order}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{m.title}</h3>
                <p className="text-text-secondary text-sm mt-0.5">{m.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
                  <BookOpen className="w-3 h-3" />
                  <span>Flashcards + Mini Quiz</span>
                </div>
              </div>
            </button>
            <div className="px-4 pb-3 flex gap-2">
              <button
                onClick={() => onSelect(m)}
                className="flex-1 bg-dark-border hover:bg-accent/20 text-text-primary text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Study
              </button>
              <button
                onClick={() => onStartQuiz('mini', m)}
                className="flex-1 bg-accent/20 hover:bg-accent/30 text-accent text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                Mini Quiz
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
