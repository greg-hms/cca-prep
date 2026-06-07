import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, Trophy, RotateCcw, Home } from 'lucide-react';
import type { Module, Question } from '../db';
import { getRandomQuestions, getQuestions, saveQuizResult } from '../api';

interface Props {
  mode: 'training' | 'exam' | 'mini';
  module: Module | null;
  onComplete: () => void;
  onBack: () => void;
}

export default function QuizMode({ mode, module: m, onComplete, onBack }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; selectedIndex: number; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(7200); // 120 min in seconds
  const [timerActive, setTimerActive] = useState(false);

  const questionCount = mode === 'mini' ? 10 : 60;

  useEffect(() => {
    const load = async () => {
      let qs: Question[];
      if (mode === 'mini' && m) {
        qs = await getQuestions(m.id);
      } else {
        qs = await getRandomQuestions(questionCount);
      }
      // Shuffle and limit
      qs = qs.sort(() => Math.random() - 0.5).slice(0, questionCount);
      setQuestions(qs);
      setLoading(false);
      if (mode === 'exam') setTimerActive(true);
    };
    load();
  }, [mode, m, questionCount]);

  // Exam timer
  useEffect(() => {
    if (!timerActive || finished) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, finished]);

  const currentQuestion = questions[currentIdx];
  const isCorrect = selectedAnswer === currentQuestion?.correctIndex;

  const handleAnswer = useCallback((idx: number) => {
    if (showExplanation && mode === 'training') return;
    setSelectedAnswer(idx);
    if (mode === 'training') {
      setShowExplanation(true);
    }
  }, [showExplanation, mode]);

  const handleNext = useCallback(async () => {
    if (selectedAnswer === null) return;

    const newAnswer = {
      questionId: currentQuestion.id!,
      selectedIndex: selectedAnswer,
      correct: selectedAnswer === currentQuestion.correctIndex,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentIdx + 1 >= questions.length) {
      // Quiz finished
      setFinished(true);
      setTimerActive(false);
      const timeSpent = mode === 'exam' ? 7200 - timeLeft : 0;
      await saveQuizResult({
        mode,
        moduleId: m?.id,
        score: newAnswers.filter(a => a.correct).length,
        total: questions.length,
        timeSpent,
        date: new Date().toISOString(),
        answers: newAnswers,
      });
      onComplete();
    } else {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  }, [selectedAnswer, currentQuestion, answers, currentIdx, questions, mode, m, timeLeft, onComplete]);

  const handleExamSubmit = useCallback(async () => {
    // Submit all answered questions
    const timeSpent = 7200 - timeLeft;
    await saveQuizResult({
      mode: 'exam',
      moduleId: m?.id,
      score: answers.filter(a => a.correct).length,
      total: questions.length,
      timeSpent,
      date: new Date().toISOString(),
      answers,
    });
    setFinished(true);
    setTimerActive(false);
    onComplete();
  }, [answers, questions, m, timeLeft, onComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-text-secondary">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary mb-4">No questions available.</p>
        <button onClick={onBack} className="text-accent hover:underline">Go back</button>
      </div>
    );
  }

  if (finished) {
    const score = answers.filter(a => a.correct).length;
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 70;

    return (
      <div className="space-y-6 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${passed ? 'bg-success/20' : 'bg-danger/20'}`}>
          {passed ? <Trophy className="w-10 h-10 text-success" /> : <XCircle className="w-10 h-10 text-danger" />}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{mode === 'exam' ? 'Exam Complete!' : 'Quiz Complete!'}</h2>
          <p className="text-text-secondary mt-1">
            {passed ? 'Congratulations! You passed!' : 'Keep studying and try again.'}
          </p>
        </div>
        <div className="bg-dark-card rounded-2xl p-6 border border-dark-border">
          <p className="text-5xl font-bold mb-2" style={{ color: passed ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {score}/{total}
          </p>
          <p className="text-text-secondary">{pct}% correct</p>
          {mode === 'exam' && (
            <p className="text-text-secondary text-sm mt-2">
              Time: {Math.floor((7200 - timeLeft) / 60)}m {(7200 - timeLeft) % 60}s
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 bg-dark-card hover:bg-dark-border border border-dark-border font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-accent hover:bg-accent-light text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" />
          Exit
        </button>
        {mode === 'exam' && (
          <div className={`flex items-center gap-2 font-mono text-lg ${timeLeft < 600 ? 'text-danger' : 'text-text-primary'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-dark-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-text-secondary text-sm whitespace-nowrap">
          {currentIdx + 1}/{questions.length}
        </span>
      </div>

      {/* Question */}
      <div className="bg-dark-card rounded-2xl p-5 border border-dark-border">
        <p className="text-lg font-medium leading-relaxed">{currentQuestion.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {currentQuestion.options.map((option, idx) => {
          let optionStyle = 'bg-dark-card border-dark-border hover:border-accent/50';
          if (selectedAnswer !== null || (mode === 'exam' && showExplanation)) {
            if (idx === currentQuestion.correctIndex) {
              optionStyle = 'bg-success/10 border-success text-success';
            } else if (idx === selectedAnswer && idx !== currentQuestion.correctIndex) {
              optionStyle = 'bg-danger/10 border-danger text-danger';
            } else {
              optionStyle = 'bg-dark-card border-dark-border opacity-50';
            }
          } else if (idx === selectedAnswer) {
            optionStyle = 'bg-accent/10 border-accent';
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${optionStyle}`}
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-dark-border flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option}</span>
                {(selectedAnswer !== null || showExplanation) && idx === currentQuestion.correctIndex && (
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                )}
                {(selectedAnswer !== null || showExplanation) && idx === selectedAnswer && idx !== currentQuestion.correctIndex && (
                  <XCircle className="w-5 h-5 text-danger flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation (training mode) */}
      {showExplanation && mode === 'training' && (
        <div className={`rounded-xl p-4 border ${isCorrect ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'}`}>
          <p className="text-sm font-medium mb-1">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
          <p className="text-text-secondary text-sm">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Next Button */}
      {selectedAnswer !== null && (mode !== 'training' || showExplanation) && (
        <button
          onClick={handleNext}
          className="w-full bg-accent hover:bg-accent-light text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {currentIdx + 1 >= questions.length ? 'Finish Quiz' : 'Next Question'}
        </button>
      )}

      {/* Exam mode: answer all then submit */}
      {mode === 'exam' && selectedAnswer !== null && (
        <div className="space-y-2">
          <button
            onClick={() => {
              const newAnswer = {
                questionId: currentQuestion.id!,
                selectedIndex: selectedAnswer,
                correct: selectedAnswer === currentQuestion.correctIndex,
              };
              setAnswers(prev => [...prev, newAnswer]);
              if (currentIdx + 1 >= questions.length) {
                handleExamSubmit();
              } else {
                setCurrentIdx(prev => prev + 1);
                setSelectedAnswer(null);
              }
            }}
            className="w-full bg-accent hover:bg-accent-light text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            {currentIdx + 1 >= questions.length ? 'Submit Exam' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}
