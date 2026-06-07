import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Module, Flashcard } from '../db';
import { getFlashcards } from '../api';

interface Props {
  module: Module;
  onStartQuiz: (mode: 'mini', m: Module) => void;
  onBack: () => void;
}

export default function ModuleDetail({ module: m, onStartQuiz, onBack }: Props) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  useEffect(() => {
    getFlashcards(m.id).then(setFlashcards);
  }, [m.id]);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to courses
      </button>

      <div>
        <div className="flex items-center gap-2 text-accent text-sm mb-1">
          <span>Module {m.order} of 13</span>
        </div>
        <h2 className="text-2xl font-bold">{m.title}</h2>
        <p className="text-text-secondary mt-1">{m.description}</p>
      </div>

      <button
        onClick={() => onStartQuiz('mini', m)}
        className="w-full bg-accent hover:bg-accent-light text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <CheckCircle className="w-5 h-5" />
        Take Mini Quiz (10 questions)
      </button>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Flashcards</h3>
        {flashcards.map((card, idx) => (
          <div key={card.id} className="bg-dark-card rounded-xl border border-dark-border overflow-hidden">
            <button
              onClick={() => setExpandedCard(expandedCard === idx ? null : idx)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-dark-border/50 transition-colors"
            >
              <span className="font-medium">{card.title}</span>
              {expandedCard === idx ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
            </button>
            {expandedCard === idx && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-text-secondary text-sm leading-relaxed">{card.content}</p>
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">Key Points</p>
                  <ul className="space-y-1">
                    {card.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-accent mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
