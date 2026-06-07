import { useEffect } from 'react';
import { db } from './db';
import { seedDatabase } from './seed';

export function useSeed() {
  useEffect(() => {
    seedDatabase();
  }, []);
}

export async function getModules() {
  return db.modules.orderBy('order').toArray();
}

export async function getFlashcards(moduleId: number) {
  return db.flashcards.where('moduleId').equals(moduleId).sortBy('order');
}

export async function getQuestions(moduleId?: number) {
  if (moduleId) {
    return db.questions.where('moduleId').equals(moduleId).toArray();
  }
  return db.questions.toArray();
}

export async function getRandomQuestions(count: number) {
  const all = await db.questions.toArray();
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function saveQuizResult(result: Omit<import('./db').QuizResult, 'id'>) {
  return db.quizResults.add(result);
}

export async function getQuizResults() {
  return db.quizResults.orderBy('date').reverse().toArray();
}

export async function getProgress() {
  return db.userProgress.toArray();
}

export async function updateProgress(moduleId: number, data: Partial<import('./db').UserProgress>) {
  const existing = await db.userProgress.where('moduleId').equals(moduleId).first();
  if (existing) {
    await db.userProgress.update(existing.id!, data);
  } else {
    await db.userProgress.add({ moduleId, completed: false, miniQuizBest: 0, lastStudied: new Date().toISOString(), ...data });
  }
}
