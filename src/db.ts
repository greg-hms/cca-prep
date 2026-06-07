import Dexie, { type EntityTable } from 'dexie';

export interface Module {
  id: number;
  title: string;
  slug: string;
  description: string;
  order: number;
}

export interface Flashcard {
  id?: number;
  moduleId: number;
  title: string;
  content: string;
  keyPoints: string[];
  order: number;
}

export interface Question {
  id?: number;
  moduleId: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  id?: number;
  mode: 'training' | 'exam' | 'mini';
  moduleId?: number;
  score: number;
  total: number;
  timeSpent: number;
  date: string;
  answers: { questionId: number; selectedIndex: number; correct: boolean }[];
}

export interface UserProgress {
  id?: number;
  moduleId: number;
  completed: boolean;
  miniQuizBest: number;
  lastStudied: string;
}

const db = new Dexie('CCAFPrep') as Dexie & {
  modules: EntityTable<Module, 'id'>;
  flashcards: EntityTable<Flashcard, 'id'>;
  questions: EntityTable<Question, 'id'>;
  quizResults: EntityTable<QuizResult, 'id'>;
  userProgress: EntityTable<UserProgress, 'id'>;
};

db.version(1).stores({
  modules: '++id, title, slug, order',
  flashcards: '++id, moduleId, order',
  questions: '++id, moduleId, difficulty',
  quizResults: '++id, mode, moduleId, date',
  userProgress: '++id, moduleId',
});

export { db };
